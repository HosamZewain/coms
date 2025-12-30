import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as boardService from '../services/board.service';
import { AppError } from '../utils/error';

export const createBoard = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('User not authenticated', 401);

    const board = await boardService.createBoard({
        ...req.body,
        ownerUserId: req.user.id
    });

    res.status(201).json({ status: 'success', data: board });
});

export const getBoards = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new AppError('User not authenticated', 401);

    const teamIds = req.user.teamId ? [req.user.teamId] : [];
    // If user is in multiple teams or we have a complicated team structure, fetch them.
    // For now assuming user.teamId is the main one.

    const boards = await boardService.getBoards(req.user.id, teamIds);
    res.json({ status: 'success', data: boards });
});

export const getBoard = catchAsync(async (req: Request, res: Response) => {
    // Permission check should be here or service. 
    // For MVP, we let service fetch and if empty throw 404. Service does basic fetch.
    // Real auth check: is user in board.access OR is it ORG visible?
    if (!req.user) throw new AppError('User not authenticated', 401);

    const board = await boardService.getBoard(req.params.id, req.user.id);

    // Manual permission check for security
    const hasAccess = board.visibility === 'ORG' ||
        board.access.some(a => a.userId === req.user!.id || (req.user!.teamId && a.teamId === req.user!.teamId));

    if (!hasAccess) throw new AppError('You do not have permission to view this board', 403);

    res.json({ status: 'success', data: board });
});

export const updateBoard = catchAsync(async (req: Request, res: Response) => {
    const board = await boardService.updateBoard(req.params.id, req.body);
    res.json({ status: 'success', data: board });
});

export const deleteBoard = catchAsync(async (req: Request, res: Response) => {
    await boardService.deleteBoard(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});

export const addMember = catchAsync(async (req: Request, res: Response) => {
    // req.body: { principalId, type: 'USER' | 'TEAM', role }
    const { principalId, type, role } = req.body;
    const access = await boardService.addMember(req.params.id, principalId, type, role);
    res.status(201).json({ status: 'success', data: access });
});

export const removeMember = catchAsync(async (req: Request, res: Response) => {
    // This expects accessId, not boardId/userId combo for simplicity in REST usually?
    // Or DELETE /boards/:id/access?userId=...
    // Req says: DELETE /boards/:id/access
    // Let's assume query params or body to identify MEMBER to remove.
    // For simplicity, let's look for accessId in body or query, or look it up.
    // Let's implement: DELETE /boards/:id/access/:accessId

    await boardService.removeMember(req.params.accessId);
    res.status(204).json({ status: 'success', data: null });
});
