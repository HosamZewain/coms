
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking permissions...');

    const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@tcoms.com' },
        include: { role: true }
    });

    if (adminUser) {
        console.log(`Admin User Role: ${adminUser.role.name}`);
        console.log(`Admin User Permissions: ${JSON.stringify(adminUser.role.permissions)}`);

        // Ensure Admin has *:*
        if (!adminUser.role.permissions.includes('*:*')) {
            console.log('Adding *:* to Admin role...');
            await prisma.role.update({
                where: { id: adminUser.roleId },
                data: {
                    permissions: {
                        push: '*:*'
                    }
                }
            });
        }
    } else {
        console.log('Admin user not found!');
    }

    const hrRole = await prisma.role.findUnique({ where: { name: 'HR' } });
    if (hrRole) {
        console.log(`HR Role Permissions: ${JSON.stringify(hrRole.permissions)}`);
        const needed = 'recruitment:*';
        if (!hrRole.permissions.includes(needed)) {
            console.log(`Adding ${needed} to HR role...`);
            // We need to fetch current permissions and append, or push if array
            // Prisma push for scalar list:
            const updatedPermissions = [...hrRole.permissions, needed];
            await prisma.role.update({
                where: { id: hrRole.id },
                data: {
                    permissions: updatedPermissions
                }
            });
        }
    } else {
        console.log('HR role not found!');
    }

    console.log('Done.');
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
