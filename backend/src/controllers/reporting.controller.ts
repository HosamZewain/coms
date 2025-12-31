import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import { prisma } from '../utils/prisma';
import * as reportingService from '../services/reporting.service';
import { getLogs } from '../services/logger.service';

export const getDashboardStats = catchAsync(async (req: any, res: Response) => {
    // req.user includes role info because of our auth middleware (we'll need to ensure role is included in the JWT payload or fetched)
    // Assuming req.user is populated with { id, role: { name } } or we fetch it.

    // Check if req.user has role. If not, we might need to fetch full user details.
    // For now, let's assume `protect` middleware attaches basic user info, 
    // but ideally we should fetch the FULL user with Role/Dept/Team relations to be safe.

    const fullUser = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true }
    });

    const stats = await reportingService.getDashboardStats(fullUser);
    res.json({ status: 'success', data: stats });
});

// This was for file logs, keeping it or replacing?
// The user wants "full system log" which implies the new DB audit logs.
// Let's add a new endpoint for Audit Logs specifically.

import * as auditService from '../services/audit.service';

export const getSystemLogs = catchAsync(async (req: Request, res: Response) => {
    // Legacy file/console logs
    const logs = await getLogs(100);
    res.json({ status: 'success', data: logs });
});

export const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const logs = await auditService.getAuditLogs(limit, offset);
    res.json({ status: 'success', data: logs });
});
