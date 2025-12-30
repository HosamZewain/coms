import { Router } from 'express';
import * as payrollController from '../controllers/payroll.controller';
import { authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authorize(['Admin', 'HR', 'Director', 'Manager']));

router.get('/', payrollController.getPayroll);

export default router;
