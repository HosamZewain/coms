"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getUserNotifications = exports.createNotification = void 0;
const prisma_1 = require("../utils/prisma");
const createNotification = async (userId, title, message, type = 'SUCCESS') => {
    try {
        return await prisma_1.prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type
            }
        });
    }
    catch (error) {
        console.error('Failed to create notification:', error);
    }
};
exports.createNotification = createNotification;
const getUserNotifications = async (userId) => {
    return await prisma_1.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getUserNotifications = getUserNotifications;
const markAsRead = async (id, userId) => {
    return await prisma_1.prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true }
    });
};
exports.markAsRead = markAsRead;
