"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoles = void 0;
const prisma_1 = require("../utils/prisma");
const error_1 = require("../utils/error");
exports.getRoles = (0, error_1.catchAsync)(async (req, res) => {
    const roles = await prisma_1.prisma.role.findMany({
        include: { _count: { select: { users: true } } }
    });
    res.json({ status: 'success', data: roles });
});
exports.createRole = (0, error_1.catchAsync)(async (req, res) => {
    const { name, permissions } = req.body;
    const role = await prisma_1.prisma.role.create({
        data: { name, permissions }
    });
    res.status(201).json({ status: 'success', data: role });
});
exports.updateRole = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { name, permissions } = req.body;
    const role = await prisma_1.prisma.role.update({
        where: { id },
        data: { name, permissions }
    });
    res.json({ status: 'success', data: role });
});
exports.deleteRole = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await prisma_1.prisma.role.delete({ where: { id } });
    res.status(204).json({ status: 'success' });
});
