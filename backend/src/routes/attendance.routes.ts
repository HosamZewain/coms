import { Router } from 'express';
import * as attendanceController from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/punch-in', attendanceController.punchIn);
router.post('/punch-out', attendanceController.punchOut);
router.get('/me', attendanceController.getMyAttendance);
router.get('/stats', attendanceController.getAttendanceStats);
router.get('/report', attendanceController.getTodayReport);
router.get('/employee-monthly-report', authorize(['Admin', 'HR', 'Director', 'Manager']), attendanceController.getEmployeeMonthlyReport);
router.post('/manual', authorize(['Admin', 'HR']), attendanceController.addManualAttendance);

export default router;
