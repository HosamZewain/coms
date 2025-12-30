
import { prisma } from './src/utils/prisma';
import { getDailyReport } from './src/services/attendance.service';

async function main() {
    console.log('--- TESTING DAILY REPORT ---');
    try {
        const report = await getDailyReport(new Date());
        console.log(JSON.stringify(report, null, 2));
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
