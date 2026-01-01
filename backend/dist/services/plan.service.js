"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveTaskToPlan = exports.getPlansByProject = exports.getAllPlans = exports.archivePlan = exports.updatePlan = exports.createPlan = void 0;
const prisma_1 = require("../utils/prisma");
const error_1 = require("../utils/error");
const createPlan = async (data, userId) => {
    const { projectId, name, startDate, endDate, description } = data;
    if (!projectId)
        throw new error_1.AppError('Project ID is required', 400);
    return await prisma_1.prisma.plan.create({
        data: {
            name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            projectId,
            createdByUserId: userId,
            status: 'ACTIVE'
        }
    });
};
exports.createPlan = createPlan;
const updatePlan = async (id, data) => {
    const { name, startDate, endDate } = data;
    return await prisma_1.prisma.plan.update({
        where: { id },
        data: {
            name,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        }
    });
};
exports.updatePlan = updatePlan;
const archivePlan = async (id) => {
    // Check if all tasks are done
    const plan = await prisma_1.prisma.plan.findUnique({
        where: { id },
        include: { tasks: true }
    });
    if (!plan)
        throw new error_1.AppError('Plan not found', 404);
    const pendingTasks = plan.tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELED');
    if (pendingTasks.length > 0) {
        throw new error_1.AppError(`Cannot archive plan. There are ${pendingTasks.length} pending tasks.`, 400);
    }
    return await prisma_1.prisma.plan.update({
        where: { id },
        data: { status: 'ARCHIVED' }
    });
};
exports.archivePlan = archivePlan;
const getAllPlans = async () => {
    return await prisma_1.prisma.plan.findMany({
        where: {
            OR: [
                { status: 'ACTIVE' },
                { status: 'COMPLETED' }
            ]
        },
        include: {
            project: {
                select: { id: true, name: true }
            },
            _count: {
                select: { tasks: true, milestones: true }
            },
            tasks: {
                select: { status: true }
            }
        },
        orderBy: { startDate: 'desc' }
    });
};
exports.getAllPlans = getAllPlans;
const getPlansByProject = async (projectId) => {
    return await prisma_1.prisma.plan.findMany({
        where: { projectId },
        include: {
            milestones: {
                include: {
                    tasks: { select: { id: true, status: true } },
                    _count: { select: { tasks: true } }
                },
                orderBy: { date: 'asc' }
            },
            tasks: {
                select: { id: true, status: true }
            },
            _count: {
                select: { tasks: true, milestones: true }
            }
        },
        orderBy: { startDate: 'desc' }
    });
};
exports.getPlansByProject = getPlansByProject;
const moveTaskToPlan = async (taskId, targetPlanId) => {
    const plan = await prisma_1.prisma.plan.findUnique({ where: { id: targetPlanId } });
    if (!plan)
        throw new error_1.AppError('Target plan not found', 404);
    if (plan.status === 'ARCHIVED')
        throw new error_1.AppError('Cannot move task to an archived plan', 400);
    return await prisma_1.prisma.task.update({
        where: { id: taskId },
        data: { planId: targetPlanId }
    });
};
exports.moveTaskToPlan = moveTaskToPlan;
