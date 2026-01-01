import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';

import authRoutes from './routes/auth.routes';
import { errorHandler } from './utils/error';

const app = express();
const logger = pino();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());
app.use(express.json());

import path from 'path';

import { actionLogger } from './middlewares/logger.middleware';
import { auditMiddleware } from './middlewares/audit.middleware';
app.use(actionLogger);
app.use(auditMiddleware); // Register global audit logger
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
import companyRoutes from './routes/company.routes';
app.use('/api/company', companyRoutes);
import employeeRoutes from './routes/employee.routes';
app.use('/api/employees', employeeRoutes);
import attendanceRoutes from './routes/attendance.routes';
app.use('/api/attendance', attendanceRoutes);
import hrRoutes from './routes/hr.routes';
app.use('/api/hr', hrRoutes);
import recruitmentRoutes from './routes/recruitment.routes';
app.use('/api/recruitment', recruitmentRoutes);
import projectRoutes from './routes/project.routes';
app.use('/api/projects', projectRoutes);
import taskRoutes from './routes/task.routes';
app.use('/api/tasks', taskRoutes);
import jobRoutes from './routes/job.routes';
app.use('/api/jobs', jobRoutes);
import roleRoutes from './routes/role.routes';
app.use('/api/roles', roleRoutes);
import reportingRoutes from './routes/reporting.routes';
app.use('/api/reporting', reportingRoutes);
import leaveRoutes from './routes/leave.routes';
app.use('/api/leaves', leaveRoutes);
import holidayRoutes from './routes/holiday.routes';
app.use('/api/holidays', holidayRoutes);
import overtimeRoutes from './routes/overtime.routes';
app.use('/api/overtime', overtimeRoutes);
import payrollRoutes from './routes/payroll.routes';
app.use('/api/payroll', payrollRoutes);
import boardRoutes from './routes/board.routes';
app.use('/api/boards', boardRoutes);
import planRoutes from './routes/plan.routes';
app.use('/api/plans', planRoutes);
import epicRoutes from './routes/epic.routes';
app.use('/api/epics', epicRoutes);
import queryRoutes from './routes/query.routes';
app.use('/api/queries', queryRoutes);
import activityRoutes from './routes/activity.routes';
app.use('/api/activities', activityRoutes);
import dashboardRoutes from './routes/dashboard.routes';
app.use('/api/dashboard', dashboardRoutes);

import { initAttendanceJobs } from './jobs/attendance.jobs';
initAttendanceJobs();

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

export { app, logger };
