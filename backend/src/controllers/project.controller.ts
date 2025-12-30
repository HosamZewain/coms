import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as projectService from '../services/project.service';

export const createProject = catchAsync(async (req: Request, res: Response) => {
    const data = await projectService.createProject(req.body);
    res.status(201).json({ status: 'success', data });
});

export const getAllProjects = catchAsync(async (req: Request, res: Response) => {
    const data = await projectService.getAllProjects(req.query);
    res.json({ status: 'success', data });
});

export const getProjectById = catchAsync(async (req: Request, res: Response) => {
    const data = await projectService.getProjectById(req.params.id);
    res.json({ status: 'success', data });
});

export const updateProject = catchAsync(async (req: Request, res: Response) => {
    const data = await projectService.updateProject(req.params.id, req.body);
    res.json({ status: 'success', data });
});

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
    await projectService.deleteProject(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});

export const addMember = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { userId } = req.body;
    const project = await projectService.addMember(id, userId);
    res.status(200).json({
        status: 'success',
        data: project
    });
});

export const removeMember = catchAsync(async (req: Request, res: Response) => {
    const { id, userId } = req.params;
    await projectService.removeMember(id, userId);
    res.status(200).json({
        status: 'success',
        data: null
    });
});

export const getProjectMembers = catchAsync(async (req: Request, res: Response) => {
    const data = await projectService.getProjectMembers(req.params.id);
    res.json({ status: 'success', data });
});
