"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyInterviews = exports.scheduleInterview = exports.getApplicant = exports.updateApplicantStatus = exports.getApplicants = exports.addApplicant = exports.getPublicJob = exports.getPublicJobs = exports.getJob = exports.getJobs = exports.createJob = void 0;
const prisma_1 = require("../utils/prisma");
// const prisma = new PrismaClient();
// Jobs
const createJob = async (data) => {
    // Ensure isActive is boolean
    if (data.isActive === 'true')
        data.isActive = true;
    if (data.isActive === 'false')
        data.isActive = false;
    return await prisma_1.prisma.job.create({ data });
};
exports.createJob = createJob;
const getJobs = async () => {
    return await prisma_1.prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
};
exports.getJobs = getJobs;
const getJob = async (id) => {
    return await prisma_1.prisma.job.findUnique({ where: { id } });
};
exports.getJob = getJob;
const getPublicJobs = async () => {
    return await prisma_1.prisma.job.findMany({
        where: { isActive: true, status: 'OPEN' },
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
const getPublicJob = async (id) => {
    return await prisma_1.prisma.job.findUnique({
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
};
exports.getPublicJob = getPublicJob;
// Applicants
const addApplicant = async (data) => {
    // data should include: firstName, lastName, email, phone, linkedinUrl, experienceYears, residence, resumeUrl, jobId
    // Ensure experienceYears is an integer if passed as string
    if (data.experienceYears && typeof data.experienceYears === 'string') {
        data.experienceYears = parseInt(data.experienceYears, 10);
    }
    return await prisma_1.prisma.applicant.create({ data });
};
exports.addApplicant = addApplicant;
const getApplicants = async (jobId) => {
    const where = jobId ? { jobId } : {};
    return await prisma_1.prisma.applicant.findMany({ where, include: { job: true }, orderBy: { createdAt: 'desc' } });
};
exports.getApplicants = getApplicants;
const updateApplicantStatus = async (id, status) => {
    const applicant = await prisma_1.prisma.applicant.findUnique({ where: { id } });
    if (!applicant)
        throw new Error('Applicant not found'); // Assuming AppError is defined elsewhere or using a generic Error
    return await prisma_1.prisma.applicant.update({
        where: { id },
        data: { status }
    });
};
exports.updateApplicantStatus = updateApplicantStatus;
const getApplicant = async (id) => {
    return await prisma_1.prisma.applicant.findUnique({
        where: { id },
        include: {
            job: true,
            interviews: {
                include: {
                    interviewer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                },
                orderBy: { date: 'desc' }
            }
        }
    });
};
exports.getApplicant = getApplicant;
// Interviews
const scheduleInterview = async (data) => {
    // data: applicantId, interviewerId, date
    return await prisma_1.prisma.interview.create({
        data: {
            ...data,
            status: 'SCHEDULED'
        }
    });
};
exports.scheduleInterview = scheduleInterview;
const getMyInterviews = async (userId) => {
    return await prisma_1.prisma.interview.findMany({
        where: { interviewerId: userId },
        include: { applicant: true },
        orderBy: { date: 'asc' }
    });
};
exports.getMyInterviews = getMyInterviews;
