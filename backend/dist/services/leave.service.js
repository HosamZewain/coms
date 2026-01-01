"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserBalance = exports.getUserBalances = exports.deleteLeaveRequest = exports.updateLeaveStatus = exports.getAllLeaves = exports.getMyLeaves = exports.getLeaveTypes = exports.createLeaveRequest = void 0;
const prisma_1 = require("../utils/prisma");
const error_1 = require("../utils/error");
const createLeaveRequest = async (userId, data) => {
    let { leaveTypeId, type, startDate, endDate, reason, status } = data;
    // Handle legacy/frontend type mapping
    if (!leaveTypeId && type) {
        let typeName = '';
        if (type === 'NORMAL')
            typeName = 'Annual Leave';
        else if (type === 'SICK')
            typeName = 'Sick Leave';
        else if (type === 'CASUAL')
            typeName = 'Casual Leave';
        if (typeName) {
            let leaveType = await prisma_1.prisma.leaveType.findFirst({ where: { name: typeName } });
            // Auto-create Casual Leave if missing and requested
            if (!leaveType && typeName === 'Casual Leave') {
                leaveType = await prisma_1.prisma.leaveType.create({ data: { name: 'Casual Leave', defaultDays: 7 } });
            }
            if (leaveType) {
                leaveTypeId = leaveType.id;
            }
        }
    }
    // Fallback if still no ID
    if (!leaveTypeId) {
        // Try finding Annual Leave as default
        const defaultType = await prisma_1.prisma.leaveType.findFirst({ where: { name: 'Annual Leave' } });
        if (defaultType)
            leaveTypeId = defaultType.id;
        else
            throw new error_1.AppError('Invalid Leave Type', 400);
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new error_1.AppError('Invalid start or end date', 400);
    }
    // Basic Validation: Ensure start date is before end date
    if (start > end) {
        throw new error_1.AppError('End date must be after start date', 400);
    }
    return await prisma_1.prisma.leaveRequest.create({
        data: {
            userId,
            leaveTypeId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            reason,
            status: status || 'PENDING'
        }
    });
};
exports.createLeaveRequest = createLeaveRequest;
const getLeaveTypes = async () => {
    // Auto-seed if empty
    const count = await prisma_1.prisma.leaveType.count();
    if (count === 0) {
        await prisma_1.prisma.leaveType.createMany({
            data: [
                { name: 'Annual Leave', defaultDays: 21 },
                { name: 'Sick Leave', defaultDays: 14 },
                { name: 'Unpaid Leave', defaultDays: 0 },
                { name: 'Remote Work', defaultDays: 4 }, // Added for the UI demo
            ]
        });
    }
    return await prisma_1.prisma.leaveType.findMany();
};
exports.getLeaveTypes = getLeaveTypes;
const getMyLeaves = async (userId) => {
    return await prisma_1.prisma.leaveRequest.findMany({
        where: { userId },
        include: { leaveType: true },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getMyLeaves = getMyLeaves;
const getAllLeaves = async (currentUserId) => {
    let whereClause = {};
    if (currentUserId) {
        const currentUser = await prisma_1.prisma.user.findUnique({
            where: { id: currentUserId },
            include: {
                role: true,
                managedDepartments: true,
                ledTeam: true
            }
        });
        if (currentUser) {
            const roleName = currentUser.role?.name;
            // Admin and HR see everything
            if (roleName === 'Admin' || roleName === 'HR') {
                whereClause = {};
            }
            // Managers see employees in their departments (direct members or team members in those depts)
            else if (roleName === 'Manager' || roleName === 'Director') {
                const deptIds = currentUser.managedDepartments.map(d => d.id);
                if (deptIds.length > 0) {
                    whereClause = {
                        user: {
                            OR: [
                                { departmentId: { in: deptIds } },
                                { team: { departmentId: { in: deptIds } } }
                            ]
                        }
                    };
                }
                else {
                    // Fallback: if manager has no departments, maybe show nothing or just their own? 
                    // Let's show nothing to be safe, or maybe they just see their team?
                    // Let's check team leadership too
                    if (currentUser.ledTeam) {
                        whereClause = { user: { teamId: currentUser.ledTeam.id } };
                    }
                    else {
                        return []; // No access
                    }
                }
            }
            // Team Leaders see their team members
            else if (roleName === 'TeamLeader') {
                if (currentUser.ledTeam) {
                    whereClause = { user: { teamId: currentUser.ledTeam.id } };
                }
                else {
                    return [];
                }
            }
            // Employees shouldn't hit this endpoint ideally, but if they do, show only theirs
            else {
                whereClause = { userId: currentUserId };
            }
        }
    }
    return await prisma_1.prisma.leaveRequest.findMany({
        where: whereClause,
        include: {
            user: { select: { firstName: true, lastName: true, email: true, employeeProfile: { select: { profileImage: true } } } },
            leaveType: true,
            approver: { select: { firstName: true, lastName: true, email: true, employeeProfile: { select: { profileImage: true } } } }
        },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getAllLeaves = getAllLeaves;
const updateLeaveStatus = async (id, status, approverId) => {
    return await prisma_1.prisma.leaveRequest.update({
        where: { id },
        data: {
            status,
            approverId: status === 'APPROVED' ? approverId : null
        }
    });
};
exports.updateLeaveStatus = updateLeaveStatus;
const deleteLeaveRequest = async (id) => {
    return await prisma_1.prisma.leaveRequest.delete({ where: { id } });
};
exports.deleteLeaveRequest = deleteLeaveRequest;
const getUserBalances = async (userId, year = new Date().getFullYear()) => {
    // 1. Get all leave types
    const leaveTypes = await (0, exports.getLeaveTypes)();
    // 2. Get existing balances for this user/year
    const existingBalances = await prisma_1.prisma.leaveBalance.findMany({
        where: { userId, year },
        include: { leaveType: true }
    });
    // 3. Merge: Ensure every leave type has a balance record
    // If not, we don't necessarily need to create it in DB yet, but we should return it to UI
    // Or better, create it if missing so we have a record to update later? 
    // Let's create missing records to keep it simple and persistent.
    const balances = await Promise.all(leaveTypes.map(async (type) => {
        const existing = existingBalances.find(b => b.leaveTypeId === type.id);
        if (existing)
            return existing;
        // Create default
        return await prisma_1.prisma.leaveBalance.create({
            data: {
                userId,
                leaveTypeId: type.id,
                year,
                balance: type.defaultDays
            },
            include: { leaveType: true }
        });
    }));
    return balances;
};
exports.getUserBalances = getUserBalances;
const updateUserBalance = async (userId, leaveTypeId, balance, year = new Date().getFullYear()) => {
    return await prisma_1.prisma.leaveBalance.upsert({
        where: {
            userId_leaveTypeId_year: {
                userId,
                leaveTypeId,
                year
            }
        },
        update: {
            balance: parseFloat(balance.toString())
        },
        create: {
            userId,
            leaveTypeId,
            year,
            balance: parseFloat(balance.toString())
        }
    });
};
exports.updateUserBalance = updateUserBalance;
