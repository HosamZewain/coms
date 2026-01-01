"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.loginUser = exports.registerUser = void 0;
const prisma_1 = require("../utils/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../utils/error");
// const prisma = new PrismaClient(); // Removed
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const registerUser = async (data) => {
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser)
        throw new error_1.AppError('User already exists', 400);
    const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
    // For MVP, assign a default role or create one if not exists
    let defaultRole = await prisma_1.prisma.role.findFirst({ where: { name: 'Employee' } });
    if (!defaultRole) {
        defaultRole = await prisma_1.prisma.role.create({
            data: { name: 'Employee', permissions: [] }
        });
    }
    const user = await prisma_1.prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
            roleId: defaultRole.id
        }
    });
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
exports.registerUser = registerUser;
const loginUser = async (data) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: data.email },
        include: { role: true }
    });
    if (!user)
        throw new error_1.AppError('Invalid credentials', 401);
    const isMatch = await bcryptjs_1.default.compare(data.password, user.password);
    if (!isMatch)
        throw new error_1.AppError('Invalid credentials', 401);
    const token = jsonwebtoken_1.default.sign({
        userId: user.id,
        role: user.role.name,
        permissions: user.role.permissions
    }, JWT_SECRET, { expiresIn: '1d' });
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
};
exports.loginUser = loginUser;
const getUserById = async (id) => {
    return await prisma_1.prisma.user.findUnique({
        where: { id },
        include: {
            role: true,
            employeeProfile: true
        }
    });
};
exports.getUserById = getUserById;
