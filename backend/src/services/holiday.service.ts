import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';

export const getAllHolidays = async () => {
    return await prisma.holiday.findMany({
        orderBy: { date: 'asc' }
    });
};

export const getHolidayById = async (id: string) => {
    const holiday = await prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new AppError('Holiday not found', 404);
    return holiday;
};

export const createHoliday = async (data: { name: string; date: string; isRecurring?: boolean }) => {
    const holidayDate = new Date(data.date);
    return await prisma.holiday.create({
        data: {
            name: data.name,
            date: holidayDate,
            isRecurring: data.isRecurring || false
        }
    });
};

export const updateHoliday = async (id: string, data: { name?: string; date?: string; isRecurring?: boolean }) => {
    const holiday = await prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new AppError('Holiday not found', 404);

    return await prisma.holiday.update({
        where: { id },
        data: {
            name: data.name,
            date: data.date ? new Date(data.date) : undefined,
            isRecurring: data.isRecurring
        }
    });
};

export const deleteHoliday = async (id: string) => {
    const holiday = await prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new AppError('Holiday not found', 404);

    return await prisma.holiday.delete({ where: { id } });
};
