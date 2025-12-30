import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';

export const createPlan = async (data: any, userId: string) => {
    const { projectId, name, startDate, endDate, description } = data;

    if (!projectId) throw new AppError('Project ID is required', 400);

    return await prisma.plan.create({
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

export const updatePlan = async (id: string, data: any) => {
    const { name, startDate, endDate } = data;

    return await prisma.plan.update({
        where: { id },
        data: {
            name,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        }
    });
};

export const archivePlan = async (id: string) => {
    // Check if all tasks are done
    const plan = await prisma.plan.findUnique({
        where: { id },
        include: { tasks: true }
    });

    if (!plan) throw new AppError('Plan not found', 404);

    const pendingTasks = plan.tasks.filter(t => t.status !== 'DONE' && t.status !== 'CANCELED');

    if (pendingTasks.length > 0) {
        throw new AppError(`Cannot archive plan. There are ${pendingTasks.length} pending tasks.`, 400);
    }

    return await prisma.plan.update({
        where: { id },
        data: { status: 'ARCHIVED' }
    });
};

export const getAllPlans = async () => {
    return await prisma.plan.findMany({
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

export const getPlansByProject = async (projectId: string) => {
    return await prisma.plan.findMany({
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

export const moveTaskToPlan = async (taskId: string, targetPlanId: string) => {
    const plan = await prisma.plan.findUnique({ where: { id: targetPlanId } });
    if (!plan) throw new AppError('Target plan not found', 404);

    if (plan.status === 'ARCHIVED') throw new AppError('Cannot move task to an archived plan', 400);

    return await prisma.task.update({
        where: { id: taskId },
        data: { planId: targetPlanId }
    });
};
