"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHoliday = exports.updateHoliday = exports.createHoliday = exports.getHolidayById = exports.getAllHolidays = void 0;
const prisma_1 = require("../utils/prisma");
const error_1 = require("../utils/error");
const getAllHolidays = async () => {
    return await prisma_1.prisma.holiday.findMany({
        orderBy: { date: 'asc' }
    });
};
exports.getAllHolidays = getAllHolidays;
const getHolidayById = async (id) => {
    const holiday = await prisma_1.prisma.holiday.findUnique({ where: { id } });
    if (!holiday)
        throw new error_1.AppError('Holiday not found', 404);
    return holiday;
};
exports.getHolidayById = getHolidayById;
const createHoliday = async (data) => {
    const holidayDate = new Date(data.date);
    return await prisma_1.prisma.holiday.create({
        data: {
            name: data.name,
            date: holidayDate,
            isRecurring: data.isRecurring || false
        }
    });
};
exports.createHoliday = createHoliday;
const updateHoliday = async (id, data) => {
    const holiday = await prisma_1.prisma.holiday.findUnique({ where: { id } });
    if (!holiday)
        throw new error_1.AppError('Holiday not found', 404);
    return await prisma_1.prisma.holiday.update({
        where: { id },
        data: {
            name: data.name,
            date: data.date ? new Date(data.date) : undefined,
            isRecurring: data.isRecurring
        }
    });
};
exports.updateHoliday = updateHoliday;
const deleteHoliday = async (id) => {
    const holiday = await prisma_1.prisma.holiday.findUnique({ where: { id } });
    if (!holiday)
        throw new error_1.AppError('Holiday not found', 404);
    return await prisma_1.prisma.holiday.delete({ where: { id } });
};
exports.deleteHoliday = deleteHoliday;
