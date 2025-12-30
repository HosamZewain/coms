import { Router } from 'express';
import * as recruitmentController from '../controllers/recruitment.controller';
import { authenticate, authorizePermission } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/public/jobs', recruitmentController.getPublicJobs);
router.get('/public/jobs/:id', recruitmentController.getPublicJob);
router.post('/public/apply', recruitmentController.addApplicant);

// Protected Routes
router.use(authenticate);

router.post('/jobs', authorizePermission('recruitment', 'add'), recruitmentController.createJob);
router.get('/jobs', authorizePermission('recruitment', 'view'), recruitmentController.getJobs);
router.get('/jobs/:id', authorizePermission('recruitment', 'view'), recruitmentController.getJob);

router.post('/applicants', authorizePermission('recruitment', 'add'), recruitmentController.addApplicant);
router.get('/applicants', authorizePermission('recruitment', 'view'), recruitmentController.getApplicants);
router.get('/applicants/:id', authorizePermission('recruitment', 'view'), recruitmentController.getApplicant);
router.patch('/applicants/:id/status', authorizePermission('recruitment', 'edit'), recruitmentController.updateApplicantStatus);


router.post('/interviews', authorizePermission('recruitment', 'add'), recruitmentController.scheduleInterview);
router.get('/interviews/me', recruitmentController.getMyInterviews);

export default router;
