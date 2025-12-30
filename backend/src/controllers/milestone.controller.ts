import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as milestoneService from '../services/milestone.service';

export const createMilestone = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = await milestoneService.createMilestone(req.body);
    res.status(201).json({ status: 'success', data });
});

export const getPlanMilestones = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = await milestoneService.getMilestonesByPlan(req.params.planId);
    res.json({ status: 'success', data });
});

export const updateMilestone = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = await milestoneService.updateMilestone(req.params.id, req.body);
    res.json({ status: 'success', data });
});

export const deleteMilestone = catchAsync(async (req: AuthRequest, res: Response) => {
    await milestoneService.deleteMilestone(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
