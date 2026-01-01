import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import pino from 'pino';

const logger = pino();

export const initAttendanceJobs = () => {
    // Run at 00:00:01 every day
    // This closes any records from the PREVIOUS day that were never punched out
    cron.schedule('1 0 0 * * *', async () => {
        logger.info('Running Midnight Auto Punch-out Job...');

        try {
            const now = new Date();
            // We want to set the punch-out time to 23:59:59 of the previous day
            const punchOutTime = new Date(now);
            punchOutTime.setDate(now.getDate() - 1);
            punchOutTime.setHours(23, 59, 59, 999);

            const activeRecords = await prisma.attendanceRecord.findMany({
                where: {
                    checkOutTime: null
                }
            });

            if (activeRecords.length > 0) {
                logger.info(`Found ${activeRecords.length} active records to auto punch-out.`);

                const result = await prisma.attendanceRecord.updateMany({
                    where: {
                        checkOutTime: null,
                        checkInTime: {
                            lt: now // Only punch out records started BEFORE today
                        }
                    },
                    data: {
                        checkOutTime: punchOutTime,
                        checkOutLocation: 'SYSTEM_AUTO',
                        checkOutNotes: 'System Auto Punch-out (Midnight Reset)',
                        status: 'PRESENT' // Or maybe 'AUTO_CLOSED' if you want a new status
                    }
                });

                logger.info(`Successfully auto punched-out ${result.count} records.`);
            } else {
                logger.info('No active records found for auto punch-out.');
            }
        } catch (error) {
            logger.error('Error in Attendance Auto Punch-out Job:', error);
        }
    });

    logger.info('Attendance Jobs Initialized');
};
