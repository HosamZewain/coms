import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as jobService from '../services/job.service';

export const createJob = catchAsync(async (req: Request, res: Response) => {
    const data = await jobService.createJob(req.body);
    res.status(201).json({ status: 'success', data });
});

export const getAllJobs = catchAsync(async (req: Request, res: Response) => {
    const data = await jobService.getAllJobs(req.query);
    res.json({ status: 'success', data });
});

export const getJobById = catchAsync(async (req: Request, res: Response) => {
    const data = await jobService.getJobById(req.params.id);
    res.json({ status: 'success', data });
});

export const updateJob = catchAsync(async (req: Request, res: Response) => {
    const data = await jobService.updateJob(req.params.id, req.body);
    res.json({ status: 'success', data });
});

export const deleteJob = catchAsync(async (req: Request, res: Response) => {
    await jobService.deleteJob(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});

export const getPublicJobs = catchAsync(async (req: Request, res: Response) => {
    const data = await jobService.getPublicJobs();
    res.json({ status: 'success', data });
});

export const getPublicJobById = catchAsync(async (req: Request, res: Response) => {
    const data = await jobService.getPublicJobById(req.params.id);
    res.json({ status: 'success', data });
});

export const applyToJob = catchAsync(async (req: Request, res: Response) => {
    const data = await jobService.applyToJob(req.params.id, req.body);
    res.status(201).json({ status: 'success', data });
});

export const getJobApplicants = catchAsync(async (req: Request, res: Response) => {
    const data = await jobService.getJobApplicants(req.params.id);
    res.json({ status: 'success', data });
});
