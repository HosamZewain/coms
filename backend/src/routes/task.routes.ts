import { Router } from 'express';
import * as taskController from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Standard CRUD
router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.get('/:id', taskController.getTask);
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Assignments
router.post('/:id/assignments', taskController.addAssignee);
router.delete('/:id/assignments/:userId', taskController.removeAssignee);

// Comments
router.post('/:id/comments', taskController.addComment);
router.delete('/:id/comments/:commentId', taskController.deleteComment);

// Attachments
import { taskUpload } from '../middlewares/upload.middleware';
router.post('/:id/attachments', taskUpload.single('file'), taskController.addAttachment);
router.delete('/:id/attachments/:attachmentId', taskController.removeAttachment);

// Move Task
import * as planController from '../controllers/plan.controller';
router.patch('/:taskId/move', planController.moveTask);

export default router;
