import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
import { authenticate } from '../middlewares/auth.middleware';
router.get('/me', authenticate, authController.getMe);

export default router;
