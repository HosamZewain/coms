
import { PrismaClient } from '@prisma/client';
import * as hrService from './src/services/hr.service';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching regulations...');
    const regs = await hrService.getWorkRegulations();
    console.log(`Found ${regs.length} regulations.`);
    console.log(regs);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
