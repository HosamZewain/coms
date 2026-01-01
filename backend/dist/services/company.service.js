"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettings = exports.getSettings = exports.updateCompanyProfile = exports.getCompanyProfile = exports.deletePosition = exports.updatePosition = exports.createPosition = exports.getPositions = exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getTeams = exports.deleteDepartment = exports.updateDepartment = exports.createDepartment = exports.getDepartments = void 0;
const prisma_1 = require("../utils/prisma");
// const prisma = new PrismaClient();
// Departments
const getDepartments = async () => {
    return await prisma_1.prisma.department.findMany({
        include: {
            manager: { select: { firstName: true, lastName: true, id: true, employeeProfile: { select: { profileImage: true } } } },
            teams: {
                include: {
                    leader: { select: { firstName: true, lastName: true, id: true, employeeProfile: { select: { profileImage: true } } } },
                    _count: { select: { members: true } }
                }
            },
            _count: { select: { teams: true, positions: true } }
        }
    });
};
exports.getDepartments = getDepartments;
const createDepartment = async (name, managerId) => {
    return await prisma_1.prisma.department.create({
        data: {
            name,
            managerId
        }
    });
};
exports.createDepartment = createDepartment;
const updateDepartment = async (id, name, managerId) => {
    return await prisma_1.prisma.department.update({
        where: { id },
        data: {
            name,
            managerId
        }
    });
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (id) => {
    return await prisma_1.prisma.department.delete({ where: { id } });
};
exports.deleteDepartment = deleteDepartment;
// Teams
const getTeams = async (departmentId) => {
    const where = departmentId ? { departmentId } : {};
    return await prisma_1.prisma.team.findMany({
        where,
        include: {
            leader: { select: { firstName: true, lastName: true, id: true } },
            department: { select: { name: true } },
            _count: { select: { members: true } }
        }
    });
};
exports.getTeams = getTeams;
const createTeam = async (data) => {
    return await prisma_1.prisma.team.create({
        data: {
            name: data.name,
            departmentId: data.departmentId,
            leaderId: data.leaderId
        }
    });
};
exports.createTeam = createTeam;
const updateTeam = async (id, data) => {
    return await prisma_1.prisma.team.update({
        where: { id },
        data: {
            name: data.name,
            leaderId: data.leaderId
        }
    });
};
exports.updateTeam = updateTeam;
const deleteTeam = async (id) => {
    return await prisma_1.prisma.team.delete({ where: { id } });
};
exports.deleteTeam = deleteTeam;
// Positions
const getPositions = async () => {
    return await prisma_1.prisma.position.findMany({ include: { department: true } });
};
exports.getPositions = getPositions;
const createPosition = async (title, departmentId) => {
    return await prisma_1.prisma.position.create({ data: { title, departmentId } });
};
exports.createPosition = createPosition;
const updatePosition = async (id, title) => {
    return await prisma_1.prisma.position.update({ where: { id }, data: { title } });
};
exports.updatePosition = updatePosition;
const deletePosition = async (id) => {
    return await prisma_1.prisma.position.delete({ where: { id } });
};
exports.deletePosition = deletePosition;
// Company Profile Settings
const getCompanyProfile = async () => {
    const settings = await prisma_1.prisma.setting.findMany({
        where: { key: { in: ['companyName', 'website', 'address'] } }
    });
    const profile = {};
    settings.forEach(s => profile[s.key] = s.value);
    return profile;
};
exports.getCompanyProfile = getCompanyProfile;
const updateCompanyProfile = async (data) => {
    if (data.companyName)
        await prisma_1.prisma.setting.upsert({ where: { key: 'companyName' }, update: { value: data.companyName }, create: { key: 'companyName', value: data.companyName } });
    if (data.website)
        await prisma_1.prisma.setting.upsert({ where: { key: 'website' }, update: { value: data.website }, create: { key: 'website', value: data.website } });
    if (data.address)
        await prisma_1.prisma.setting.upsert({ where: { key: 'address' }, update: { value: data.address }, create: { key: 'address', value: data.address } });
    return { success: true };
};
exports.updateCompanyProfile = updateCompanyProfile;
// Generic Settings
const getSettings = async (keys) => {
    const settings = await prisma_1.prisma.setting.findMany({
        where: { key: { in: keys } }
    });
    const result = {};
    settings.forEach(s => {
        if (s.value === 'true')
            result[s.key] = true;
        else if (s.value === 'false')
            result[s.key] = false;
        else
            result[s.key] = s.value;
    });
    return result;
};
exports.getSettings = getSettings;
const updateSettings = async (data) => {
    for (const [key, value] of Object.entries(data)) {
        await prisma_1.prisma.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });
    }
    return { success: true };
};
exports.updateSettings = updateSettings;
