import { PrismaClient, NotificationType } from '@prisma/client';
import { prisma } from '../utils/prisma';

export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'SUCCESS'
) => {
    try {
        return await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

export const getUserNotifications = async (userId: string) => {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};

export const markAsRead = async (id: string, userId: string) => {
    return await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true }
    });
};
