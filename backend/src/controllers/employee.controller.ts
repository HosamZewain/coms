import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as employeeService from '../services/employee.service';

export const getMyProfile = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await employeeService.getProfile(userId);
    res.json({ status: 'success', data });
});

export const updateMyProfile = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    // TODO: Add validation schema
    const data = await employeeService.upsertProfile(userId, req.body);
    res.json({ status: 'success', data });
});

export const addDependent = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await employeeService.addDependent(userId, req.body);
    res.json({ status: 'success', data });
});

export const deleteDependent = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await employeeService.removeDependent(id);
    res.json({ status: 'success', message: 'Dependent removed' });
});

export const getEmployees = catchAsync(async (req: Request, res: Response) => {
    const data = await employeeService.getAllEmployees();
    res.json({ status: 'success', data });
});

export const getEmployee = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await employeeService.getEmployeeById(id);
    res.json({ status: 'success', data });
});

export const updateEmployee = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await employeeService.updateEmployeeById(id, req.body);
    res.json({ status: 'success', data });
});

export const createEmployee = catchAsync(async (req: Request, res: Response) => {
    const data = await employeeService.createEmployee(req.body);
    res.status(201).json({ status: 'success', data });
});
