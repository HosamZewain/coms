import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as leaveService from '../services/leave.service';

export const getLeaveTypes = catchAsync(async (req: Request, res: Response) => {
    const data = await leaveService.getLeaveTypes();
    res.json({ status: 'success', data });
});

export const createLeave = catchAsync(async (req: any, res: Response) => {
    // Admin can specify userId in body to create for others, else defaults to current user
    const userId = req.body.userId || req.user.userId;

    // If Admin creating for others, auto-approve? Let's assume passed status 'APPROVED' handles it
    const data = await leaveService.createLeaveRequest(userId, req.body);
    res.status(201).json({ status: 'success', data });
});

export const getMyLeaves = catchAsync(async (req: any, res: Response) => {
    const data = await leaveService.getMyLeaves(req.user.userId);
    res.json({ status: 'success', data });
});

export const getAllLeaves = catchAsync(async (req: any, res: Response) => {
    const data = await leaveService.getAllLeaves(req.user.userId);
    res.json({ status: 'success', data });
});

export const updateLeaveStatus = catchAsync(async (req: any, res: Response) => {
    const { status } = req.body;
    const data = await leaveService.updateLeaveStatus(req.params.id, status, req.user.userId);
    res.json({ status: 'success', data });
});

export const deleteLeave = catchAsync(async (req: Request, res: Response) => {
    await leaveService.deleteLeaveRequest(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});

export const getBalances = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const data = await leaveService.getUserBalances(userId, year);
    res.json({ status: 'success', data });
});

export const updateBalance = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { leaveTypeId, balance, year } = req.body;
    const data = await leaveService.updateUserBalance(
        userId,
        leaveTypeId,
        balance,
        year || new Date().getFullYear()
    );
    res.json({ status: 'success', data });
});
