import { prisma } from '../utils/prisma';

export const createOvertimeRequest = async (userId: string, data: any) => {
    return await prisma.overtimeRequest.create({
        data: {
            userId,
            date: new Date(data.date),
            hours: parseFloat(data.hours),
            reason: data.reason
        }
    });
};

export const getAllOvertimeRequests = async () => {
    return await prisma.overtimeRequest.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    employeeProfile: {
                        select: {
                            profileImage: true
                        }
                    }
                }
            },
            approver: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    employeeProfile: { select: { profileImage: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getMyOvertimeRequests = async (userId: string) => {
    return await prisma.overtimeRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

export const updateOvertimeStatus = async (id: string, status: string, approverId: string) => {
    return await prisma.overtimeRequest.update({
        where: { id },
        data: {
            status,
            approverId
        }
    });
};
