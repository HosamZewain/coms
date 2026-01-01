"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskActivities = exports.getUserActivities = exports.getRecentActivities = exports.logActivity = void 0;
const prisma_1 = require("../utils/prisma");
const logActivity = async (data) => {
    return await prisma_1.prisma.taskActivity.create({
        data: {
            taskId: data.taskId,
            actorUserId: data.actorUserId,
            action: data.action,
            meta: data.meta ? JSON.stringify(data.meta) : null
        }
    });
};
exports.logActivity = logActivity;
const getRecentActivities = async (limit = 20) => {
    return await prisma_1.prisma.taskActivity.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            actor: {
                select: { id: true, firstName: true, lastName: true }
            },
            task: {
                select: { id: true, title: true, projectId: true }
            }
        }
    });
};
exports.getRecentActivities = getRecentActivities;
const getUserActivities = async (userId, limit = 10) => {
    return await prisma_1.prisma.taskActivity.findMany({
        where: { actorUserId: userId },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            task: {
                select: { id: true, title: true, projectId: true }
            }
        }
    });
};
exports.getUserActivities = getUserActivities;
const getTaskActivities = async (taskId) => {
    return await prisma_1.prisma.taskActivity.findMany({
        where: { taskId },
        orderBy: { createdAt: 'desc' },
        include: {
            actor: {
                select: { id: true, firstName: true, lastName: true }
            }
        }
    });
};
exports.getTaskActivities = getTaskActivities;
