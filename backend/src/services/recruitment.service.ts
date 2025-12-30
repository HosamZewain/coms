import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';

// const prisma = new PrismaClient();

// Jobs
export const createJob = async (data: any) => {
    // Ensure isActive is boolean
    if (data.isActive === 'true') data.isActive = true;
    if (data.isActive === 'false') data.isActive = false;
    return await prisma.job.create({ data });
};

export const getJobs = async () => {
    return await prisma.job.findMany({ orderBy: { createdAt: 'desc' } });
};

export const getJob = async (id: string) => {
    return await prisma.job.findUnique({ where: { id } });
};

export const getPublicJobs = async () => {
    return await prisma.job.findMany({
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

export const getPublicJob = async (id: string) => {
    return await prisma.job.findUnique({
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

// Applicants
export const addApplicant = async (data: any) => {
    // data should include: firstName, lastName, email, phone, linkedinUrl, experienceYears, residence, resumeUrl, jobId
    // Ensure experienceYears is an integer if passed as string
    if (data.experienceYears && typeof data.experienceYears === 'string') {
        data.experienceYears = parseInt(data.experienceYears, 10);
    }
    return await prisma.applicant.create({ data });
};

export const getApplicants = async (jobId?: string) => {
    const where = jobId ? { jobId } : {};
    return await prisma.applicant.findMany({ where, include: { job: true }, orderBy: { createdAt: 'desc' } });
};

export const updateApplicantStatus = async (id: string, status: string) => {
    const applicant = await prisma.applicant.findUnique({ where: { id } });
    if (!applicant) throw new Error('Applicant not found'); // Assuming AppError is defined elsewhere or using a generic Error

    return await prisma.applicant.update({
        where: { id },
        data: { status }
    });
};

export const getApplicant = async (id: string) => {
    return await prisma.applicant.findUnique({
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



// Interviews
export const scheduleInterview = async (data: any) => {
    // data: applicantId, interviewerId, date
    return await prisma.interview.create({
        data: {
            ...data,
            status: 'SCHEDULED'
        }
    });
};

export const getMyInterviews = async (userId: string) => {
    return await prisma.interview.findMany({
        where: { interviewerId: userId },
        include: { applicant: true },
        orderBy: { date: 'asc' }
    });
};
