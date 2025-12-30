
import { PrismaClient } from '@prisma/client';
import * as employeeService from './src/services/employee.service';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching all employees...');
    const all = await employeeService.getAllEmployees();

    // Find the System Admin
    const admin = all.find(u => u.email === 'admin@roms.com') || all[0];

    if (admin) {
        console.log(`Checking user: ${admin.firstName} ${admin.lastName} (${admin.id})`);

        const fullUser = await employeeService.getEmployeeById(admin.id);
        if (fullUser) {
            console.log('Role:', fullUser.role?.name);
            console.log('Permissions:', fullUser.role?.permissions);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
