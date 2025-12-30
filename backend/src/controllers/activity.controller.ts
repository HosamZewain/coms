import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as activityService from '../services/activity.service';

export const getRecentActivities = catchAsync(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const data = await activityService.getRecentActivities(limit);
    res.json({ status: 'success', data });
});

export const getUserActivities = catchAsync(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = await activityService.getUserActivities(req.params.userId, limit);
    res.json({ status: 'success', data });
});

export const getTaskActivities = catchAsync(async (req: Request, res: Response) => {
    const data = await activityService.getTaskActivities(req.params.taskId);
    res.json({ status: 'success', data });
});
