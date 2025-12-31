import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { authenticate, authorizePermission } from '../middlewares/auth.middleware';
import { profileUpload } from '../middlewares/profile-upload.middleware';

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
// Debug wrapper for Multer
const debugUpload = (req: any, res: any, next: any) => {
    console.log('--- UPLOAD DEBUG START ---');
    console.log('Request URL:', req.originalUrl);
    console.log('Content-Type:', req.headers['content-type']);

    profileUpload.single('image')(req, res, (err: any) => {
        if (err) {
            console.error('Multer Middleware Error:', err);
            return res.status(400).json({ status: 'error', message: `Upload Error: ${err.message}` });
        }
        console.log('Multer Completed. File:', req.file ? 'FOUND' : 'MISSING');
        if (req.file) console.log('File Details:', req.file.originalname, req.file.mimetype, req.file.size);
        next();
    });
};

router.post('/:id/upload-image', authorizePermission('employees', 'edit'), debugUpload, employeeController.uploadProfileImage);
router.post('/', authorizePermission('employees', 'add'), employeeController.createEmployee);

export default router;
