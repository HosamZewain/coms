import { Request, Response, NextFunction } from 'express'; // Added NextFunction for the catch block
import { catchAsync } from '../utils/error';
import * as authService from '../services/auth.service';
import { loginSchema, registerSchema } from '../utils/validation';

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => { // Added next to the async function signature
    try {
        const data = registerSchema.parse(req.body);
        const user = await authService.registerUser(data);
        res.status(201).json({ status: 'success', data: user });
    } catch (error) {
        console.error('REGISTER ERROR:', error); // DEBUG LOG
        next(error); // Pass the error to the next middleware (e.g., global error handler)
    }
});

export const login = catchAsync(async (req: Request, res: Response) => {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginUser(data);
    res.status(200).json({ status: 'success', data: result });
});

export const getMe = catchAsync(async (req: any, res: Response) => {
    const user = await authService.getUserById(req.user.userId);
    res.status(200).json({ status: 'success', data: user });
});
