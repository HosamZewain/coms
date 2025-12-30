import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import * as holidayService from '../services/holiday.service';

export const getAllHolidays = catchAsync(async (req: Request, res: Response) => {
    const data = await holidayService.getAllHolidays();
    res.status(200).json({ status: 'success', data });
});

export const getHoliday = catchAsync(async (req: Request, res: Response) => {
    const data = await holidayService.getHolidayById(req.params.id);
    res.status(200).json({ status: 'success', data });
});

export const createHoliday = catchAsync(async (req: Request, res: Response) => {
    const data = await holidayService.createHoliday(req.body);
    res.status(201).json({ status: 'success', data });
});

export const updateHoliday = catchAsync(async (req: Request, res: Response) => {
    const data = await holidayService.updateHoliday(req.params.id, req.body);
    res.status(200).json({ status: 'success', data });
});

export const deleteHoliday = catchAsync(async (req: Request, res: Response) => {
    await holidayService.deleteHoliday(req.params.id);
    res.status(204).send();
});
