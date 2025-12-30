import { Router } from 'express';
import * as boardController from '../controllers/board.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', boardController.getBoards);
router.post('/', boardController.createBoard);
router.get('/:id', boardController.getBoard);
router.patch('/:id', boardController.updateBoard); // params.id
router.delete('/:id', boardController.deleteBoard);

// Nested Resources - Plans
// import * as planController from '../controllers/plan.controller'; // Ensure this file exists and exports
// router.get('/:boardId/plans', planController.getPlans);
// router.post('/:boardId/plans', planController.createPlan);

// Nested Resources - Epics
import * as epicController from '../controllers/epic.controller';
router.get('/:boardId/epics', epicController.getEpics);
router.post('/:boardId/epics', epicController.createEpic);

// Nested Resources - Tasks
import * as taskController from '../controllers/task.controller';
router.get('/:boardId/tasks', taskController.getTasks);
router.post('/:boardId/tasks', taskController.createTask);

// Nested Resources - Queries
import * as queryController from '../controllers/query.controller';
router.get('/:boardId/queries', queryController.getQueries);
router.post('/:boardId/queries', queryController.createQuery);

// Access management
router.post('/:id/access', boardController.addMember);
router.delete('/:id/access/:accessId', boardController.removeMember);

export default router;
