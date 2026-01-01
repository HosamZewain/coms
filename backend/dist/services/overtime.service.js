"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOvertimeStatus = exports.getMyOvertimeRequests = exports.getAllOvertimeRequests = exports.createOvertimeRequest = void 0;
const prisma_1 = require("../utils/prisma");
const createOvertimeRequest = async (userId, data) => {
    return await prisma_1.prisma.overtimeRequest.create({
        data: {
            userId,
            date: new Date(data.date),
            hours: parseFloat(data.hours),
            reason: data.reason
        }
    });
};
exports.createOvertimeRequest = createOvertimeRequest;
const getAllOvertimeRequests = async () => {
    return await prisma_1.prisma.overtimeRequest.findMany({
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
exports.getAllOvertimeRequests = getAllOvertimeRequests;
const getMyOvertimeRequests = async (userId) => {
    return await prisma_1.prisma.overtimeRequest.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getMyOvertimeRequests = getMyOvertimeRequests;
const updateOvertimeStatus = async (id, status, approverId) => {
    return await prisma_1.prisma.overtimeRequest.update({
        where: { id },
        data: {
            status,
            approverId
        }
    });
};
exports.updateOvertimeStatus = updateOvertimeStatus;
