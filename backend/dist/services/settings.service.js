"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSetting = exports.getSetting = void 0;
const prisma_1 = require("../utils/prisma");
// const prisma = new PrismaClient();
const getSetting = async (key) => {
    const setting = await prisma_1.prisma.setting.findUnique({ where: { key } });
    return setting ? setting.value : null;
};
exports.getSetting = getSetting;
const setSetting = async (key, value) => {
    return await prisma_1.prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
    });
};
exports.setSetting = setSetting;
