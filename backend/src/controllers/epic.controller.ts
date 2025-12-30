import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as epicService from '../services/epic.service';
import { AppError } from '../utils/error';

export const createEpic = catchAsync(async (req: Request, res: Response) => {
    const boardId = req.params.boardId;
    if (!req.user) throw new AppError('User not authenticated', 401);

    const epic = await epicService.createEpic({
        boardId,
        ...req.body,
        createdByUserId: req.user.id
    });
    res.status(201).json({ status: 'success', data: epic });
});

export const getEpics = catchAsync(async (req: Request, res: Response) => {
    const boardId = req.params.boardId;
    const epics = await epicService.getEpics(boardId);
    res.json({ status: 'success', data: epics });
});

export const getEpic = catchAsync(async (req: Request, res: Response) => {
    const epic = await epicService.getEpic(req.params.id);
    res.json({ status: 'success', data: epic });
});

export const updateEpic = catchAsync(async (req: Request, res: Response) => {
    const epic = await epicService.updateEpic(req.params.id, req.body);
    res.json({ status: 'success', data: epic });
});

export const deleteEpic = catchAsync(async (req: Request, res: Response) => {
    await epicService.deleteEpic(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
