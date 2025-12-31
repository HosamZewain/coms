import { prisma } from './src/utils/prisma';

async function main() {
    const leaves = await prisma.leaveRequest.count();
    const overtime = await prisma.overtimeRequest.count();
    console.log(`Leaves: ${leaves}`);
    console.log(`Overtime: ${overtime}`);

    if (leaves > 0) {
        const firstLeave = await prisma.leaveRequest.findFirst();
        console.log('First Leave Date:', firstLeave?.startDate);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
