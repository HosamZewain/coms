import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as attendanceService from '../services/attendance.service';
import { z } from 'zod';

const punchSchema = z.object({
    location: z.enum(['OFFICE', 'HOME']),
    projectId: z.string(),
    task: z.string(),
    notes: z.string().optional()
});

export const punchIn = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const body = punchSchema.parse(req.body);

    const data = await attendanceService.punchIn(userId, { ...body, ipAddress });
    res.status(201).json({ status: 'success', data });
});

export const punchOut = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const body = punchSchema.parse(req.body);

    const data = await attendanceService.punchOut(userId, { ...body, ipAddress });
    res.json({ status: 'success', data });
});

export const getTodayReport = catchAsync(async (req: Request, res: Response) => {
    const dateStr = req.query.date as string;
    const date = dateStr ? new Date(dateStr) : new Date();
    const data = await attendanceService.getDailyReport(date);
    res.json({ status: 'success', data });
});


export const getMyAttendance = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await attendanceService.getMyAttendance(userId);
    res.json({ status: 'success', data });
});

export const getAttendanceStats = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await attendanceService.getAttendanceStats(userId);
    res.json({ status: 'success', data });
});

export const addManualAttendance = catchAsync(async (req: any, res: Response) => {
    const { userId } = req.body; // Target user
    if (!userId) throw new Error('User ID is required');
    const data = await attendanceService.addManualAttendance(userId, req.body);
    res.status(201).json({ status: 'success', data });
});

export const getEmployeeMonthlyReport = catchAsync(async (req: Request, res: Response) => {
    const employeeId = req.query.employeeId as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();

    if (!employeeId) {
        return res.status(400).json({ status: 'error', message: 'Employee ID is required' });
    }

    const data = await attendanceService.getEmployeeMonthlyReport(employeeId, startDate, endDate);
    res.json({ status: 'success', data });
});
