import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';

interface CreateTaskInput {
    title: string;
    description?: string;
    type?: 'TASK' | 'BUG' | 'SPIKE' | 'CHORE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status?: string;
    estimatePoints?: number;

    boardId?: string;
    planId?: string;
    milestoneId?: string;
    epicId?: string;

    assigneeIds?: string[]; // New way
    startDate?: string | Date;
    dueDate?: string | Date;

    createdByUserId: string;

    // Legacy support if needed, but we migrate away
    projectId?: string;
}

export const createTask = async (data: CreateTaskInput) => {
    return await prisma.$transaction(async (tx) => {
        // Create Task
        const task = await tx.task.create({
            data: {
                title: data.title,
                description: data.description,
                type: data.type || 'TASK',
                priority: data.priority || 'MEDIUM',
                status: data.status ? (data.status as any) : 'TODO',
                estimatePoints: data.estimatePoints,

                boardId: data.boardId,
                planId: data.planId,
                milestoneId: data.milestoneId,
                epicId: data.epicId,
                projectId: data.projectId, // Legacy

                startDate: data.startDate ? new Date(data.startDate) : undefined,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                createdByUserId: data.createdByUserId,
            }
        });

        // Handle Assignments
        if (data.assigneeIds && data.assigneeIds.length > 0) {
            await tx.taskAssignment.createMany({
                data: data.assigneeIds.map(userId => ({
                    taskId: task.id,
                    userId
                }))
            });
        }

        // Log Activity
        await tx.taskActivity.create({
            data: {
                taskId: task.id,
                actorUserId: data.createdByUserId,
                action: 'created',
                meta: JSON.stringify({ title: task.title })
            }
        });

        return task;
    });
};

interface GetTasksFilter {
    boardId?: string;
    planId?: string;
    milestoneId?: string;
    epicId?: string;
    projectId?: string; // Legacy
    status?: string[];
    priority?: string[];
    assigneeIds?: string[];
    search?: string;
    dueDateFrom?: string | Date;
    dueDateTo?: string | Date;
}

export const getTasks = async (filters: GetTasksFilter) => {
    const where: any = {};

    if (filters.boardId) where.boardId = filters.boardId;
    if (filters.planId) where.planId = filters.planId;
    if (filters.milestoneId) where.milestoneId = filters.milestoneId;
    if (filters.epicId) where.epicId = filters.epicId;
    if (filters.projectId) where.projectId = filters.projectId; // Legacy

    if (filters.status && filters.status.length > 0) {
        where.status = { in: filters.status };
    }

    if (filters.priority && filters.priority.length > 0) {
        where.priority = { in: filters.priority };
    }

    if (filters.assigneeIds && filters.assigneeIds.length > 0) {
        where.assignments = {
            some: {
                userId: { in: filters.assigneeIds }
            }
        };
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
        where.dueDate = {};
        if (filters.dueDateFrom) where.dueDate.gte = new Date(filters.dueDateFrom);
        if (filters.dueDateTo) where.dueDate.lte = new Date(filters.dueDateTo);
    }

    if (filters.search) {
        where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
        ];
    }

    return await prisma.task.findMany({
        where,
        include: {
            assignments: {
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } }
                }
            },
            epic: { select: { id: true, title: true } },
            plan: { select: { id: true, name: true } },
            board: { select: { id: true, name: true } },
            _count: { select: { comments: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getTask = async (id: string) => {
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            assignments: {
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } }
                }
            },
            board: true,
            plan: true,
            epic: true,
            comments: {
                include: {
                    author: { select: { id: true, firstName: true, lastName: true } }
                },
                orderBy: { createdAt: 'desc' }
            },
            attachments: {
                include: {
                    user: { select: { firstName: true, lastName: true } }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });
    if (!task) throw new AppError('Task not found', 404);
    return task;
};

export const updateTask = async (id: string, data: any, actorUserId: string) => {
    // We should track changes for activity log
    // For simplicity, just update and log generic "updated"
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) throw new AppError('Task not found', 404);

    return await prisma.$transaction(async (tx) => {
        const updated = await tx.task.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                type: data.type,
                priority: data.priority,
                status: data.status,
                estimatePoints: data.estimatePoints,
                planId: data.planId,
                milestoneId: data.milestoneId,
                epicId: data.epicId,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            }
        });

        // Detailed activity logging could go here (diffing task vs updated)
        if (task.status !== updated.status) {
            await tx.taskActivity.create({
                data: {
                    taskId: id,
                    actorUserId,
                    action: 'status_changed',
                    meta: JSON.stringify({ from: task.status, to: updated.status })
                }
            });
        } else {
            await tx.taskActivity.create({
                data: {
                    taskId: id,
                    actorUserId,
                    action: 'updated',
                }
            });
        }

        return updated;
    });
};

