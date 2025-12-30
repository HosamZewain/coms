import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';

interface CreateSavedQueryInput {
    boardId: string;
    name: string;
    queryJson: string; // Stored as stringified JSON
    createdByUserId: string;
}

export const createQuery = async (data: CreateSavedQueryInput) => {
    const board = await prisma.board.findUnique({ where: { id: data.boardId } });
    if (!board) throw new AppError('Board not found', 404);

    return await prisma.savedQuery.create({
        data: {
            boardId: data.boardId,
            name: data.name,
            queryJson: data.queryJson,
            createdByUserId: data.createdByUserId
        }
    });
};

export const getQueries = async (boardId: string) => {
    return await prisma.savedQuery.findMany({
        where: { boardId },
        include: {
            createdByUser: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getQuery = async (id: string) => {
    const query = await prisma.savedQuery.findUnique({
        where: { id }
    });
    if (!query) throw new AppError('Query not found', 404);
    return query;
};

export const updateQuery = async (id: string, data: any) => {
    return await prisma.savedQuery.update({
        where: { id },
        data: {
            name: data.name,
            queryJson: data.queryJson
        }
    });
};

export const deleteQuery = async (id: string) => {
    return await prisma.savedQuery.delete({ where: { id } });
};
