"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeController = __importStar(require("../controllers/employee.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const profile_upload_middleware_1 = require("../middlewares/profile-upload.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Publicly accessible within authenticated users (for staff directory etc)
router.get('/', (0, auth_middleware_1.authorizePermission)('employees', 'view'), employeeController.getEmployees);
router.get('/me', employeeController.getMyProfile);
router.put('/me', employeeController.updateMyProfile);
router.post('/me/dependents', employeeController.addDependent);
router.delete('/me/dependents/:id', employeeController.deleteDependent);
// Administrative routes
router.get('/:id', (0, auth_middleware_1.authorizePermission)('employees', 'view'), employeeController.getEmployee);
router.put('/:id', (0, auth_middleware_1.authorizePermission)('employees', 'edit'), employeeController.updateEmployee);
// Debug wrapper for Multer
const debugUpload = (req, res, next) => {
    console.log('--- UPLOAD DEBUG START ---');
    console.log('Request URL:', req.originalUrl);
    console.log('Content-Type:', req.headers['content-type']);
    profile_upload_middleware_1.profileUpload.single('image')(req, res, (err) => {
        if (err) {
            console.error('Multer Middleware Error:', err);
            return res.status(400).json({ status: 'error', message: `Upload Error: ${err.message}` });
        }
        console.log('Multer Completed. File:', req.file ? 'FOUND' : 'MISSING');
        if (req.file)
            console.log('File Details:', req.file.originalname, req.file.mimetype, req.file.size);
        next();
    });
};
router.post('/:id/upload-image', (0, auth_middleware_1.authorizePermission)('employees', 'edit'), debugUpload, employeeController.uploadProfileImage);
router.post('/', (0, auth_middleware_1.authorizePermission)('employees', 'add'), employeeController.createEmployee);
exports.default = router;
