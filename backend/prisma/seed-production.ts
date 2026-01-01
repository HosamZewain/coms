import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Production Seed: Setting up essential data...');

    // 1. Create Roles
    const roles = [
        { name: 'Admin', permissions: ['*:*'] },
        { name: 'Director', permissions: ['*:*'] },
        { name: 'HR', permissions: ['employees:*', 'attendance:*', 'recruitment:*', 'reports:view', 'settings:view'] },
        { name: 'Manager', permissions: ['employees:view', 'employees:edit', 'attendance:view', 'attendance:edit', 'reports:view'] },
        { name: 'TeamLeader', permissions: ['attendance:view', 'projects:view', 'projects:edit'] },
        { name: 'Employee', permissions: ['attendance:view', 'projects:view'] },
    ];

    console.log('📋 Creating Roles...');
    for (const r of roles) {
        await prisma.role.upsert({
            where: { name: r.name },
            update: { permissions: r.permissions },
            create: { name: r.name, permissions: r.permissions },
        });
        console.log(`   ✓ Role: ${r.name}`);
    }

    // 2. Create Admin User
    const adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });

    if (!adminRole) {
        throw new Error('Admin role not found!');
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@company.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    console.log('👤 Creating Admin User...');
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            roleId: adminRole.id
        },
        create: {
            email: adminEmail,
            firstName: 'System',
            lastName: 'Administrator',
            password: hashedPassword,
            roleId: adminRole.id,
        },
    });
    console.log(`   ✓ Admin: ${adminEmail}`);

    // 3. Create Default Leave Types
    console.log('🏖️ Creating Leave Types...');
    const leaveTypes = [
        { name: 'Annual Leave', defaultDays: 21 },
        { name: 'Sick Leave', defaultDays: 14 },
        { name: 'Personal Leave', defaultDays: 5 },
        { name: 'Unpaid Leave', defaultDays: 30 },
        { name: 'Maternity Leave', defaultDays: 90 },
        { name: 'Paternity Leave', defaultDays: 5 },
    ];

    for (const lt of leaveTypes) {
        await prisma.leaveType.upsert({
            where: { name: lt.name },
            update: {},
            create: lt,
        });
        console.log(`   ✓ Leave Type: ${lt.name}`);
    }

    // 4. Create Default Award Types
    console.log('🏆 Creating Award Types...');
    const awardTypes = [
        { name: 'Employee of the Month', description: 'Monthly recognition for outstanding performance' },
        { name: 'Team Player Award', description: 'For exceptional collaboration and teamwork' },
        { name: 'Innovation Award', description: 'For creative solutions and innovations' },
        { name: 'Customer Hero', description: 'For exceptional customer service' },
        { name: 'Rising Star', description: 'For new employees showing exceptional promise' },
    ];

    for (const at of awardTypes) {
        const existing = await prisma.awardType.findFirst({ where: { name: at.name } });
        if (!existing) {
            await prisma.awardType.create({ data: at });
            console.log(`   ✓ Award Type: ${at.name}`);
        } else {
            console.log(`   - Award Type exists: ${at.name}`);
        }
    }

    console.log('');
    console.log('✅ Production seed completed successfully!');
    console.log('');
    console.log('📝 Admin Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('');
    console.log('⚠️  Please change the admin password after first login!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
