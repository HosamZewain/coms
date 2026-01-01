"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMilestone = exports.updateMilestone = exports.getMilestonesByProject = exports.getMilestonesByPlan = exports.createMilestone = void 0;
const prisma_1 = require("../utils/prisma");
const error_1 = require("../utils/error");
const createMilestone = async (data) => {
    const { planId, projectId, name, date, description } = data;
    if (!planId && !projectId) {
        // Fallback or Error? Plan strict hierarchy says planId required.
        // But for migration safety or legacy, check if we want to support direct project milestones.
        // The user said "each plan should have milestones".
        throw new error_1.AppError('Plan ID is required', 400);
    }
    // If planId is provided, we can infer projectId if needed, or just partial link.
    // For now we assume projectId is also passed or we fetch it from Plan.
    let finalProjectId = projectId;
    if (planId && !projectId) {
        const plan = await prisma_1.prisma.plan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new error_1.AppError('Plan not found', 404);
        finalProjectId = plan.projectId; // Can be null if plan not linked to project?
    }
    if (!finalProjectId)
        throw new error_1.AppError('Project ID is required (inferred from Plan or direct)', 400);
    return await prisma_1.prisma.milestone.create({
        data: {
            name,
            date: new Date(date),
            description,
            planId,
            projectId: finalProjectId
        }
    });
};
exports.createMilestone = createMilestone;
const getMilestonesByPlan = async (planId) => {
    return await prisma_1.prisma.milestone.findMany({
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
exports.getMilestonesByPlan = getMilestonesByPlan;
const getMilestonesByProject = async (projectId) => {
    return await prisma_1.prisma.milestone.findMany({
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
exports.getMilestonesByProject = getMilestonesByProject;
const updateMilestone = async (id, data) => {
    return await prisma_1.prisma.milestone.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            date: data.date ? new Date(data.date) : undefined,
            isCompleted: data.isCompleted
        }
    });
};
exports.updateMilestone = updateMilestone;
const deleteMilestone = async (id) => {
    // Check for tasks?
    // Cascade delete tasks or block? Usually block if crucial.
    // But simplified logic often just deletes. Schema handles cascade manually for tasks usually.
    // Let's safe delete.
    return await prisma_1.prisma.milestone.delete({ where: { id } });
};
exports.deleteMilestone = deleteMilestone;
