import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import { prisma } from '../utils/prisma';
import * as activityService from '../services/activity.service';

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStart = new Date(todayStr); // 00:00:00
    const todayEnd = new Date(todayStr);
    todayEnd.setHours(23, 59, 59, 999);

    const [
        activeProjects,
        totalTasks,
        completedTasks,
        pendingTasks,
        teamMembers,
        recentActivities,
        attendanceRecords,
        activeLeaves,
        totalEmployees
    ] = await Promise.all([
        // System Stats
        prisma.project.count({ where: { status: 'ACTIVE' } }),
        prisma.task.count(),
        prisma.task.count({ where: { status: 'DONE' } }),
        prisma.task.count({ where: { status: { not: 'DONE' } } }),
        prisma.user.count(),

        // Recent Activities
        activityService.getRecentActivities(10),

        // Attendance Today
        prisma.attendanceRecord.findMany({
            where: {
                date: {
                    gte: todayStart,
                    lte: todayEnd
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        }),

        // Active Leaves Today
        prisma.leaveRequest.findMany({
            where: {
                startDate: { lte: todayEnd },
                endDate: { gte: todayStart },
                status: 'APPROVED'
            },
            include: {
                user: { select: { id: true } },
                leaveType: { select: { name: true } }
            }
        }),

        // Total Employees (for absent calculation)
        prisma.user.count()
    ]);

    // Process Attendance
    const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length;
    const onLeaveCount = activeLeaves.length;
    const absentCount = totalEmployees - (presentCount + onLeaveCount);

    // Process Work Locations
    const workLocation = {
        office: attendanceRecords.filter(r => r.checkInLocation === 'OFFICE').length,
        home: attendanceRecords.filter(r => r.checkInLocation === 'HOME' || r.checkInLocation === 'REMOTE').length,
        undefined: attendanceRecords.filter(r => !['OFFICE', 'HOME', 'REMOTE'].includes(r.checkInLocation)).length
    };

    // Process Active Employees (Logged In)
    // Assuming "Logged In" means checked in today and NOT checked out yet
    const activeEmployees = attendanceRecords
        .filter(r => !r.checkOutTime)
        .map(r => ({
            userId: r.user.id,
            userName: `${r.user.firstName} ${r.user.lastName}`,
            checkInTime: r.checkInTime,
            location: r.checkInLocation,
            currentTask: r.checkInTask || 'Working on general tasks',
            projectId: r.checkInProjectId
        }));

    res.json({
        status: 'success',
        data: {
            attendance: {
                present: presentCount,
                absent: Math.max(0, absentCount),
                late: lateCount,
                onLeave: onLeaveCount,
                totalEmployees
            },
            workLocation,
            activeEmployees,
            leaves: {
                approvedToday: onLeaveCount,
                activeRequests: activeLeaves
            },
            system: {
                activeProjects,
                totalTasks,
                completedTasks,
                pendingTasks,
                teamMembers,
                recentActivities
            }
        }
    });
});

export const getMyTasks = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.json({ status: 'success', data: [] });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

    const tasks = await prisma.task.findMany({
        where: {
            assignments: {
                some: { userId }
            }
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            project: {
                select: { id: true, name: true }
            }
        }
    });

    res.json({ status: 'success', data: tasks });
});
