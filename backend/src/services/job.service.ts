import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';

export const createJob = async (data: any) => {
    return await prisma.job.create({
        data: {
            title: data.title,
            description: data.description,
            department: data.department,
            location: data.location,
            type: data.type,
            level: data.level,
            isActive: data.isActive ?? true,
            status: data.status || 'OPEN'
        }
    });
};

export const getAllJobs = async (filters: any = {}) => {
    const { status, department, isActive } = filters;
    const where: any = {};

    if (status) where.status = status;
    if (department) where.department = department;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    return await prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { applicants: true }
            }
        }
    });
};

export const getJobById = async (id: string) => {
    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            applicants: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    status: true,
                    createdAt: true
                }
            }
        }
    });

    if (!job) {
        throw new AppError('Job not found', 404);
    }

    return job;
};

export const updateJob = async (id: string, data: any) => {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new AppError('Job not found', 404);

    return await prisma.job.update({
        where: { id },
        data
    });
};

export const deleteJob = async (id: string) => {
    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) throw new AppError('Job not found', 404);

    return await prisma.job.delete({ where: { id } });
};

export const getPublicJobs = async () => {
    return await prisma.job.findMany({
        where: {
            isActive: true,
            status: 'OPEN'
        },
        select: {
            id: true,
            title: true,
            department: true,
            location: true,
            type: true,
            level: true,
            description: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });
};

export const getPublicJobById = async (id: string) => {
    const job = await prisma.job.findUnique({
        where: { id, isActive: true },
        select: {
            id: true,
            title: true,
            department: true,
            location: true,
            type: true,
            level: true,
            description: true,
            createdAt: true
        }
    });
    if (!job) throw new AppError('Job not found', 404);
    return job;
};

export const applyToJob = async (jobId: string, data: any) => {
    const job = await prisma.job.findUnique({ where: { id: jobId, isActive: true } });
    if (!job) throw new AppError('Job not found or not active', 404);

    return await prisma.applicant.create({
        data: {
            jobId,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            resumeUrl: data.resumeUrl,
            linkedinUrl: data.linkedinUrl,
            experienceYears: data.experienceYears ? parseInt(data.experienceYears) : undefined,
            residence: data.residence,
            status: 'NEW'
        }
    });
};

export const getJobApplicants = async (jobId: string) => {
    return await prisma.applicant.findMany({
        where: { jobId },
        orderBy: { createdAt: 'desc' }
    });
};
