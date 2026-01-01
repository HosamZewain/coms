"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        await prisma.$connect();
        console.log('Successfully connected to database');
        // Check if tables exist by querying internal schema information or just counting
        // Since we expect empty, let's just create a dummy role to see if it works
        const role = await prisma.role.create({
            data: {
                name: 'SuperAdmin_' + Date.now(),
                permissions: ['ALL']
            }
        });
        console.log('Created verification role:', role);
        const count = await prisma.role.count();
        console.log('Role count:', count);
    }
    catch (e) {
        console.error('Error verifying DB:', e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
