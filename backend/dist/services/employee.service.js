"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeDependent = exports.addDependent = exports.upsertProfile = exports.updateEmployeeById = exports.getEmployeeById = exports.getAllEmployees = exports.getProfile = exports.createEmployee = void 0;
const prisma_1 = require("../utils/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const slug_utils_1 = require("../utils/slug.utils");
const createEmployee = async (data) => {
    const { firstName, lastName, email, password, roleId, departmentId, teamId, ...profileData } = data;
    // Generate slug
    let slug = (0, slug_utils_1.slugify)(`${firstName} ${lastName}`);
    let counter = 1;
    let baseSlug = slug;
    while (await prisma_1.prisma.user.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    const hashedPassword = await bcryptjs_1.default.hash(password || 'Welcome123', 10);
    return await prisma_1.prisma.user.create({
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
exports.createEmployee = createEmployee;
const getProfile = async (userId) => {
    return await prisma_1.prisma.employeeProfile.findUnique({
        where: { userId },
        include: { dependents: true, documents: true, user: true }
    });
};
exports.getProfile = getProfile;
const getAllEmployees = async () => {
    return await prisma_1.prisma.user.findMany({
        where: {}, // Return all users including Admins
        include: {
            role: true,
            employeeProfile: true,
            department: true,
            team: true
        }
    });
};
exports.getAllEmployees = getAllEmployees;
const getEmployeeById = async (idOrSlug) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    return await prisma_1.prisma.user.findUnique({
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
exports.getEmployeeById = getEmployeeById;
const updateEmployeeById = async (id, data) => {
    const { employeeProfile, isDepartmentManager, isTeamLeader, ...rawUserData } = data;
    // Resolve ID if it's a slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let targetId = id;
    if (!isUuid) {
        const user = await prisma_1.prisma.user.findUnique({ where: { slug: id } });
        if (!user)
            throw new Error('Employee not found');
        targetId = user.id;
    }
    // 1. Whitelist User Fields
    const allowedUserFields = ['firstName', 'lastName', 'email', 'slug', 'roleId', 'departmentId', 'teamId'];
    const userData = {};
    allowedUserFields.forEach(field => {
        if (rawUserData[field] !== undefined)
            userData[field] = rawUserData[field];
    });
    // 2. Whitelist Profile Fields
    const allowedProfileFields = [
        'bio', 'jobTitle', 'phoneNumber', 'address', 'gender', 'personalEmail',
        'workRegulationId', 'skills', 'attendanceRequired', 'tasksLogRequired',
        'workOutsideOfficeAllowed', 'salary',
        'dateOfBirth', 'employmentStartDate', 'employmentEndDate', 'joiningDate'
    ];
    const sanitizeProfile = (profile) => {
        if (!profile)
            return {};
        const sanitized = {};
        allowedProfileFields.forEach(field => {
            if (profile[field] !== undefined)
                sanitized[field] = profile[field];
        });
        // Convert Dates and Numbers (Handle empty strings)
        if (sanitized.dateOfBirth)
            sanitized.dateOfBirth = new Date(sanitized.dateOfBirth);
        else if (sanitized.dateOfBirth === '')
            sanitized.dateOfBirth = null;
        if (sanitized.employmentStartDate)
            sanitized.employmentStartDate = new Date(sanitized.employmentStartDate);
        else if (sanitized.employmentStartDate === '')
            sanitized.employmentStartDate = null;
        if (sanitized.employmentEndDate)
            sanitized.employmentEndDate = new Date(sanitized.employmentEndDate);
        else if (sanitized.employmentEndDate === '')
            sanitized.employmentEndDate = null;
        if (sanitized.joiningDate)
            sanitized.joiningDate = new Date(sanitized.joiningDate);
        else if (sanitized.joiningDate === '')
            sanitized.joiningDate = null;
        if (sanitized.salary)
            sanitized.salary = parseFloat(sanitized.salary.toString());
        else if (sanitized.salary === '')
            sanitized.salary = null;
        return sanitized;
    };
    const sanitizedProfile = sanitizeProfile(employeeProfile);
    // Update User and Profile
    const updatedUser = await prisma_1.prisma.user.update({
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
            await prisma_1.prisma.department.update({
                where: { id: userData.departmentId },
                data: { managerId: targetId }
            });
        }
    }
    // Handle Team Leader Promotion
    if (userData.teamId) {
        if (isTeamLeader) {
            await prisma_1.prisma.team.update({
                where: { id: userData.teamId },
                data: { leaderId: targetId }
            });
        }
    }
    return updatedUser;
};
exports.updateEmployeeById = updateEmployeeById;
const upsertProfile = async (userId, data) => {
    // Separate dependents logic if strictly normalized, but here assuming simple data object
    const { dependents, ...profileData } = data;
    return await prisma_1.prisma.employeeProfile.upsert({
        where: { userId },
        update: profileData,
        create: { userId, ...profileData }
    });
};
exports.upsertProfile = upsertProfile;
const addDependent = async (userId, dependentData) => {
    const profile = await prisma_1.prisma.employeeProfile.findUnique({ where: { userId } });
    if (!profile)
        throw new Error('Profile not found');
    return await prisma_1.prisma.dependent.create({
        data: {
            ...dependentData,
            employeeProfileId: profile.id
        }
    });
};
exports.addDependent = addDependent;
const removeDependent = async (dependentId) => {
    return await prisma_1.prisma.dependent.delete({ where: { id: dependentId } });
};
exports.removeDependent = removeDependent;
