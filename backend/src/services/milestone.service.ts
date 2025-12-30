import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';

export const createMilestone = async (data: any) => {
    const { planId, projectId, name, date, description } = data;

    if (!planId && !projectId) {
        // Fallback or Error? Plan strict hierarchy says planId required.
        // But for migration safety or legacy, check if we want to support direct project milestones.
        // The user said "each plan should have milestones".
        throw new AppError('Plan ID is required', 400);
    }

    // If planId is provided, we can infer projectId if needed, or just partial link.
    // For now we assume projectId is also passed or we fetch it from Plan.
    let finalProjectId = projectId;
    if (planId && !projectId) {
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) throw new AppError('Plan not found', 404);
        finalProjectId = plan.projectId; // Can be null if plan not linked to project?
    }

    if (!finalProjectId) throw new AppError('Project ID is required (inferred from Plan or direct)', 400);

    return await prisma.milestone.create({
        data: {
            name,
            date: new Date(date),
            description,
            planId,
            projectId: finalProjectId
        }
    });
};

export const getMilestonesByPlan = async (planId: string) => {
    return await prisma.milestone.findMany({
        where: { planId },
        include: {
            tasks: {
                select: { id: true, status: true }
            },
            _count: {
                select: { tasks: true }
            }
        },
        orderBy: { date: 'asc' }
    });
};

export const getMilestonesByProject = async (projectId: string) => {
    return await prisma.milestone.findMany({
        where: { projectId },
        include: {
            tasks: {
                select: { id: true, status: true }
            },
            _count: {
                select: { tasks: true }
            }
        },
        orderBy: { date: 'asc' }
    });
};

export const updateMilestone = async (id: string, data: any) => {
    return await prisma.milestone.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            date: data.date ? new Date(data.date) : undefined,
            isCompleted: data.isCompleted
        }
    });
};

export const deleteMilestone = async (id: string) => {
    // Check for tasks?
    // Cascade delete tasks or block? Usually block if crucial.
    // But simplified logic often just deletes. Schema handles cascade manually for tasks usually.
    // Let's safe delete.
    return await prisma.milestone.delete({ where: { id } });
};
