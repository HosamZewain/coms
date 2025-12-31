import { Router } from 'express';
import { authenticate, authorizePermission } from '../middlewares/auth.middleware';
import * as reportingController from '../controllers/reporting.controller';

const router = Router();

router.use(authenticate);

router.get('/dashboard-stats', authorizePermission('reports', 'view'), reportingController.getDashboardStats);
router.get('/system-logs', authorizePermission('reports', 'view'), reportingController.getSystemLogs);
router.get('/audit-logs', authorizePermission('reports', 'view'), reportingController.getAuditLogs);

export default router;
