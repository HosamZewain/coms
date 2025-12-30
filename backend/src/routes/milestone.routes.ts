import express from 'express';
import * as milestoneController from '../controllers/milestone.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// These routes will be mounted on /api/plans/:planId/milestones
router
    .route('/')
    .post(authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), milestoneController.createMilestone)
    .get(authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), milestoneController.getPlanMilestones);

router
    .route('/:id')
    .patch(authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), milestoneController.updateMilestone)
    .delete(authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), milestoneController.deleteMilestone);

export default router;
