import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';

// const prisma = new PrismaClient();

// Departments
export const getDepartments = async () => {
    return await prisma.department.findMany({
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

export const createDepartment = async (name: string, managerId?: string) => {
    return await prisma.department.create({
        data: {
            name,
            managerId
        }
    });
};

export const updateDepartment = async (id: string, name: string, managerId?: string) => {
    return await prisma.department.update({
        where: { id },
        data: {
            name,
            managerId
        }
    });
};

export const deleteDepartment = async (id: string) => {
    return await prisma.department.delete({ where: { id } });
};

// Teams
export const getTeams = async (departmentId?: string) => {
    const where = departmentId ? { departmentId } : {};
    return await prisma.team.findMany({
        where,
        include: {
            leader: { select: { firstName: true, lastName: true, id: true } },
            department: { select: { name: true } },
            _count: { select: { members: true } }
        }
    });
};

export const createTeam = async (data: { name: string, departmentId: string, leaderId?: string }) => {
    return await prisma.team.create({
        data: {
            name: data.name,
            departmentId: data.departmentId,
            leaderId: data.leaderId
        }
    });
};

export const updateTeam = async (id: string, data: { name?: string, leaderId?: string }) => {
    return await prisma.team.update({
        where: { id },
        data: {
            name: data.name,
            leaderId: data.leaderId
        }
    });
};

export const deleteTeam = async (id: string) => {
    return await prisma.team.delete({ where: { id } });
};

// Positions
export const getPositions = async () => {
    return await prisma.position.findMany({ include: { department: true } });
};

export const createPosition = async (title: string, departmentId: string) => {
    return await prisma.position.create({ data: { title, departmentId } });
};

export const updatePosition = async (id: string, title: string) => {
    return await prisma.position.update({ where: { id }, data: { title } });
};

export const deletePosition = async (id: string) => {
    return await prisma.position.delete({ where: { id } });
};

// Company Profile Settings
export const getCompanyProfile = async () => {
    const settings = await prisma.setting.findMany({
        where: { key: { in: ['companyName', 'website', 'address'] } }
    });
    const profile: any = {};
    settings.forEach(s => profile[s.key] = s.value);
    return profile;
};

export const updateCompanyProfile = async (data: any) => {
    if (data.companyName) await prisma.setting.upsert({ where: { key: 'companyName' }, update: { value: data.companyName }, create: { key: 'companyName', value: data.companyName } });
    if (data.website) await prisma.setting.upsert({ where: { key: 'website' }, update: { value: data.website }, create: { key: 'website', value: data.website } });
    if (data.address) await prisma.setting.upsert({ where: { key: 'address' }, update: { value: data.address }, create: { key: 'address', value: data.address } });
    return { success: true };
};

// Generic Settings
export const getSettings = async (keys: string[]) => {
    const settings = await prisma.setting.findMany({
        where: { key: { in: keys } }
    });
    const result: any = {};
    settings.forEach(s => {
        if (s.value === 'true') result[s.key] = true;
        else if (s.value === 'false') result[s.key] = false;
        else result[s.key] = s.value;
    });
    return result;
};

export const updateSettings = async (data: Record<string, any>) => {
    for (const [key, value] of Object.entries(data)) {
        await prisma.setting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });
    }
    return { success: true };
};
