"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.logAction = void 0;
const prisma_1 = require("../utils/prisma");
// const prisma = new PrismaClient();
const logAction = async (userId, action, resource, details, ipAddress) => {
    try {
        await prisma_1.prisma.auditLog.create({
            data: {
                userId,
                action,
                resource,
                details: details ? JSON.stringify(details) : undefined,
                ipAddress
            }
        });
    }
    catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw error to avoid breaking the main flow
    }
};
exports.logAction = logAction;
const getAuditLogs = async (limit = 100, offset = 0) => {
    return await prisma_1.prisma.auditLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, firstName: true, lastName: true } } }
    });
};
exports.getAuditLogs = getAuditLogs;
