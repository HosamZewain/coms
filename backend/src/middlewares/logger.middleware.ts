import { Request, Response, NextFunction } from 'express';
import { logAction } from '../services/logger.service';
import { AuthRequest } from './auth.middleware';

export const actionLogger = async (req: Request, res: Response, next: NextFunction) => {
    // Only log state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const originalSend = res.send;

        res.send = function (data) {
            res.send = originalSend;

            // Log after response is sent
            const userId = (req as AuthRequest).user?.userId || null;
            const resource = req.originalUrl.split('?')[0]; // path without query params
            const action = req.method;
            const ip = req.ip || req.socket.remoteAddress || null;

            logAction(userId, action, resource, {
                body: req.body,
                params: req.params,
                query: req.query,
                statusCode: res.statusCode
            }, ip as string);

            return originalSend.apply(res, arguments as any);
        };
    }
    next();
};
