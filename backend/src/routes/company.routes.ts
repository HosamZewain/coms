import { Router } from 'express';
import * as companyController from '../controllers/company.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate); // All company routes require login
// Eventually restrict to Admin
// router.use(authorize(['Admin']));

router.get('/departments', companyController.getDepartments);
router.post('/departments', companyController.createDepartment);
router.put('/departments/:id', companyController.updateDepartment);
router.delete('/departments/:id', companyController.deleteDepartment);

router.get('/positions', companyController.getPositions);
router.post('/positions', companyController.createPosition);
router.put('/positions/:id', companyController.updatePosition);
router.delete('/positions/:id', companyController.deletePosition);

router.get('/profile', companyController.getProfile);
router.put('/profile', companyController.updateProfile);

router.get('/settings', companyController.getSettings);
router.put('/settings', companyController.updateSettings);

export default router;
