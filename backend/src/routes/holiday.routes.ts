import { Router } from 'express';
import * as holidayController from '../controllers/holiday.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Allow all authenticated users to view holidays (or maybe just view?)
// For now, let's keep it restricted to Admin/HR for management, 
// but likely employees need to see them.
// Let's say VIEW is open to all (or specific role), but MODIFY is Admin/HR.

router.get('/', holidayController.getAllHolidays);
router.get('/:id', holidayController.getHoliday);

// Protected Management Routes
router.post('/', authorize(['Admin', 'HR']), holidayController.createHoliday);
router.put('/:id', authorize(['Admin', 'HR']), holidayController.updateHoliday);
router.delete('/:id', authorize(['Admin', 'HR']), holidayController.deleteHoliday);

export default router;
