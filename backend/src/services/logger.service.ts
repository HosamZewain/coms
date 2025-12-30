import { prisma } from '../utils/prisma';

export const logAction = async (
    userId: string | null,
    action: string,
    resource: string,
    details: any = null,
    ipAddress: string | null = null
) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                resource,
                details: details ? JSON.stringify(details) : null,
                ipAddress
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Do not throw, logging failure should not break the app
    }
};

export const getLogs = async (limit = 100) => {
    return await prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } }
    });
};
