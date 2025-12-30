import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';

// const prisma = new PrismaClient();

export const addCompensation = async (userId: string, data: any) => {
    return await prisma.compensation.create({
        data: {
            userId,
            ...data
        }
    });
};

export const getCompensations = async (userId: string) => {
    return await prisma.compensation.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
    });
};
