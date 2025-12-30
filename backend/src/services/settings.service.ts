import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';

// const prisma = new PrismaClient();

export const getSetting = async (key: string) => {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting ? setting.value : null;
};

export const setSetting = async (key: string, value: string) => {
    return await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
    });
};
