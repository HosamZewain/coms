"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMember = exports.addMember = exports.deleteProject = exports.updateProject = exports.getProjectMembers = exports.getProjectById = exports.getAllProjects = exports.createProject = void 0;
const prisma_1 = require("../utils/prisma");
const error_1 = require("../utils/error");
const slug_utils_1 = require("../utils/slug.utils");
const createProject = async (data) => {
    let slug = (0, slug_utils_1.slugify)(data.name);
    let counter = 1;
    let baseSlug = slug;
    // Ensure uniqueness
    while (await prisma_1.prisma.project.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    return await prisma_1.prisma.project.create({
        data: {
            name: data.name,
            slug,
            description: data.description,
            department: data.department,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            status: data.status || 'ACTIVE'
        }
    });
};
exports.createProject = createProject;
const getAllProjects = async (filters = {}) => {
    const { status, department } = filters;
    const where = {};
    if (status)
        where.status = status;
    if (department)
        where.department = department;
    return await prisma_1.prisma.project.findMany({
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
exports.getAllProjects = getAllProjects;
const getProjectById = async (idOrSlug) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const project = await prisma_1.prisma.project.findUnique({
        where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
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
    if (!project)
        throw new error_1.AppError('Project not found', 404);
    return project;
};
exports.getProjectById = getProjectById;
const getProjectMembers = async (projectId) => {
    const project = await prisma_1.prisma.project.findUnique({
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
    if (!project)
        throw new error_1.AppError('Project not found', 404);
    return project.members;
};
exports.getProjectMembers = getProjectMembers;
const updateProject = async (id, data) => {
    const project = await prisma_1.prisma.project.findUnique({ where: { id } });
    if (!project)
        throw new error_1.AppError('Project not found', 404);
    let slug = project.slug;
    // If name changes, regenerate slug
    if (data.name && data.name !== project.name) {
        slug = (0, slug_utils_1.slugify)(data.name);
        let counter = 1;
        let baseSlug = slug;
        while (await prisma_1.prisma.project.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }
    return await prisma_1.prisma.project.update({
        where: { id },
        data: {
            ...data,
            slug,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
        }
    });
};
exports.updateProject = updateProject;
const deleteProject = async (id, actorUserId) => {
    // Fetch complete project details before deletion for logging
    const project = await prisma_1.prisma.project.findUnique({
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
        throw new error_1.AppError('Project not found', 404);
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
            assignees: t.assignments.map(a => a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Unknown')
        }))
    };
    // Delete all related records first to avoid foreign key constraints
    await prisma_1.prisma.$transaction(async (tx) => {
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
        // Log the deletion activity with full details using AuditLog instead
        if (actorUserId) {
            await tx.auditLog.create({
                data: {
                    userId: actorUserId,
                    action: 'project_deleted',
                    resource: 'Project',
                    details: JSON.stringify(deletionMetadata)
                }
            });
        }
        // Finally delete the project
        await tx.project.delete({ where: { id } });
    });
    return { deleted: true, project: deletionMetadata };
};
exports.deleteProject = deleteProject;
const addMember = async (projectId, userId) => {
    const project = await prisma_1.prisma.project.findUnique({ where: { id: projectId } });
    if (!project)
        throw new error_1.AppError('Project not found', 404);
    const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw new error_1.AppError('User not found', 404);
    return await prisma_1.prisma.project.update({
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
exports.addMember = addMember;
const removeMember = async (projectId, userId) => {
    const project = await prisma_1.prisma.project.findUnique({ where: { id: projectId } });
    if (!project)
        throw new error_1.AppError('Project not found', 404);
    return await prisma_1.prisma.project.update({
        where: { id: projectId },
        data: {
            members: {
                disconnect: { id: userId }
            }
        }
    });
};
exports.removeMember = removeMember;
