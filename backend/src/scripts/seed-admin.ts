
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

async function main() {
    console.log('Seeding Admin User...');

    // 1. Ensure Admin Role exists
    let adminRole = await prisma.role.findFirst({ where: { name: 'Admin' } });
    if (!adminRole) {
        console.log('Creating Admin role...');
        adminRole = await prisma.role.create({
            data: {
                name: 'Admin',
                permissions: ['*:*'] // Wildcard for all
            }
        });
    } else {
        // Ensure perm is correct
        await prisma.role.update({
            where: { id: adminRole.id },
            data: { permissions: ['*:*'] }
        });
    }

    // 2. Create/Update Admin User
    const email = 'real.admin@example.com';
    const password = await bcrypt.hash('Admin123!', 10);

    let adminUser = await prisma.user.findUnique({ where: { email } });
    if (!adminUser) {
        console.log('Creating Admin user...');
        adminUser = await prisma.user.create({
            data: {
                email,
                password,
                firstName: 'Real',
                lastName: 'Admin',
                roleId: adminRole.id
            }
        });
    } else {
        console.log('Updating existing Admin user...');
        adminUser = await prisma.user.update({
            where: { id: adminUser.id },
            data: {
                password,
                roleId: adminRole.id
            }
        });
    }

    // 3. Generate Token
    const token = jwt.sign(
        {
            userId: adminUser.id,
            role: 'Admin',
            permissions: ['*:*']
        },
        JWT_SECRET,
        { expiresIn: '30d' }
    );

    console.log('--- ADMIN DATA ---');
    console.log(`User ID: ${adminUser.id}`);
    console.log(`Email: ${email}`);
    console.log(`Token: ${token}`);
    console.log('------------------');

    // Output JSON for easy parsing if needed
    console.log(JSON.stringify({
        user: {
            id: adminUser.id,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: {
                id: adminRole.id,
                name: adminRole.name,
                permissions: adminRole.permissions
            }
        },
        token: token
    }));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
