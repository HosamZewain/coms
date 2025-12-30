import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as recruitmentService from '../services/recruitment.service';

// Job
export const createJob = catchAsync(async (req: Request, res: Response) => {
    const data = await recruitmentService.createJob(req.body);
    res.status(201).json({ status: 'success', data });
});

export const getJobs = catchAsync(async (req: Request, res: Response) => {
    const data = await recruitmentService.getJobs();
    res.json({ status: 'success', data });
});

export const getJob = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await recruitmentService.getJob(id);
    if (!data) return res.status(404).json({ status: 'fail', message: 'Job not found' });
    res.json({ status: 'success', data });
});

export const getPublicJobs = catchAsync(async (req: Request, res: Response) => {
    const data = await recruitmentService.getPublicJobs();
    res.json({ status: 'success', data });
});

export const getPublicJob = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await recruitmentService.getPublicJob(id);
    if (!data) {
        return res.status(404).json({ status: 'fail', message: 'Job not found' });
    }
    res.json({ status: 'success', data });
});

// Applicant
export const addApplicant = catchAsync(async (req: Request, res: Response) => {
    const data = await recruitmentService.addApplicant(req.body);
    res.status(201).json({ status: 'success', data });
});

export const getApplicants = catchAsync(async (req: Request, res: Response) => {
    const { jobId } = req.query;
    const data = await recruitmentService.getApplicants(jobId as string);
    res.json({ status: 'success', data });
});

export const getApplicant = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await recruitmentService.getApplicant(id);
    if (!data) return res.status(404).json({ status: 'fail', message: 'Applicant not found' });
    res.json({ status: 'success', data });
});

export const updateApplicantStatus = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const data = await recruitmentService.updateApplicantStatus(id, status);
    res.json({ status: 'success', data });
});

// Interview
export const scheduleInterview = catchAsync(async (req: Request, res: Response) => {
    const data = await recruitmentService.scheduleInterview(req.body);
    res.status(201).json({ status: 'success', data });
});

export const getMyInterviews = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await recruitmentService.getMyInterviews(userId);
    res.json({ status: 'success', data });
});