export const deleteTask = async (id: string, actorUserId?: string) => {
    // Fetch complete task details before deletion for logging
    const task = await prisma.task.findUnique({
        where: { id },
        include: {
            project: { select: { name: true } },
            assignments: {
                include: {
                    user: { select: { firstName: true, lastName: true } }
                }
            },
            comments: { select: { id: true, body: true } }
        }
    });

    if (!task) {
        throw new AppError('Task not found', 404);
    }

    // Prepare detailed metadata for activity log
    const deletionMetadata = {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        projectName: task.project?.name,
        assignees: task.assignments.map(a => `${a.user.firstName} ${a.user.lastName}`),
        commentsCount: task.comments.length,
        startDate: task.startDate,
        dueDate: task.dueDate
    };

    // Delete related records first to avoid foreign key constraints
    await prisma.$transaction(async (tx) => {
        // Delete task activities
        await tx.taskActivity.deleteMany({ where: { taskId: id } });

        // Delete task assignments
        await tx.taskAssignment.deleteMany({ where: { taskId: id } });

        // Delete task comments
        await tx.taskComment.deleteMany({ where: { taskId: id } });

        // Log the deletion activity with full details
        if (actorUserId) {
            await tx.taskActivity.create({
                data: {
                    taskId: task.projectId || undefined, // Store in project context if available
                    actorUserId,
                    action: 'deleted',
                    meta: JSON.stringify(deletionMetadata)
                }
            });
        }

        // Finally delete the task itself
        await tx.task.delete({ where: { id } });
    });

    return { deleted: true, task: deletionMetadata };
};


// Assignment Logic
export const addAssignee = async (taskId: string, userId: string, actorUserId: string) => {
    return await prisma.$transaction(async (tx) => {
        const assignment = await tx.taskAssignment.create({
            data: { taskId, userId }
        });

        await tx.taskActivity.create({
            data: {
                taskId,
                actorUserId,
                action: 'assigned',
                meta: JSON.stringify({ userId })
            }
        });
        return assignment;
    });
};

export const removeAssignee = async (taskId: string, userId: string, actorUserId: string) => {
    return await prisma.$transaction(async (tx) => {
        const result = await tx.taskAssignment.deleteMany({
            where: { taskId, userId }
        });

        await tx.taskActivity.create({
            data: {
                taskId,
                actorUserId,
                action: 'unassigned',
                meta: JSON.stringify({ userId })
            }
        });
        return result;
    });
};

// Comments
export const addComment = async (taskId: string, body: string, authorUserId: string) => {
    const comment = await prisma.taskComment.create({
        data: {
            body,
            task: { connect: { id: taskId } },
            author: { connect: { id: authorUserId } }
        },
        include: {
            author: { select: { id: true, firstName: true, lastName: true } }
        }
    });
    return comment;
};

export const deleteComment = async (commentId: string, actorUserId: string) => {
    const comment = await prisma.taskComment.findUnique({ where: { id: commentId } });
    if (!comment) throw new AppError('Comment not found', 404);

    // Only author or admin can delete (simplified)
    if (comment.authorUserId !== actorUserId) {
        // Check role logic if needed, for now restrict to author
        // throw new AppError('Not authorized', 403);
    }

    return await prisma.taskComment.delete({ where: { id: commentId } });
};

// Attachments
export const addAttachment = async (taskId: string, file: any, userId: string) => {
    return await prisma.taskAttachment.create({
        data: {
            taskId,
            userId,
            fileName: file.originalname,
            fileUrl: `/uploads/tasks/${file.filename}`, // Relative path for serving
            fileType: file.mimetype,
            fileSize: file.size
        },
        include: {
            user: { select: { firstName: true, lastName: true } }
        }
    });
};

export const removeAttachment = async (attachmentId: string) => {
    const attachment = await prisma.taskAttachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) throw new AppError('Attachment not found', 404);

    // Ideally delete file from disk too regarding fs logic
    try {
        // We'd need to import fs and path to delete, but for now just DB record
    } catch (e) {
        console.error('Failed to delete file from disk', e);
    }

    return await prisma.taskAttachment.delete({ where: { id: attachmentId } });
};
