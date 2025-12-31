import { prisma } from '../utils/prisma';
import { AppError } from '../utils/error';

// Work Regulations
export const createWorkRegulation = async (data: any) => {
    return await prisma.workRegulation.create({ data });
};

export const getWorkRegulations = async () => {
    return await prisma.workRegulation.findMany();
};

export const updateWorkRegulation = async (id: string, data: any) => {
    return await prisma.workRegulation.update({
        where: { id },
        data
    });
};

export const deleteWorkRegulation = async (id: string) => {
    return await prisma.workRegulation.delete({ where: { id } });
};

// Awards Setup (Award Types)
export const createAwardType = async (data: any) => {
    return await prisma.awardType.create({ data });
};

export const getAwardTypes = async () => {
    return await prisma.awardType.findMany();
};

// Awards (Giving Awards)
export const giveAward = async (data: any) => {
    return await prisma.award.create({
        data: {
            employeeId: data.employeeId,
            awardTypeId: data.awardTypeId,
            date: new Date(data.date),
            month: data.month,
            year: data.year ? parseInt(data.year as string) : undefined,
            note: data.note
        }
    });
};

export const getAwards = async () => {
    return await prisma.award.findMany({
        include: {
            user: { select: { firstName: true, lastName: true } },
            awardType: true
        }
    });
};

// Overtime
export const requestOvertime = async (userId: string, data: any) => {
    return await prisma.overtimeRequest.create({
        data: {
            userId,
            date: new Date(data.date),
            hours: parseFloat(data.hours),
            reason: data.reason
        }
    });
};

export const getOvertimeRequests = async (userId?: string) => {
    const where = userId ? { userId } : {};
    return await prisma.overtimeRequest.findMany({
        where,
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { date: 'desc' }
    });
};

export const updateOvertimeStatus = async (id: string, status: string, approverId: string) => {
    return await prisma.overtimeRequest.update({
        where: { id },
        data: { status, approverId }
    });
};

// Documents
export const uploadDocument = async (data: any, userId: string) => {
    return await prisma.documentArchive.create({
        data: {
            title: data.title,
            url: data.url, // Assuming file upload handled elsewhere returning URL
            uploadedBy: userId
        }
    });
};

export const getDocuments = async () => {
    return await prisma.documentArchive.findMany({
        include: { uploader: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
    });
};

export const incrementDocumentView = async (id: string) => {
    return await prisma.documentArchive.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
    });
};
