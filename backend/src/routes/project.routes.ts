import { Router } from 'express';
import * as projectController from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';
import planRoutes from './plan.routes';

const router = Router();

router.use(authenticate); // All project routes require login

router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.get('/:id/members', projectController.getProjectMembers);
router.patch('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

router.post('/:id/members', projectController.addMember);
router.delete('/:id/members/:userId', projectController.removeMember);

// Plan routes
router.use('/:projectId/plans', planRoutes);

// Export
export default router;
