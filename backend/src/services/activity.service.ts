import { prisma } from '../utils/prisma';

interface ActivityData {
    taskId: string;
    actorUserId: string;
    action: string;
    meta?: object;
}

export const logActivity = async (data: ActivityData) => {
    return await prisma.taskActivity.create({
        data: {
            taskId: data.taskId,
            actorUserId: data.actorUserId,
            action: data.action,
            meta: data.meta ? JSON.stringify(data.meta) : null
        }
    });
};

export const getRecentActivities = async (limit: number = 20) => {
    return await prisma.taskActivity.findMany({
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

export const getUserActivities = async (userId: string, limit: number = 10) => {
    return await prisma.taskActivity.findMany({
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

export const getTaskActivities = async (taskId: string) => {
    return await prisma.taskActivity.findMany({
        where: { taskId },
        orderBy: { createdAt: 'desc' },
        include: {
            actor: {
                select: { id: true, firstName: true, lastName: true }
            }
        }
    });
};
