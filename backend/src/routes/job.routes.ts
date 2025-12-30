import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { authorize, authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/public', jobController.getPublicJobs);
router.get('/public/:id', jobController.getPublicJobById);
router.post('/public/:id/apply', jobController.applyToJob);

// Protected Management Routes
router.use(authenticate);
router.use(authorize(['Admin', 'HR', 'Manager']));

router.get('/', jobController.getAllJobs);
router.post('/', jobController.createJob);
router.get('/:id', jobController.getJobById);
router.get('/:id/applicants', jobController.getJobApplicants);
router.patch('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

export default router;
