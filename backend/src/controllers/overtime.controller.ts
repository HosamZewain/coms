import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as overtimeService from '../services/overtime.service';

export const createRequest = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await overtimeService.createOvertimeRequest(userId, req.body);
    res.status(201).json({ status: 'success', data });
});

export const getAllRequests = catchAsync(async (req: Request, res: Response) => {
    const data = await overtimeService.getAllOvertimeRequests();
    res.json({ status: 'success', data });
});

export const getMyRequests = catchAsync(async (req: any, res: Response) => {
    const data = await overtimeService.getMyOvertimeRequests(req.user.userId);
    res.json({ status: 'success', data });
});

export const updateStatus = catchAsync(async (req: any, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const approverId = req.user.userId;

    const data = await overtimeService.updateOvertimeStatus(id, status, approverId);
    res.json({ status: 'success', data });
});
