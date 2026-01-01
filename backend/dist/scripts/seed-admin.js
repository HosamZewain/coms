"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
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
    }
    else {
        // Ensure perm is correct
        await prisma.role.update({
            where: { id: adminRole.id },
            data: { permissions: ['*:*'] }
        });
    }
    // 2. Create/Update Admin User
    const email = 'real.admin@example.com';
    const password = await bcryptjs_1.default.hash('Admin123!', 10);
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
    }
    else {
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
    const token = jsonwebtoken_1.default.sign({
        userId: adminUser.id,
        role: 'Admin',
        permissions: ['*:*']
    }, JWT_SECRET, { expiresIn: '30d' });
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
