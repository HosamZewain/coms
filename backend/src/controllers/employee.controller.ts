import { Request, Response } from 'express';
import { catchAsync } from '../utils/error';
import * as employeeService from '../services/employee.service';

export const getMyProfile = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await employeeService.getProfile(userId);
    res.json({ status: 'success', data });
});

export const updateMyProfile = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    // TODO: Add validation schema
    const data = await employeeService.upsertProfile(userId, req.body);
    res.json({ status: 'success', data });
});

export const addDependent = catchAsync(async (req: any, res: Response) => {
    const userId = req.user.userId;
    const data = await employeeService.addDependent(userId, req.body);
    res.json({ status: 'success', data });
});

export const deleteDependent = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await employeeService.removeDependent(id);
    res.json({ status: 'success', message: 'Dependent removed' });
});

export const getEmployees = catchAsync(async (req: Request, res: Response) => {
    const data = await employeeService.getAllEmployees();
    res.json({ status: 'success', data });
});

export const getEmployee = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await employeeService.getEmployeeById(id);
    res.json({ status: 'success', data });
});

export const updateEmployee = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await employeeService.updateEmployeeById(id, req.body);
    res.json({ status: 'success', data });
});

export const createEmployee = catchAsync(async (req: Request, res: Response) => {
    const data = await employeeService.createEmployee(req.body);
    res.status(201).json({ status: 'success', data });
});

export const uploadProfileImage = async (req: any, res: Response) => {
    try {
        console.log('Upload Debug: Controller Entry');
        console.log('Upload Debug: Params:', req.params);
        console.log('Upload Debug: File:', req.file ? 'Present' : 'Missing');

        if (!req.file) {
            throw new Error('No file uploaded');
        }

        const idOrSlug = req.params.id;
        console.log('Upload Debug: Resolving ID/Slug:', idOrSlug);

        // Resolve user first (handle slug vs uuid)
        const user = await employeeService.getEmployeeById(idOrSlug);

        if (!user) {
            console.error('Upload Debug: User not found for:', idOrSlug);
            throw new Error(`Employee not found for Identifier: ${idOrSlug}`);
        }
        console.log('Upload Debug: Resolved User UUID:', user.id);

        // Construct public URL. Assuming 'uploads' is served statically.
        const imageUrl = `/uploads/profiles/${req.file.filename}`;

        console.log('Upload Debug: Upserting Profile Image URL:', imageUrl);
        await employeeService.upsertProfile(user.id, { profileImage: imageUrl });

        res.json({
            status: 'success',
            data: { imageUrl },
            message: 'Profile image uploaded successfully'
        });
    } catch (error: any) {
        console.error('CRITICAL UPLOAD ERROR:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Unknown upload error',
            stack: error.stack
        });
    }
};

