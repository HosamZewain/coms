import { Router } from 'express';
import * as overtimeController from '../controllers/overtime.controller';
import { authenticate, authorize, authorizePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Employee routes
router.post('/', overtimeController.createRequest);
router.get('/my', overtimeController.getMyRequests);

// Admin/HR routes
// Assuming 'overtime:approve' or specific roles
router.get('/', authorize(['Admin', 'HR', 'Manager', 'Director']), overtimeController.getAllRequests);
router.patch('/:id/status', authorize(['Admin', 'HR', 'Manager', 'Director']), overtimeController.updateStatus);

export default router;
