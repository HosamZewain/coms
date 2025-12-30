import { Response } from 'express';
import { catchAsync } from '../utils/error';
import * as hrService from '../services/hr.service';

// Regulations
export const createWorkRegulation = catchAsync(async (req: any, res: Response) => {
    // Basic validation could be added here or via middleware
    const data = await hrService.createWorkRegulation(req.body);
    res.status(201).json({ status: 'success', data });
});

export const getWorkRegulations = catchAsync(async (req: any, res: Response) => {
    const data = await hrService.getWorkRegulations();
    res.json({ status: 'success', data });
});

export const updateWorkRegulation = catchAsync(async (req: any, res: Response) => {
    const data = await hrService.updateWorkRegulation(req.params.id, req.body);
    res.json({ status: 'success', data });
});

export const deleteWorkRegulation = catchAsync(async (req: any, res: Response) => {
    await hrService.deleteWorkRegulation(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});

// Award Setup
export const createAwardType = catchAsync(async (req: any, res: Response) => {
    const data = await hrService.createAwardType(req.body);
    res.status(201).json({ status: 'success', data });
});

export const getAwardTypes = catchAsync(async (req: any, res: Response) => {
    const data = await hrService.getAwardTypes();
    res.json({ status: 'success', data });
});

// Give Award
export const giveAward = catchAsync(async (req: any, res: Response) => {
    const data = await hrService.giveAward(req.body);
    res.status(201).json({ status: 'success', data });
});

export const getAwards = catchAsync(async (req: any, res: Response) => {
    const data = await hrService.getAwards();
    res.json({ status: 'success', data });
});

// Overtime
export const requestOvertime = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await hrService.requestOvertime(userId, req.body);
    res.status(201).json({ status: 'success', data });
});

export const getMyOvertime = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await hrService.getOvertimeRequests(userId);
    res.json({ status: 'success', data });
});

export const getAllOvertime = catchAsync(async (req: any, res: Response) => {
    const data = await hrService.getOvertimeRequests();
    res.json({ status: 'success', data });
});

export const updateOvertimeStatus = catchAsync(async (req: any, res: Response) => {
    const { status } = req.body;
    const approverId = req.user.userId;
    const data = await hrService.updateOvertimeStatus(req.params.id, status, approverId);
    res.json({ status: 'success', data });
});

// Documents
export const uploadDocument = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await hrService.uploadDocument(req.body, userId);
    res.status(201).json({ status: 'success', data });
});

export const getDocuments = catchAsync(async (req: any, res: Response) => {
    const data = await hrService.getDocuments();
    res.json({ status: 'success', data });
});
