import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { employeeProfile: true }
    });
    console.log('--- ALL USERS ---');
    users.forEach(u => {
        console.log(`User: ${u.firstName} ${u.lastName} (ID: ${u.id})`);
        console.log(`Email: ${u.email}`);
        console.log(`Image: ${u.employeeProfile?.profileImage}`);
        console.log('---');
    });
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
