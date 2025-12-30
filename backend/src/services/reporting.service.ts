import { prisma } from '../utils/prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export const getDashboardStats = async (user: any) => {
    let scope: any = {};

    // 1. Determine Scope based on Role
    if (user.role.name === 'Admin' || user.role.name === 'Director' || user.role.name === 'HR') {
        scope = {}; // Global access
    } else if (user.role.name === 'Manager') {
        // Find department managed by user
        const dept = await prisma.department.findFirst({ where: { managerId: user.id } });
        if (dept) {
            scope = {
                team: { departmentId: dept.id }
            };
        } else {
            scope = { id: 'no-access' }; // Should not happen if data is consistent
        }
    } else if (user.role.name === 'TeamLeader') {
        // Find team led by user
        const team = await prisma.team.findUnique({ where: { leaderId: user.id } });
        if (team) {
            scope = { teamId: team.id };
        }
    } else {
        // Employee - Self only
        scope = { id: user.id };
    }

    // 2. Fetch Users in Scope
    const employees = await prisma.user.findMany({
        where: scope,
        include: {
            role: true,
            employeeProfile: true
        }
    });

    const totalEmployees = employees.length;

    // 3. Fetch Attendance for Today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
            userId: { in: employees.map(e => e.id) },
            date: {
                gte: todayStart,
                lte: todayEnd
            }
        }
    });

    // 4. Fetch Active Leaves for Today
    const activeLeaves = await prisma.leaveRequest.findMany({
        where: {
            userId: { in: employees.map(e => e.id) },
            status: 'APPROVED',
            startDate: { lte: todayEnd },
            endDate: { gte: todayStart }
        },
        include: {
            leaveType: true
        }
    });

    // 5. Categorize Employees
    const office: any[] = [];
    const remote: any[] = [];
    const leave: any[] = [];
    const absent: any[] = [];

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    employees.forEach(emp => {
        const attendance = attendanceRecords.find(a => a.userId === emp.id);
        const leaveReq = activeLeaves.find(l => l.userId === emp.id);

        const empData = {
            id: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            role: emp.role?.name || 'Employee',
            avatar: emp.employeeProfile?.profileImage
        };

        if (leaveReq) {
            leave.push({
                ...empData,
                type: leaveReq.leaveType.name
            });
        } else if (attendance) {
            if (attendance.checkInLocation === 'HOME' || attendance.checkInLocation === 'REMOTE') {
                remote.push({
                    ...empData,
                    time: formatTime(attendance.checkInTime)
                });
            } else {
                office.push({
                    ...empData,
                    time: formatTime(attendance.checkInTime)
                });
            }
        } else {
            // Not on leave, no attendance record yet
            absent.push(empData);
        }
    });

    return {
        totalEmployees,
        presentToday: office.length + remote.length,
        scope: user.role.name,
        details: {
            office,
            remote,
            leave,
            absent
        }
    };
};

export const getLeaveStats = async (user: any) => {
    // Similar scoping logic...
    return { pendingRequests: 0, test: 'mock' };
};
