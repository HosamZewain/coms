import { PrismaClient } from '@prisma/client';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';

import { slugify } from '../utils/slug.utils';

export const createEmployee = async (data: any) => {
    const { firstName, lastName, email, password, roleId, departmentId, teamId, ...profileData } = data;

    // Generate slug
    let slug = slugify(`${firstName} ${lastName}`);
    let counter = 1;
    let baseSlug = slug;

    while (await prisma.user.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    const hashedPassword = await bcrypt.hash(password || 'Welcome123', 10);

    return await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            slug,
            password: hashedPassword,
            roleId,
            departmentId,
            teamId,
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
            employeeProfile: true,
            department: true,
            team: true
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
            employeeProfile: true,
            department: true,
            team: true
        }
    });
};

export const getEmployeeById = async (idOrSlug: string) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    return await prisma.user.findUnique({
        where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
        include: {
            role: true,
            employeeProfile: true,
            department: true,
            team: {
                include: { department: true }
            }
        }
    });
};

export const updateEmployeeById = async (id: string, data: any) => {
    const { employeeProfile, isDepartmentManager, isTeamLeader, ...rawUserData } = data;

    // Resolve ID if it's a slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let targetId = id;

    if (!isUuid) {
        const user = await prisma.user.findUnique({ where: { slug: id } });
        if (!user) throw new Error('Employee not found');
        targetId = user.id;
    }

    // 1. Whitelist User Fields
    const allowedUserFields = ['firstName', 'lastName', 'email', 'slug', 'roleId', 'departmentId', 'teamId'];
    const userData: any = {};
    allowedUserFields.forEach(field => {
        if (rawUserData[field] !== undefined) userData[field] = rawUserData[field];
    });

    // 2. Whitelist Profile Fields
    const allowedProfileFields = [
        'bio', 'jobTitle', 'phoneNumber', 'address', 'gender', 'personalEmail',
        'workRegulationId', 'skills', 'attendanceRequired', 'tasksLogRequired',
        'workOutsideOfficeAllowed', 'salary',
        'dateOfBirth', 'employmentStartDate', 'employmentEndDate', 'joiningDate'
    ];

    const sanitizeProfile = (profile: any) => {
        if (!profile) return {};
        const sanitized: any = {};

        allowedProfileFields.forEach(field => {
            if (profile[field] !== undefined) sanitized[field] = profile[field];
        });

        // Convert Dates and Numbers (Handle empty strings)
        if (sanitized.dateOfBirth) sanitized.dateOfBirth = new Date(sanitized.dateOfBirth);
        else if (sanitized.dateOfBirth === '') sanitized.dateOfBirth = null;

        if (sanitized.employmentStartDate) sanitized.employmentStartDate = new Date(sanitized.employmentStartDate);
        else if (sanitized.employmentStartDate === '') sanitized.employmentStartDate = null;

        if (sanitized.employmentEndDate) sanitized.employmentEndDate = new Date(sanitized.employmentEndDate);
        else if (sanitized.employmentEndDate === '') sanitized.employmentEndDate = null;

        if (sanitized.joiningDate) sanitized.joiningDate = new Date(sanitized.joiningDate);
        else if (sanitized.joiningDate === '') sanitized.joiningDate = null;

        if (sanitized.salary) sanitized.salary = parseFloat(sanitized.salary.toString());
        else if (sanitized.salary === '') sanitized.salary = null;

        return sanitized;
    };

    const sanitizedProfile = sanitizeProfile(employeeProfile);

    // Update User and Profile
    const updatedUser = await prisma.user.update({
        where: { id: targetId },
        data: {
            ...userData,
            employeeProfile: {
                upsert: {
                    create: sanitizedProfile,
                    update: sanitizedProfile
                }
            }
        },
        include: { department: true, team: true }
    });

    // Handle Department Manager Promotion/Demotion
    if (userData.departmentId) {
        if (isDepartmentManager) {
            // Promote to Manager of current department
            await prisma.department.update({
                where: { id: userData.departmentId },
                data: { managerId: targetId }
            });
        }
    }

    // Handle Team Leader Promotion
    if (userData.teamId) {
        if (isTeamLeader) {
            await prisma.team.update({
                where: { id: userData.teamId },
                data: { leaderId: targetId }
            });
        }
    }

    return updatedUser;
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
