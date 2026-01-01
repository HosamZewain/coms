"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementDocumentView = exports.getDocuments = exports.uploadDocument = exports.updateOvertimeStatus = exports.getOvertimeRequests = exports.requestOvertime = exports.getAwards = exports.giveAward = exports.getAwardTypes = exports.createAwardType = exports.deleteWorkRegulation = exports.updateWorkRegulation = exports.getWorkRegulations = exports.createWorkRegulation = void 0;
const prisma_1 = require("../utils/prisma");
// Work Regulations
const createWorkRegulation = async (data) => {
    return await prisma_1.prisma.workRegulation.create({ data });
};
exports.createWorkRegulation = createWorkRegulation;
const getWorkRegulations = async () => {
    return await prisma_1.prisma.workRegulation.findMany();
};
exports.getWorkRegulations = getWorkRegulations;
const updateWorkRegulation = async (id, data) => {
    return await prisma_1.prisma.workRegulation.update({
        where: { id },
        data
    });
};
exports.updateWorkRegulation = updateWorkRegulation;
const deleteWorkRegulation = async (id) => {
    return await prisma_1.prisma.workRegulation.delete({ where: { id } });
};
exports.deleteWorkRegulation = deleteWorkRegulation;
// Awards Setup (Award Types)
const createAwardType = async (data) => {
    return await prisma_1.prisma.awardType.create({ data });
};
exports.createAwardType = createAwardType;
const getAwardTypes = async () => {
    return await prisma_1.prisma.awardType.findMany();
};
exports.getAwardTypes = getAwardTypes;
// Awards (Giving Awards)
const giveAward = async (data) => {
    return await prisma_1.prisma.award.create({
        data: {
            employeeId: data.employeeId,
            awardTypeId: data.awardTypeId,
            date: new Date(data.date),
            month: data.month,
            year: data.year ? parseInt(data.year) : undefined,
            note: data.note
        }
    });
};
exports.giveAward = giveAward;
const getAwards = async () => {
    return await prisma_1.prisma.award.findMany({
        include: {
            user: { select: { firstName: true, lastName: true } },
            awardType: true
        }
    });
};
exports.getAwards = getAwards;
// Overtime
const requestOvertime = async (userId, data) => {
    return await prisma_1.prisma.overtimeRequest.create({
        data: {
            userId,
            date: new Date(data.date),
            hours: parseFloat(data.hours),
            reason: data.reason
        }
    });
};
exports.requestOvertime = requestOvertime;
const getOvertimeRequests = async (userId) => {
    const where = userId ? { userId } : {};
    return await prisma_1.prisma.overtimeRequest.findMany({
        where,
        include: { user: { select: { firstName: true, lastName: true } } },
        orderBy: { date: 'desc' }
    });
};
exports.getOvertimeRequests = getOvertimeRequests;
const updateOvertimeStatus = async (id, status, approverId) => {
    return await prisma_1.prisma.overtimeRequest.update({
        where: { id },
        data: { status, approverId }
    });
};
exports.updateOvertimeStatus = updateOvertimeStatus;
// Documents
const uploadDocument = async (data, userId) => {
    return await prisma_1.prisma.documentArchive.create({
        data: {
            title: data.title,
            url: data.url, // Assuming file upload handled elsewhere returning URL
            uploadedBy: userId
        }
    });
};
exports.uploadDocument = uploadDocument;
const getDocuments = async () => {
    return await prisma_1.prisma.documentArchive.findMany({
        include: { uploader: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getDocuments = getDocuments;
const incrementDocumentView = async (id) => {
    return await prisma_1.prisma.documentArchive.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
    });
};
exports.incrementDocumentView = incrementDocumentView;
