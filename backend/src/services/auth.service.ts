import { PrismaClient, User } from '@prisma/client';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/error';

// const prisma = new PrismaClient(); // Removed
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const registerUser = async (data: any) => {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new AppError('User already exists', 400);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // For MVP, assign a default role or create one if not exists
    let defaultRole = await prisma.role.findFirst({ where: { name: 'Employee' } });
    if (!defaultRole) {
        defaultRole = await prisma.role.create({
            data: { name: 'Employee', permissions: [] }
        });
    }

    const user = await prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
            roleId: defaultRole.id
        }
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const loginUser = async (data: any) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: { role: true }
    });

    if (!user) throw new AppError('Invalid credentials', 401);

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw new AppError('Invalid credentials', 401);

    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role.name,
            permissions: user.role.permissions
        },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};

export const getUserById = async (id: string) => {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            role: true,
            employeeProfile: true
        }
    });
};
