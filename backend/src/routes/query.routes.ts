import { Router } from 'express';
import * as queryController from '../controllers/query.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/:id', queryController.getQuery);
router.put('/:id', queryController.updateQuery);
router.delete('/:id', queryController.deleteQuery);

export default router;
