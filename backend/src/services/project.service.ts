import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';

export const createProject = async (data: any) => {
    return await prisma.project.create({
        data: {
            name: data.name,
            description: data.description,
            department: data.department,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            status: data.status || 'ACTIVE'
        }
    });
};

export const getAllProjects = async (filters: any = {}) => {
    const { status, department } = filters;
    const where: any = {};

    if (status) where.status = status;
    if (department) where.department = department;

    return await prisma.project.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: {
                    tasks: true,
                    milestones: true
                }
            }
        }
    });
};

export const getProjectById = async (id: string) => {
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            tasks: {
                include: {
                    assignee: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    },
                    assignments: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            },
            plans: {
                include: {
                    milestones: {
                        include: {
                            _count: { select: { tasks: true } }
                        },
                        orderBy: { date: 'asc' }
                    },
                    _count: { select: { tasks: true } }
                }
            },
            milestones: true, // Keep for legacy/direct project milestones if any
            _count: {
                select: { tasks: true, plans: true, members: true }
            },
            members: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: { select: { name: true } }
                }
            }
        }
    });

    if (!project) throw new AppError('Project not found', 404);
    return project;
};

export const getProjectMembers = async (projectId: string) => {
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
            members: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: { select: { name: true } }
                }
            }
        }
    });

    if (!project) throw new AppError('Project not found', 404);
    return project.members;
};

export const updateProject = async (id: string, data: any) => {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) throw new AppError('Project not found', 404);

    return await prisma.project.update({
        where: { id },
        data: {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
        }
    });
};

export const deleteProject = async (id: string, actorUserId?: string) => {
    // Fetch complete project details before deletion for logging
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            tasks: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    assignments: {
                        include: {
                            user: { select: { firstName: true, lastName: true } }
                        }
                    }
                }
            }
            // epics relation does not exist on Project in schema
        }
    });

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    // Prepare detailed metadata for activity log
    const deletionMetadata = {
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate,
        tasksCount: project.tasks.length,
        tasks: project.tasks.map(t => ({
            title: t.title,
            status: t.status,
            priority: t.priority,
            assignees: t.assignments.map(a => `${a.user.firstName} ${a.user.lastName}`)
        }))
    };

    // Delete all related records first to avoid foreign key constraints
    await prisma.$transaction(async (tx) => {
        // Get all tasks for this project
        const tasks = await tx.task.findMany({ where: { projectId: id } });
        const taskIds = tasks.map(t => t.id);

        // Delete all task-related records
        if (taskIds.length > 0) {
            await tx.taskActivity.deleteMany({ where: { taskId: { in: taskIds } } });
            await tx.taskAssignment.deleteMany({ where: { taskId: { in: taskIds } } });
            await tx.taskComment.deleteMany({ where: { taskId: { in: taskIds } } });
        }

        // Delete tasks
        await tx.task.deleteMany({ where: { projectId: id } });

        // Delete milestones (Cascading delete for Milestones)
        await tx.milestone.deleteMany({ where: { projectId: id } });

        // Note: Epics do not have projectId in this schema version, so no cascade needed/possible here directly.

        // Log the deletion activity with full details
        if (actorUserId) {
            await tx.taskActivity.create({
                data: {
                    actorUserId,
                    action: 'project_deleted',
                    meta: JSON.stringify(deletionMetadata)
                }
            });
        }

        // Finally delete the project
        await tx.project.delete({ where: { id } });
    });

    return { deleted: true, project: deletionMetadata };
};

export const addMember = async (projectId: string, userId: string) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError('Project not found', 404);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    return await prisma.project.update({
        where: { id: projectId },
        data: {
            members: {
                connect: { id: userId }
            }
        },
        include: {
            members: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: { select: { name: true } }
                }
            }
        }
    });
};

export const removeMember = async (projectId: string, userId: string) => {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new AppError('Project not found', 404);

    return await prisma.project.update({
        where: { id: projectId },
        data: {
            members: {
                disconnect: { id: userId }
            }
        }
    });
};
