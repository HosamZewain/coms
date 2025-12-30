import { Router } from 'express';
import * as roleController from '../controllers/role.controller';
import { authenticate, authorizePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorizePermission('settings', 'view'), roleController.getRoles);
router.post('/', authorizePermission('settings', 'edit'), roleController.createRole);
router.put('/:id', authorizePermission('settings', 'edit'), roleController.updateRole);
router.delete('/:id', authorizePermission('settings', 'delete'), roleController.deleteRole);

export default router;
