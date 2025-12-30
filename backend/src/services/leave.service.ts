import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';

export const createLeaveRequest = async (userId: string, data: any) => {
    const { leaveTypeId, startDate, endDate, reason, status } = data;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AppError('Invalid start or end date', 400);
    }

    // Basic Validation: Ensure start date is before end date
    if (start > end) {
        throw new AppError('End date must be after start date', 400);
    }

    return await prisma.leaveRequest.create({
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

export const getLeaveTypes = async () => {
    // Auto-seed if empty
    const count = await prisma.leaveType.count();
    if (count === 0) {
        await prisma.leaveType.createMany({
            data: [
                { name: 'Annual Leave', defaultDays: 21 },
                { name: 'Sick Leave', defaultDays: 14 },
                { name: 'Unpaid Leave', defaultDays: 0 },
                { name: 'Remote Work', defaultDays: 4 }, // Added for the UI demo
            ]
        });
    }

    return await prisma.leaveType.findMany();
};

export const getMyLeaves = async (userId: string) => {
    return await prisma.leaveRequest.findMany({
        where: { userId },
        include: { leaveType: true },
        orderBy: { createdAt: 'desc' }
    });
};

export const getAllLeaves = async () => {
    return await prisma.leaveRequest.findMany({
        include: {
            user: { select: { firstName: true, lastName: true, email: true } },
            leaveType: true
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const updateLeaveStatus = async (id: string, status: string, approverId: string) => {
    return await prisma.leaveRequest.update({
        where: { id },
        data: {
            status,
            approverId: status === 'APPROVED' ? approverId : null
        }
    });
};

export const deleteLeaveRequest = async (id: string) => {
    return await prisma.leaveRequest.delete({ where: { id } });
};
