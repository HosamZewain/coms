"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEpic = exports.updateEpic = exports.getEpic = exports.getEpics = exports.createEpic = void 0;
const prisma_1 = require("../utils/prisma");
const error_1 = require("../utils/error");
const createEpic = async (data) => {
    const board = await prisma_1.prisma.board.findUnique({ where: { id: data.boardId } });
    if (!board)
        throw new error_1.AppError('Board not found', 404);
    return await prisma_1.prisma.epic.create({
        data: {
            boardId: data.boardId,
            planId: data.planId,
            title: data.title,
            description: data.description,
            priority: data.priority || 'MEDIUM',
            status: data.status || 'PROPOSED',
            targetStartDate: data.targetStartDate ? new Date(data.targetStartDate) : undefined,
            targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : undefined,
            ownerUserId: data.ownerUserId,
            createdByUserId: data.createdByUserId
        }
    });
};
exports.createEpic = createEpic;
const getEpics = async (boardId) => {
    return await prisma_1.prisma.epic.findMany({
        where: { boardId },
        include: {
            _count: { select: { tasks: true } },
            plan: { select: { id: true, name: true } },
            owner: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getEpics = getEpics;
const getEpic = async (id) => {
    const epic = await prisma_1.prisma.epic.findUnique({
        where: { id },
        include: {
            tasks: { take: 10 },
            plan: true,
            owner: true
        }
    });
    if (!epic)
        throw new error_1.AppError('Epic not found', 404);
    return epic;
};
exports.getEpic = getEpic;
const updateEpic = async (id, data) => {
    return await prisma_1.prisma.epic.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
            priority: data.priority,
            status: data.status,
            planId: data.planId,
            ownerUserId: data.ownerUserId,
            targetStartDate: data.targetStartDate ? new Date(data.targetStartDate) : undefined,
            targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : undefined,
        }
    });
};
exports.updateEpic = updateEpic;
const deleteEpic = async (id) => {
    return await prisma_1.prisma.epic.delete({ where: { id } });
};
exports.deleteEpic = deleteEpic;
