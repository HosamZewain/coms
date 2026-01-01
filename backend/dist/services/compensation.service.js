"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompensations = exports.addCompensation = void 0;
const prisma_1 = require("../utils/prisma");
// const prisma = new PrismaClient();
const addCompensation = async (userId, data) => {
    return await prisma_1.prisma.compensation.create({
        data: {
            userId,
            ...data
        }
    });
};
exports.addCompensation = addCompensation;
const getCompensations = async (userId) => {
    return await prisma_1.prisma.compensation.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
    });
};
exports.getCompensations = getCompensations;
