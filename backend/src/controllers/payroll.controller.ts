import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as payrollService from '../services/payroll.service';

export const getPayroll = catchAsync(async (req: Request, res: Response) => {
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const data = await payrollService.calculatePayroll(month, year);
    res.json({ status: 'success', data, meta: { month, year } });
});
