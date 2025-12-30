import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { authenticate, authorizePermission } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Publicly accessible within authenticated users (for staff directory etc)
router.get('/', authorizePermission('employees', 'view'), employeeController.getEmployees);
router.get('/me', employeeController.getMyProfile);
router.put('/me', employeeController.updateMyProfile);
router.post('/me/dependents', employeeController.addDependent);
router.delete('/me/dependents/:id', employeeController.deleteDependent);

// Administrative routes
router.get('/:id', authorizePermission('employees', 'view'), employeeController.getEmployee);
router.put('/:id', authorizePermission('employees', 'edit'), employeeController.updateEmployee);
router.post('/', authorizePermission('employees', 'add'), employeeController.createEmployee);

export default router;
