import { Router } from 'express';
import * as leaveController from '../controllers/leave.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/types', leaveController.getLeaveTypes);
router.post('/', leaveController.createLeave); // Users create for self, Admins for others
router.get('/my', leaveController.getMyLeaves);

// Admin Routes
router.get('/', authorize(['Admin', 'HR']), leaveController.getAllLeaves);
router.patch('/:id/status', authorize(['Admin', 'HR']), leaveController.updateLeaveStatus);
router.delete('/:id', authorize(['Admin', 'HR']), leaveController.deleteLeave);

export default router;
