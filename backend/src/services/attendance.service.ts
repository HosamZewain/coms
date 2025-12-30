import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';
import * as settingsService from './settings.service';

// const prisma = new PrismaClient();

interface PunchData {
    location: 'OFFICE' | 'HOME';
    ipAddress?: string;
    projectId: string;
    task: string;
    notes?: string;
}

export const punchIn = async (userId: string, data: PunchData) => {
    // Check if already checked in
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await prisma.attendanceRecord.findFirst({
        where: {
            userId,
            date: { gte: today },
            checkOutTime: null
        }
    });

    if (existing) {
        throw new AppError('Already punched in', 400);
    }

    // Check Settings
    const userProfile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (data.location === 'HOME' && userProfile && userProfile.workOutsideOfficeAllowed === false) {
        throw new AppError('Work from home is not allowed for your account', 403);
    }

    // IP Validation
    if (data.location === 'OFFICE') {
        const allowedIpsStr = await settingsService.getSetting('ALLOWED_OFFICE_IPS');
        if (allowedIpsStr) {
            const allowedIps = allowedIpsStr.split(',').map(ip => ip.trim());
            if (data.ipAddress && !allowedIps.includes(data.ipAddress)) {
                throw new AppError('IP Address not allowed for Office Login', 403);
            }
        }
    }

    return await prisma.attendanceRecord.create({
        data: {
            userId,
            checkInTime: new Date(),
            checkInLocation: data.location,
            checkInIp: data.ipAddress,
            checkInProjectId: data.projectId,
            checkInTask: data.task,
            checkInNotes: data.notes,
            status: 'PRESENT'
        }
    });
};

export const punchOut = async (userId: string, data: PunchData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.attendanceRecord.findFirst({
        where: {
            userId,
            checkOutTime: null
        },
        orderBy: {
            checkInTime: 'desc'
        }
    });

    if (!record) {
        throw new AppError('No active check-in found', 404);
    }

    return await prisma.attendanceRecord.update({
        where: { id: record.id },
        data: {
            checkOutTime: new Date(),
            checkOutLocation: data.location,
            checkOutIp: data.ipAddress,
            checkOutProjectId: data.projectId,
            checkOutTask: data.task,
            checkOutNotes: data.notes
        }
    });
};

export const getDailyReport = async (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Fetch All Employees (excluding admins if preferred, but usually report includes everyone)
    // 1. Fetch All Employees
    const employees = await prisma.user.findMany({
        include: { employeeProfile: true, role: true }
    });

    // 2. Fetch Attendance Records for the day
    // 2. Fetch Attendance Records for the day (including overlapping sessions from previous days)
    const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
            AND: [
                { checkInTime: { lte: endOfDay } },
                {
                    OR: [
                        { checkOutTime: { gte: startOfDay } },
                        { checkOutTime: null }
                    ]
                }
            ]
        }
    });

    // 3. Fetch Approved Leave Requests overlapping the day
    const leaves = await prisma.leaveRequest.findMany({
        where: {
            startDate: { lte: endOfDay },
            endDate: { gte: startOfDay },
            status: 'APPROVED'
        },
        include: { leaveType: true }
    });

    // Combining data
    const report = employees.map(emp => {
        const empRecords = attendanceRecords.filter(r => r.userId === emp.id);
        const empLeave = leaves.find(l => l.userId === emp.id);

        let status = 'ABSENT';
        let leaveDetails = null;

        // Check Attendance
        if (empRecords.length > 0) {
            status = 'PRESENT';
        } else if (empLeave) {
            status = 'ON_LEAVE';
            leaveDetails = empLeave;
        } else {
            // Check if Attendance Required
            if (emp.employeeProfile?.attendanceRequired === false) {
                status = 'NOT_REQUIRED';
            }
        }

        return {
            userId: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            jobTitle: emp.employeeProfile?.jobTitle,
            status,
            records: empRecords, // Multiple punches
            totalDuration: empRecords.reduce((acc, r) => {
                if (r.checkOutTime) {
                    return acc + (new Date(r.checkOutTime).getTime() - new Date(r.checkInTime).getTime());
                }
                return acc;
            }, 0),
            leaveDetails
        };
    });

    return report;
};

export const getMyAttendance = async (userId: string) => {
    return await prisma.attendanceRecord.findMany({
        where: { userId },
        orderBy: { checkInTime: 'desc' },
        take: 30
    });
};

export const getAttendanceStats = async (userId: string) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const records = await prisma.attendanceRecord.findMany({
        where: {
            userId,
            date: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        }
    });

    const presentDays = records.length;

    // Late Arrivals (Assumed > 9:15 AM)
    const lateArrivals = records.filter(r => {
        const checkIn = new Date(r.checkInTime);
        return checkIn.getHours() > 9 || (checkIn.getHours() === 9 && checkIn.getMinutes() > 15);
    }).length;

    // Leaves
    const leaves = await prisma.leaveRequest.count({
        where: {
            userId,
            status: 'APPROVED',
            startDate: { gte: startOfMonth },
            endDate: { lte: endOfMonth }
        }
    });

    return {
        presentDays,
        absences: 0, // Placeholder, tough to calc without shift data
        lateArrivals,
        leaves
    };
};

export const addManualAttendance = async (userId: string, data: any) => {
    const { date, checkInTime, checkOutTime, note } = data;

    const checkIn = new Date(date);
    checkIn.setHours(0, 0, 0, 0);
    const [inHours, inMinutes] = checkInTime.split(':');
    checkIn.setHours(parseInt(inHours), parseInt(inMinutes), 0, 0);

    let checkOut = null;
    if (checkOutTime) {
        checkOut = new Date(date);
        checkOut.setHours(0, 0, 0, 0);
        const [outHours, outMinutes] = checkOutTime.split(':');
        checkOut.setHours(parseInt(outHours), parseInt(outMinutes), 0, 0);
    }

    return await prisma.attendanceRecord.create({
        data: {
            userId,
            checkInTime: checkIn,
            checkInLocation: 'OFFICE',
            checkInNotes: `Manual Entry: ${note || ''}`,
            checkOutTime: checkOut,
            checkOutLocation: checkOut ? 'OFFICE' : null,
            checkOutNotes: checkOut ? `Manual Entry` : null
        }
    });
};
