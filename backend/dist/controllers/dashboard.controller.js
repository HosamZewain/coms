"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTasks = exports.getDashboardStats = void 0;
const error_1 = require("../utils/error");
const prisma_1 = require("../utils/prisma");
const activityService = __importStar(require("../services/activity.service"));
exports.getDashboardStats = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const [activeProjects, totalTasks, completedTasks, pendingTasks, teamMembers, recentActivities, attendanceRecords, activeLeaves, totalEmployees, allHolidays, allUsersWithBirthdays, recentAwards] = await Promise.all([
        // System Stats
        prisma_1.prisma.project.count({ where: { status: 'ACTIVE' } }),
        prisma_1.prisma.task.count(),
        prisma_1.prisma.task.count({ where: { status: 'DONE' } }),
        prisma_1.prisma.task.count({ where: { status: { not: 'DONE' } } }),
        prisma_1.prisma.user.count(),
        // Recent Activities
        activityService.getRecentActivities(10),
        // Attendance Today - USE checkInTime for consistency with reporting
        prisma_1.prisma.attendanceRecord.findMany({
            where: {
                checkInTime: {
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
        prisma_1.prisma.leaveRequest.findMany({
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
        prisma_1.prisma.user.count(),
        // Upcoming Holidays (Next 30 days)
        prisma_1.prisma.holiday.findMany({
            where: {
                date: {
                    gte: now,
                    lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
                }
            },
            orderBy: { date: 'asc' }
        }),
        // Upcoming Birthdays
        prisma_1.prisma.user.findMany({
            where: {
                employeeProfile: {
                    dateOfBirth: { not: null }
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeProfile: {
                    select: {
                        dateOfBirth: true,
                        profileImage: true
                    }
                }
            }
        }),
        // Recent Awards
        prisma_1.prisma.award.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        employeeProfile: { select: { profileImage: true } }
                    }
                },
                awardType: true
            }
        })
    ]);
    // Process Upcoming Events (Birthdays + Holidays in next 30 days)
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingEvents = [];
    // Add Holidays
    allHolidays.forEach(h => {
        upcomingEvents.push({
            id: h.id,
            type: 'HOLIDAY',
            title: h.name,
            date: h.date,
            isBirthday: false
        });
    });
    // Add Birthdays
    allUsersWithBirthdays.forEach(u => {
        if (!u.employeeProfile?.dateOfBirth)
            return;
        const dob = new Date(u.employeeProfile.dateOfBirth);
        const birthdayThisYear = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
        // If birthday already passed this year, check next year
        if (birthdayThisYear < todayStart) {
            birthdayThisYear.setFullYear(now.getFullYear() + 1);
        }
        if (birthdayThisYear <= thirtyDaysLater) {
            upcomingEvents.push({
                id: u.id,
                type: 'BIRTHDAY',
                title: `${u.firstName} ${u.lastName}'s Birthday`,
                date: birthdayThisYear,
                isBirthday: true,
                user: {
                    id: u.id,
                    name: `${u.firstName} ${u.lastName}`,
                    image: u.employeeProfile.profileImage
                }
            });
        }
    });
    // Sort events by date
    upcomingEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    // Process Attendance with Unique Users
    const presentUserIds = new Set(attendanceRecords.map(r => r.userId));
    const lateUserIds = new Set(attendanceRecords
        .filter(r => r.status === 'LATE')
        .map(r => r.userId));
    const onLeaveUserIds = new Set(activeLeaves.map(l => l.userId));
    const presentCount = presentUserIds.size;
    const lateCount = lateUserIds.size;
    const onLeaveCount = onLeaveUserIds.size;
    // Absent count: Total - (Present OR On Leave)
    // We use a Set to combine present and on-leave users to avoid double counting 
    // (though logically one shouldn't be both, it's safer)
    const activeOrLeaveUserIds = new Set([...presentUserIds, ...onLeaveUserIds]);
    const absentCount = totalEmployees - activeOrLeaveUserIds.size;
    // Process Work Locations (Unique users, take latest record's location)
    const userLatestRecord = new Map();
    attendanceRecords.forEach(r => {
        // Since records are from findMany (likely in order of creation or primary key), 
        // we can store and the last one seen for a user will be the "latest" in this set.
        // If we wanted to be explicit, we could sort attendanceRecords by checkInTime first.
        userLatestRecord.set(r.userId, r.checkInLocation);
    });
    const workLocation = {
        office: Array.from(userLatestRecord.values()).filter(loc => loc === 'OFFICE').length,
        home: Array.from(userLatestRecord.values()).filter(loc => ['HOME', 'REMOTE'].includes(loc)).length,
        undefined: Array.from(userLatestRecord.values()).filter(loc => !['OFFICE', 'HOME', 'REMOTE'].includes(loc)).length
    };
    // Process Active Employees (Logged In - Unique Users)
    // Only those currently checked in (no checkOutTime)
    const currentlyCheckedIn = new Map();
    attendanceRecords
        .filter(r => !r.checkOutTime)
        .forEach(r => {
        currentlyCheckedIn.set(r.userId, {
            userId: r.user.id,
            userName: `${r.user.firstName} ${r.user.lastName}`,
            checkInTime: r.checkInTime,
            location: r.checkInLocation,
            currentTask: r.checkInTask || 'Working on general tasks',
            projectId: r.checkInProjectId
        });
    });
    const activeEmployees = Array.from(currentlyCheckedIn.values());
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
            },
            upcomingEvents,
            recentAwards
        }
    });
});
exports.getMyTasks = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.json({ status: 'success', data: [] });
    }
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const tasks = await prisma_1.prisma.task.findMany({
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
