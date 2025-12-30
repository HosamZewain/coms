import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as taskService from '../services/task.service';
import { AppError } from '../utils/error';

export const createTask = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('User not authenticated', 401);

    // If boardId comes from params (nested route)
    const boardId = req.params.boardId || req.body.boardId;

    const task = await taskService.createTask({
        ...req.body,
        boardId,
        createdByUserId: req.user.id
    });
    res.status(201).json({ status: 'success', data: task });
});

export const getTasks = catchAsync(async (req: Request, res: Response) => {
    // Handling filters
    // If nested under board: /boards/:boardId/tasks
    const boardId = req.params.boardId || req.query.boardId as string;

    // Parse query arrays (e.g. status=TODO&status=DONE)
    const status = req.query.status ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) : undefined;
    const priority = req.query.priority ? (Array.isArray(req.query.priority) ? req.query.priority : [req.query.priority]) : undefined;
    const assigneeIds = req.query.assigneeIds ? (Array.isArray(req.query.assigneeIds) ? req.query.assigneeIds : [req.query.assigneeIds]) : undefined;

    // Legacy support for single query params if still used by old frontend, but our service handles arrays.

    const filters = {
        boardId,
        planId: req.query.planId as string,
        milestoneId: req.query.milestoneId as string,
        epicId: req.query.epicId as string,
        projectId: req.query.projectId as string || req.query.project as string, // Handle legacy
        status: status as string[],
        priority: priority as string[],
        assigneeIds: assigneeIds as string[],
        search: req.query.search as string,
        dueDateFrom: req.query.dueDateFrom as string,
        dueDateTo: req.query.dueDateTo as string
    };

    const tasks = await taskService.getTasks(filters);
    res.json({ status: 'success', data: tasks });
});

export const getTask = catchAsync(async (req: Request, res: Response) => {
    const task = await taskService.getTask(req.params.id);
    res.json({ status: 'success', data: task });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('User not authenticated', 401);
    const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
    res.json({ status: 'success', data: task });
});

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('User not authenticated', 401);
    await taskService.deleteTask(req.params.id, req.user.id);
    res.status(204).json({ status: 'success', data: null });
});

// Assignments
export const addAssignee = catchAsync(async (req: Request, res: Response) => {
    // body: { userId }
    if (!req.user) throw new AppError('User not authenticated', 401);
    const assignment = await taskService.addAssignee(req.params.id, req.body.userId, req.user.id);
    res.status(201).json({ status: 'success', data: assignment });
});

export const removeAssignee = catchAsync(async (req: Request, res: Response) => {
    // DELETE /tasks/:id/assignments/:userId
    if (!req.user) throw new AppError('User not authenticated', 401);
    await taskService.removeAssignee(req.params.id, req.params.userId, req.user.id);
    res.status(204).json({ status: 'success', data: null });
});

// Comments
export const addComment = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError('User not authenticated', 401);
    const comment = await taskService.addComment(req.params.id, req.body.body, req.user.id);
    res.status(201).json({ status: 'success', data: comment });
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError('User not authenticated', 401);
    await taskService.deleteComment(req.params.commentId, req.user.id);
    res.status(204).json({ status: 'success', data: null });
});

export const addAttachment = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError('User not authenticated', 401);
    if (!req.file) throw new AppError('No file uploaded', 400);

    const attachment = await taskService.addAttachment(req.params.id, req.file, req.user.id);
    res.status(201).json({ status: 'success', data: attachment });
});

export const removeAttachment = catchAsync(async (req: Request, res: Response) => {
    if (!req.user?.id) throw new AppError('User not authenticated', 401);
    await taskService.removeAttachment(req.params.attachmentId);
    res.status(204).json({ status: 'success', data: null });
});
