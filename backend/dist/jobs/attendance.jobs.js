"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAttendanceJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = require("../utils/prisma");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)();
const initAttendanceJobs = () => {
    // Run at 00:00:01 every day
    // This closes any records from the PREVIOUS day that were never punched out
    node_cron_1.default.schedule('1 0 0 * * *', async () => {
        logger.info('Running Midnight Auto Punch-out Job...');
        try {
            const now = new Date();
            // We want to set the punch-out time to 23:59:59 of the previous day
            const punchOutTime = new Date(now);
            punchOutTime.setDate(now.getDate() - 1);
            punchOutTime.setHours(23, 59, 59, 999);
            const activeRecords = await prisma_1.prisma.attendanceRecord.findMany({
                where: {
                    checkOutTime: null
                }
            });
            if (activeRecords.length > 0) {
                logger.info(`Found ${activeRecords.length} active records to auto punch-out.`);
                const result = await prisma_1.prisma.attendanceRecord.updateMany({
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
            }
            else {
                logger.info('No active records found for auto punch-out.');
            }
        }
        catch (error) {
            logger.error({ err: error }, 'Error in Attendance Auto Punch-out Job');
        }
    });
    logger.info('Attendance Jobs Initialized');
};
exports.initAttendanceJobs = initAttendanceJobs;
