import { PrismaClient } from '@prisma/client';
// import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // 0. Cleanup existing data to ensure idempotency
    await prisma.attendanceRecord.deleteMany({});
    await prisma.leaveRequest.deleteMany({});
    await prisma.leaveBalance.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.compensation.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.interview.deleteMany({});
    await prisma.applicant.deleteMany({});
    await prisma.job.deleteMany({});
    await prisma.position.deleteMany({});
    await prisma.employeeProfile.deleteMany({});
    await prisma.dependent.deleteMany({});
    await prisma.employeeDocument.deleteMany({});
    await prisma.team.updateMany({ data: { leaderId: null } });
    await prisma.department.updateMany({ data: { managerId: null } });
    await prisma.user.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.department.deleteMany({});

    // 1. Create Roles
    const roles = [
        { name: 'Admin', permissions: ['*:*'] },
        { name: 'Director', permissions: ['*:*'] },
        { name: 'HR', permissions: ['employees:*', 'attendance:*', 'recruitment:*', 'reports:view'] },
        { name: 'Manager', permissions: ['employees:view', 'employees:edit', 'attendance:view', 'attendance:edit', 'reports:view'] },
        { name: 'TeamLeader', permissions: ['attendance:view', 'projects:view', 'projects:edit'] },
        { name: 'Employee', permissions: ['attendance:view', 'projects:view'] },
    ];

    const roleMap: Record<string, string> = {};

    for (const r of roles) {
        const role = await prisma.role.upsert({
            where: { name: r.name },
            update: {},
            create: { name: r.name, permissions: r.permissions },
        });
        roleMap[r.name] = role.id;
        console.log(`Created Role: ${r.name}`);
    }

    // 2. Create Departments
    const deptEngineering = await prisma.department.upsert({
        where: { name: 'Engineering' },
        update: {},
        create: { name: 'Engineering' },
    });
    console.log(`Created Dept: Engineering`);

    const deptSales = await prisma.department.upsert({
        where: { name: 'Sales' },
        update: {},
        create: { name: 'Sales' },
    });
    console.log(`Created Dept: Sales`);

    // 3. Create Teams
    const teamFrontend = await prisma.team.create({
        data: {
            name: 'Frontend Team',
            departmentId: deptEngineering.id,
        },
    });
    console.log(`Created Team: Frontend Team`);

    const teamBackend = await prisma.team.create({
        data: {
            name: 'Backend Team',
            departmentId: deptEngineering.id,
        },
    });
    console.log(`Created Team: Backend Team`);

    // 4. Create Users (Password: 123456)
    // const hashedPassword = await hash('123456', 10); // If bcrypt is available
    const hashedPassword = '$2b$10$VuyFi7/yPN/H0esIr9WIm.tagAN1B6G/1BJK8xvwuBk5qUxK/Vfnq'; // Valid hash for '123456'

    // Admin
    await prisma.user.upsert({
        where: { email: 'admin@tcoms.com' },
        update: { roleId: roleMap['Admin'] },
        create: {
            email: 'admin@tcoms.com',
            firstName: 'System',
            lastName: 'Admin',
            password: hashedPassword,
            roleId: roleMap['Admin'],
        },
    });

    // Director
    await prisma.user.upsert({
        where: { email: 'director@tcoms.com' },
        update: { roleId: roleMap['Director'] },
        create: {
            email: 'director@tcoms.com',
            firstName: 'Diana',
            lastName: 'Director',
            password: hashedPassword,
            roleId: roleMap['Director'],
        },
    });

    // Engineering Manager
    const mgrEng = await prisma.user.upsert({
        where: { email: 'manager.eng@tcoms.com' },
        update: { roleId: roleMap['Manager'] },
        create: {
            email: 'manager.eng@tcoms.com',
            firstName: 'Mike',
            lastName: 'Manager',
            password: hashedPassword,
            roleId: roleMap['Manager'],
        },
    });
    // Assign as Manager of Engineering
    await prisma.department.update({
        where: { id: deptEngineering.id },
        data: { managerId: mgrEng.id },
    });

    // Frontend Team Leader
    const leadFrontend = await prisma.user.upsert({
        where: { email: 'lead.front@tcoms.com' },
        update: { roleId: roleMap['TeamLeader'], teamId: teamFrontend.id },
        create: {
            email: 'lead.front@tcoms.com',
            firstName: 'Fiona',
            lastName: 'Frontend',
            password: hashedPassword,
            roleId: roleMap['TeamLeader'],
            teamId: teamFrontend.id,
        },
    });
    // Assign as Leader of Frontend Team
    await prisma.team.update({
        where: { id: teamFrontend.id },
        data: { leaderId: leadFrontend.id },
    });

    // Employee (Frontend)
    const devFront = await prisma.user.upsert({
        where: { email: 'dev.front@tcoms.com' },
        update: { roleId: roleMap['Employee'], teamId: teamFrontend.id },
        create: {
            email: 'dev.front@tcoms.com',
            firstName: 'Dave',
            lastName: 'Developer',
            password: hashedPassword,
            roleId: roleMap['Employee'],
            teamId: teamFrontend.id,
        },
    });
    // 5. Create Sample Project
    const project = await prisma.project.create({
        data: {
            name: 'Website Redesign',
            description: 'Overhaul of the corporate website.',
            department: 'Engineering',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
            members: {
                connect: [
                    { id: leadFrontend.id },
                    { id: devFront.id }
                ]
            }
        }
    });
    console.log(`Created Project: Website Redesign`);
    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
