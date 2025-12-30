import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as queryService from '../services/query.service';
import { AppError } from '../utils/error';

export const createQuery = catchAsync(async (req: Request, res: Response) => {
    const boardId = req.params.boardId;
    if (!req.user) throw new AppError('User not authenticated', 401);

    const query = await queryService.createQuery({
        boardId,
        ...req.body,
        createdByUserId: req.user.id
    });
    res.status(201).json({ status: 'success', data: query });
});

export const getQueries = catchAsync(async (req: Request, res: Response) => {
    const boardId = req.params.boardId;
    const queries = await queryService.getQueries(boardId);
    res.json({ status: 'success', data: queries });
});

export const getQuery = catchAsync(async (req: Request, res: Response) => {
    const query = await queryService.getQuery(req.params.id);
    res.json({ status: 'success', data: query });
});

export const updateQuery = catchAsync(async (req: Request, res: Response) => {
    const query = await queryService.updateQuery(req.params.id, req.body);
    res.json({ status: 'success', data: query });
});

export const deleteQuery = catchAsync(async (req: Request, res: Response) => {
    await queryService.deleteQuery(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
