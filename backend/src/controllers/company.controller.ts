import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../utils/error';
import * as companyService from '../services/company.service';
import { z } from 'zod';

const nameSchema = z.object({ name: z.string().min(2) });
const createPositionSchema = z.object({ title: z.string().min(2), departmentId: z.string().uuid() });
const updatePositionSchema = z.object({ title: z.string().min(2) });


// Departments
export const getDepartments = catchAsync(async (req: Request, res: Response) => {
    const data = await companyService.getDepartments();
    res.json({ status: 'success', data });
});

export const createDepartment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = nameSchema.parse(req.body);
        const managerId = req.body.managerId;
        const data = await companyService.createDepartment(name, managerId);
        res.status(201).json({ status: 'success', data });
    } catch (error) {
        console.error('CREATE DEPT ERROR:', error);
        next(error);
    }
});

export const updateDepartment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = nameSchema.parse(req.body);
    const managerId = req.body.managerId;
    const data = await companyService.updateDepartment(id, name, managerId);
    res.json({ status: 'success', data });
});

export const deleteDepartment = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await companyService.deleteDepartment(id);
    res.json({ status: 'success', message: 'Department deleted' });
});

// Teams
export const getTeams = catchAsync(async (req: Request, res: Response) => {
    const { departmentId } = req.query;
    const data = await companyService.getTeams(departmentId as string);
    res.json({ status: 'success', data });
});

export const createTeam = catchAsync(async (req: Request, res: Response) => {
    const data = await companyService.createTeam(req.body);
    res.status(201).json({ status: 'success', data });
});

export const updateTeam = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await companyService.updateTeam(id, req.body);
    res.json({ status: 'success', data });
});

export const deleteTeam = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await companyService.deleteTeam(id);
    res.json({ status: 'success', message: 'Team deleted' });
});

// Positions
export const getPositions = catchAsync(async (req: Request, res: Response) => {
    const data = await companyService.getPositions();
    res.json({ status: 'success', data });
});

export const createPosition = catchAsync(async (req: Request, res: Response) => {
    const { title, departmentId } = createPositionSchema.parse(req.body);
    const data = await companyService.createPosition(title, departmentId);
    res.status(201).json({ status: 'success', data });
});

export const updatePosition = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title } = updatePositionSchema.parse(req.body);

    const data = await companyService.updatePosition(id, title);
    res.json({ status: 'success', data });
});

export const deletePosition = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await companyService.deletePosition(id);
    res.json({ status: 'success', message: 'Position deleted' });
});

export const getProfile = catchAsync(async (req: Request, res: Response) => {
    const data = await companyService.getCompanyProfile();
    res.json({ status: 'success', data });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
    const data = await companyService.updateCompanyProfile(req.body);
    res.json({ status: 'success', data });
});

export const getSettings = catchAsync(async (req: Request, res: Response) => {
    const keys = (req.query.keys as string)?.split(',') || [];
    const data = await companyService.getSettings(keys);
    res.json({ status: 'success', data });
});

export const updateSettings = catchAsync(async (req: Request, res: Response) => {
    const data = await companyService.updateSettings(req.body);
    res.json({ status: 'success', data });
});
