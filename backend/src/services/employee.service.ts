import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';

export const createEmployee = async (data: any) => {
    const { firstName, lastName, email, password, roleId, departmentId, ...profileData } = data;

    const hashedPassword = await bcrypt.hash(password || 'Welcome123', 10);

    return await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            roleId,
            employeeProfile: {
                create: {
                    ...profileData,
                    joiningDate: profileData.joiningDate ? new Date(profileData.joiningDate) : new Date(),
                    dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth) : null,
                    employmentStartDate: profileData.employmentStartDate ? new Date(profileData.employmentStartDate) : null,
                    employmentEndDate: profileData.employmentEndDate ? new Date(profileData.employmentEndDate) : null,
                    attendanceRequired: profileData.attendanceRequired,
                    tasksLogRequired: profileData.tasksLogRequired,
                    workOutsideOfficeAllowed: profileData.workOutsideOfficeAllowed,
                    salary: profileData.salary ? parseFloat(profileData.salary.toString()) : null
                }
            }
        },
        include: {
            role: true,
            employeeProfile: true
        }
    });
};

export const getProfile = async (userId: string) => {
    return await prisma.employeeProfile.findUnique({
        where: { userId },
        include: { dependents: true, documents: true, user: true }
    });
};

export const getAllEmployees = async () => {
    return await prisma.user.findMany({
        where: {}, // Return all users including Admins
        include: {
            role: true,
            employeeProfile: true
        }
    });
};

export const getEmployeeById = async (id: string) => {
    return await prisma.user.findUnique({
        where: { id },
        include: {
            role: true,
            employeeProfile: true,
            team: {
                include: { department: true }
            }
        }
    });
};

export const updateEmployeeById = async (id: string, data: any) => {
    const { employeeProfile, ...userData } = data;

    // Helper to sanitize dates
    const sanitizeProfile = (profile: any) => {
        if (!profile) return {};
        const { dateOfBirth, employmentStartDate, employmentEndDate, joiningDate, ...rest } = profile;
        return {
            ...rest,
            ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
            ...(employmentStartDate && { employmentStartDate: new Date(employmentStartDate) }),
            ...(employmentEndDate && { employmentEndDate: new Date(employmentEndDate) }),
            ...(joiningDate && { joiningDate: new Date(joiningDate) }),
            ...(rest.attendanceRequired !== undefined && { attendanceRequired: rest.attendanceRequired }),
            ...(rest.tasksLogRequired !== undefined && { tasksLogRequired: rest.tasksLogRequired }),
            ...(rest.workOutsideOfficeAllowed !== undefined && { workOutsideOfficeAllowed: rest.workOutsideOfficeAllowed }),
            ...(rest.salary && { salary: parseFloat(rest.salary.toString()) }),
        };
    };

    const sanitizedProfile = sanitizeProfile(employeeProfile);

    return await prisma.user.update({
        where: { id },
        data: {
            ...userData,
            employeeProfile: {
                upsert: {
                    create: sanitizedProfile,
                    update: sanitizedProfile
                }
            }
        }
    });
};

export const upsertProfile = async (userId: string, data: any) => {
    // Separate dependents logic if strictly normalized, but here assuming simple data object
    const { dependents, ...profileData } = data;

    return await prisma.employeeProfile.upsert({
        where: { userId },
        update: profileData,
        create: { userId, ...profileData }
    });
};

export const addDependent = async (userId: string, dependentData: any) => {
    const profile = await prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile) throw new Error('Profile not found');

    return await prisma.dependent.create({
        data: {
            ...dependentData,
            employeeProfileId: profile.id
        }
    });
};

export const removeDependent = async (dependentId: string) => {
    return await prisma.dependent.delete({ where: { id: dependentId } });
};
