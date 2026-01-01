import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';
import * as companyService from './company.service';
import * as settingsService from './settings.service'; // Keeping this if other methods use it, but switching to companyService for unified settings
// Actually, let's use companyService since that's where getSettings is defined in previous context.


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
        const settings = await companyService.getSettings(['office_ip']);
        const allowedIp = settings['office_ip'];

        if (allowedIp && typeof allowedIp === 'string' && allowedIp.trim().length > 0) {
            const currentIp = data.ipAddress || '';
            const normalizedAllowed = allowedIp.trim();

            // Allow multiple IPs separated by comma if needed, but requirements imply singular "office IP"
            // Let's support comma-separated just in case.
            const allowedIps = normalizedAllowed.split(',').map(ip => ip.trim());

            if (!allowedIps.includes(currentIp)) {
                throw new AppError(`Invalid Location: Your IP (${currentIp}) does not match the registered Office IP.`, 403);
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

    // IP Validation for Punch Out (Optional, but good for consistency)
    if (data.location === 'OFFICE') {
        const settings = await companyService.getSettings(['office_ip']);
        const allowedIp = settings['office_ip'];

        if (allowedIp && typeof allowedIp === 'string' && allowedIp.trim().length > 0) {
            const currentIp = data.ipAddress || '';
            const allowedIps = allowedIp.split(',').map(ip => ip.trim());
            if (!allowedIps.includes(currentIp)) {
                throw new AppError(`Invalid Location: Your IP (${currentIp}) does not match the registered Office IP.`, 403);
            }
        }
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

    // 1. Fetch All Employees
    const employees = await prisma.user.findMany({
        include: {
            employeeProfile: {
                include: { workRegulation: true }
            },
            role: true
        }
    });

    // 2. Fetch Attendance Records for the day
    // Filtering by checkInTime to match dashboard logic and ensure data reset at midnight
    const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
            checkInTime: {
                gte: startOfDay,
                lte: endOfDay
            }
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

export const getEmployeeMonthlyReport = async (employeeId: string, startDate: Date, endDate: Date) => {
    // Normalize dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch attendance records for the employee in the date range
    const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
            userId: employeeId,
            checkInTime: {
                gte: start,
                lte: end
            }
        },
        orderBy: { checkInTime: 'asc' }
    });

    // Fetch approved leaves for the employee in the date range
    const leaves = await prisma.leaveRequest.findMany({
        where: {
            userId: employeeId,
            status: 'APPROVED',
            startDate: { lte: end },
            endDate: { gte: start }
        },
        include: { leaveType: true }
    });

    // Fetch holidays in the date range
    const holidays = await prisma.holiday.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            }
        }
    });

    // Group attendance records by date
    const recordsByDate: { [key: string]: any[] } = {};
    attendanceRecords.forEach(record => {
        const dateKey = new Date(record.checkInTime).toISOString().split('T')[0];
        if (!recordsByDate[dateKey]) {
            recordsByDate[dateKey] = [];
        }
        recordsByDate[dateKey].push(record);
    });

    // Build daily report
    const dailyReports: any[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const dayOfWeek = currentDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dayRecords = recordsByDate[dateKey] || [];

        // Check if it's a holiday
        const holiday = holidays.find(h =>
            new Date(h.date).toISOString().split('T')[0] === dateKey
        );

        // Check if employee is on leave
        const leave = leaves.find(l =>
            new Date(l.startDate) <= currentDate && new Date(l.endDate) >= currentDate
        );

        let status = 'ABSENT';
        let leaveDetails = null;

        if (dayRecords.length > 0) {
            status = 'PRESENT';
        } else if (holiday) {
            status = 'HOLIDAY';
        } else if (leave) {
            status = 'ON_LEAVE';
            leaveDetails = leave;
        } else if (isWeekend) {
            status = 'WEEKEND';
        }

        // Calculate total duration for the day
        const totalDuration = dayRecords.reduce((acc, r) => {
            if (r.checkOutTime) {
                return acc + (new Date(r.checkOutTime).getTime() - new Date(r.checkInTime).getTime());
            }
            return acc;
        }, 0);

        dailyReports.push({
            date: new Date(currentDate),
            status,
            records: dayRecords,
            totalDuration,
            leaveDetails
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dailyReports;
};
