"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogs = exports.logAction = void 0;
const prisma_1 = require("../utils/prisma");
const logAction = async (userId, action, resource, details = null, ipAddress = null) => {
    try {
        await prisma_1.prisma.auditLog.create({
            data: {
                userId,
                action,
                resource,
                details: details ? JSON.stringify(details) : null,
                ipAddress
            }
        });
    }
    catch (error) {
        console.error('Failed to create audit log:', error);
        // Do not throw, logging failure should not break the app
    }
};
exports.logAction = logAction;
const getLogs = async (limit = 100) => {
    return await prisma_1.prisma.auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } }
    });
};
exports.getLogs = getLogs;
