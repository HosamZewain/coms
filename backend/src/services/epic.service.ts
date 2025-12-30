import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';

interface CreateEpicInput {
    boardId: string;
    planId?: string;
    title: string;
    description?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status?: string;
    targetStartDate?: string | Date;
    targetEndDate?: string | Date;
    ownerUserId?: string;
    createdByUserId: string;
}

export const createEpic = async (data: CreateEpicInput) => {
    const board = await prisma.board.findUnique({ where: { id: data.boardId } });
    if (!board) throw new AppError('Board not found', 404);

    return await prisma.epic.create({
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

export const getEpics = async (boardId: string) => {
    return await prisma.epic.findMany({
        where: { boardId },
        include: {
            _count: { select: { tasks: true } },
            plan: { select: { id: true, name: true } },
            owner: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getEpic = async (id: string) => {
    const epic = await prisma.epic.findUnique({
        where: { id },
        include: {
            tasks: { take: 10 },
            plan: true,
            owner: true
        }
    });
    if (!epic) throw new AppError('Epic not found', 404);
    return epic;
};

export const updateEpic = async (id: string, data: any) => {
    return await prisma.epic.update({
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

export const deleteEpic = async (id: string) => {
    return await prisma.epic.delete({ where: { id } });
};
