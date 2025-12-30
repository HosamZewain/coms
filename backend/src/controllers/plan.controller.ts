import { Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middlewares/auth.middleware';
import * as planService from '../services/plan.service';

export const createPlan = catchAsync(async (req: AuthRequest, res: Response) => {
    // Force projectId from params if not in body
    const projectId = req.params.projectId || req.body.projectId;
    const data = await planService.createPlan({ ...req.body, projectId }, req.user!.id);
    res.status(201).json({ status: 'success', data });
});

export const updatePlan = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = await planService.updatePlan(req.params.id, req.body);
    res.json({ status: 'success', data });
});

export const archivePlan = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = await planService.archivePlan(req.params.id);
    res.json({ status: 'success', data });
});

export const getProjectPlans = catchAsync(async (req: AuthRequest, res: Response) => {
    if (req.params.projectId) {
        const data = await planService.getPlansByProject(req.params.projectId);
        res.json({ status: 'success', data });
    } else {
        const data = await planService.getAllPlans();
        res.json({ status: 'success', data });
    }
});

export const moveTask = catchAsync(async (req: AuthRequest, res: Response) => {
    const data = await planService.moveTaskToPlan(req.params.taskId, req.body.planId);
    res.json({ status: 'success', data });
});
