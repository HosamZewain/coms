import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { catchAsync } from '../utils/error';

export const getRoles = catchAsync(async (req: Request, res: Response) => {
    const roles = await prisma.role.findMany({
        include: { _count: { select: { users: true } } }
    });
    res.json({ status: 'success', data: roles });
});

export const createRole = catchAsync(async (req: Request, res: Response) => {
    const { name, permissions } = req.body;
    const role = await prisma.role.create({
        data: { name, permissions }
    });
    res.status(201).json({ status: 'success', data: role });
});

export const updateRole = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, permissions } = req.body;
    const role = await prisma.role.update({
        where: { id },
        data: { name, permissions }
    });
    res.json({ status: 'success', data: role });
});

export const deleteRole = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.role.delete({ where: { id } });
    res.status(204).json({ status: 'success' });
});
