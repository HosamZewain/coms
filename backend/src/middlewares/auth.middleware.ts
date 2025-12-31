import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/error';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AuthRequest extends Request {
    user?: {
        id: string; // Add for compatibility
        userId: string;
        role: string;
        permissions: string[];
    };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return next(new AppError('Authentication required', 401));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        req.user = {
            ...decoded,
            id: decoded.userId // Add id field for compatibility
        };
        next();
    } catch (error) {
        next(new AppError('Invalid token', 401));
    }
};

export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // Normalize both sides to upper case for comparison
        const upperRoles = roles.map(r => r.toUpperCase());
        if (!req.user || !upperRoles.includes(req.user.role.toUpperCase())) { // Bug fix: was checking against mixed case roles
            return next(new AppError('Forbidden: Role not authorized', 403));
        }
        next();
    };
};

export const authorizePermission = (module: string, action: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.permissions) {
            return next(new AppError('Forbidden: No permissions found', 403));
        }

        const requiredPermission = `${module}:${action}`;
        const hasPermission =
            req.user.permissions.includes(requiredPermission) ||
            req.user.permissions.includes('*:*') ||
            req.user.permissions.includes(`${module}:*`);

        if (!hasPermission) {
            return next(new AppError(`Forbidden: Missing permission ${requiredPermission}`, 403));
        }
        next();
    };
};
