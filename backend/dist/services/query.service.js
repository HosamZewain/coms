"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuery = exports.updateQuery = exports.getQuery = exports.getQueries = exports.createQuery = void 0;
const prisma_1 = require("../utils/prisma");
const error_1 = require("../utils/error");
const createQuery = async (data) => {
    const board = await prisma_1.prisma.board.findUnique({ where: { id: data.boardId } });
    if (!board)
        throw new error_1.AppError('Board not found', 404);
    return await prisma_1.prisma.savedQuery.create({
        data: {
            boardId: data.boardId,
            name: data.name,
            queryJson: data.queryJson,
            createdByUserId: data.createdByUserId
        }
    });
};
exports.createQuery = createQuery;
const getQueries = async (boardId) => {
    return await prisma_1.prisma.savedQuery.findMany({
        where: { boardId },
        include: {
            createdByUser: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getQueries = getQueries;
const getQuery = async (id) => {
    const query = await prisma_1.prisma.savedQuery.findUnique({
        where: { id }
    });
    if (!query)
        throw new error_1.AppError('Query not found', 404);
    return query;
};
exports.getQuery = getQuery;
const updateQuery = async (id, data) => {
    return await prisma_1.prisma.savedQuery.update({
        where: { id },
        data: {
            name: data.name,
            queryJson: data.queryJson
        }
    });
};
exports.updateQuery = updateQuery;
const deleteQuery = async (id) => {
    return await prisma_1.prisma.savedQuery.delete({ where: { id } });
};
exports.deleteQuery = deleteQuery;
