import { Router } from 'express';
import * as activityController from '../controllers/activity.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/recent', activityController.getRecentActivities);
router.get('/user/:userId', activityController.getUserActivities);
router.get('/task/:taskId', activityController.getTaskActivities);

export default router;
