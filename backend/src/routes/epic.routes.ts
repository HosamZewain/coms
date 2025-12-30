import { Router } from 'express';
import * as epicController from '../controllers/epic.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/:id', epicController.getEpic);
router.put('/:id', epicController.updateEpic);
router.delete('/:id', epicController.deleteEpic);

export default router;
