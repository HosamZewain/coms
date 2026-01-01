"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobApplicants = exports.applyToJob = exports.getPublicJobById = exports.getPublicJobs = exports.deleteJob = exports.updateJob = exports.getJobById = exports.getAllJobs = exports.createJob = void 0;
const prisma_1 = require("../utils/prisma");
const error_1 = require("../utils/error");
const createJob = async (data) => {
    return await prisma_1.prisma.job.create({
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
exports.createJob = createJob;
const getAllJobs = async (filters = {}) => {
    const { status, department, isActive } = filters;
    const where = {};
    if (status)
        where.status = status;
    if (department)
        where.department = department;
    if (isActive !== undefined)
        where.isActive = isActive === 'true';
    return await prisma_1.prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { applicants: true }
            }
        }
    });
};
exports.getAllJobs = getAllJobs;
const getJobById = async (id) => {
    const job = await prisma_1.prisma.job.findUnique({
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
        throw new error_1.AppError('Job not found', 404);
    }
    return job;
};
exports.getJobById = getJobById;
const updateJob = async (id, data) => {
    const job = await prisma_1.prisma.job.findUnique({ where: { id } });
    if (!job)
        throw new error_1.AppError('Job not found', 404);
    return await prisma_1.prisma.job.update({
        where: { id },
        data
    });
};
exports.updateJob = updateJob;
const deleteJob = async (id) => {
    const job = await prisma_1.prisma.job.findUnique({ where: { id } });
    if (!job)
        throw new error_1.AppError('Job not found', 404);
    return await prisma_1.prisma.job.delete({ where: { id } });
};
exports.deleteJob = deleteJob;
const getPublicJobs = async () => {
    return await prisma_1.prisma.job.findMany({
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
exports.getPublicJobs = getPublicJobs;
const getPublicJobById = async (id) => {
    const job = await prisma_1.prisma.job.findUnique({
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
    if (!job)
        throw new error_1.AppError('Job not found', 404);
    return job;
};
exports.getPublicJobById = getPublicJobById;
const applyToJob = async (jobId, data) => {
    const job = await prisma_1.prisma.job.findUnique({ where: { id: jobId, isActive: true } });
    if (!job)
        throw new error_1.AppError('Job not found or not active', 404);
    return await prisma_1.prisma.applicant.create({
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
exports.applyToJob = applyToJob;
const getJobApplicants = async (jobId) => {
    return await prisma_1.prisma.applicant.findMany({
        where: { jobId },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getJobApplicants = getJobApplicants;
