import express from 'express';
import * as hrController from '../controllers/hr.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(authenticate); // All routes protected

// Work Regulations
router.route('/regulations')
    .get(hrController.getWorkRegulations)
    .post(authorize(['Admin', 'HR']), hrController.createWorkRegulation);

router.delete('/regulations/:id', authorize(['Admin', 'HR']), hrController.deleteWorkRegulation);
router.put('/regulations/:id', authorize(['Admin', 'HR']), hrController.updateWorkRegulation);

// Award Types (Setup)
router.route('/award-types')
    .get(hrController.getAwardTypes)
    .post(authorize(['Admin', 'HR']), hrController.createAwardType);

// Awards (Transactions)
router.route('/awards')
    .get(hrController.getAwards)
    .post(authorize(['Admin', 'HR', 'Manager']), hrController.giveAward);

// Overtime
router.post('/overtime', hrController.requestOvertime);
router.get('/overtime/me', hrController.getMyOvertime);
router.get('/overtime/all', authorize(['Admin', 'HR', 'Manager']), hrController.getAllOvertime);
router.patch('/overtime/:id', authorize(['Admin', 'HR', 'Manager']), hrController.updateOvertimeStatus);

// Documents
router.route('/documents')
    .get(hrController.getDocuments)
    .post(authorize(['Admin', 'HR']), hrController.uploadDocument); // Assuming only HR uploads globally

export default router;
