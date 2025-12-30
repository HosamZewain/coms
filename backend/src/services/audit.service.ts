import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';

// const prisma = new PrismaClient();

export const logAction = async (
    userId: string,
    action: string,
    resource: string,
    details?: Record<string, any>,
    ipAddress?: string
) => {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                resource,
                details: details ? JSON.stringify(details) : undefined,
                ipAddress
            }
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw error to avoid breaking the main flow
    }
};

export const getAuditLogs = async (limit = 100, offset = 0) => {
    return await prisma.auditLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } }
    });
};
