import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugAttendance() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayStart = new Date(todayStr); // 00:00:00 UTC
    const todayEnd = new Date(todayStr);
    todayEnd.setHours(23, 59, 59, 999);

    console.log(`Current Time (Server): ${now.toISOString()}`);
    console.log(`Today Start (UTC): ${todayStart.toISOString()}`);
    console.log(`Today End (UTC): ${todayEnd.toISOString()}`);

    const records = await prisma.attendanceRecord.findMany({
        include: { user: true }
    });

    console.log('\n--- All Attendance Records ---');
    records.forEach(r => {
        console.log(`User: ${r.user.firstName}, ID: ${r.id}`);
        console.log(`  Date Field: ${r.date.toISOString()}`);
        console.log(`  Check-In:   ${r.checkInTime.toISOString()}`);
        console.log(`  Check-Out:  ${r.checkOutTime?.toISOString() || 'NULL'}`);

        const inDashboardRange = r.date >= todayStart && r.date <= todayEnd;
        console.log(`  In Dashboard Range: ${inDashboardRange}`);
    });

    console.log('\n--- getDailyReport Logic Simulation ---');
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Report start (Local): ${startOfDay.toISOString()}`);
    console.log(`Report end (Local):   ${endOfDay.toISOString()}`);

    const reportRecords = records.filter(r => {
        const inRange = r.checkInTime <= endOfDay && (r.checkOutTime === null || r.checkOutTime >= startOfDay);
        return inRange;
    });

    console.log(`Found ${reportRecords.length} records in report range.`);
}

debugAttendance().then(() => prisma.$disconnect());
