import express from 'express';
import * as planController from '../controllers/plan.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import milestoneRoutes from './milestone.routes';

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router
    .route('/')
    .post(authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), planController.createPlan)
    .get(authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), planController.getProjectPlans);

router
    .route('/:id')
    .patch(authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), planController.updatePlan);

router
    .route('/:id/archive')
    .post(authorize(['ADMIN', 'MANAGER', 'EMPLOYEE']), planController.archivePlan);

// Nested routes
router.use('/:planId/milestones', milestoneRoutes);

export default router;
