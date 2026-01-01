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
const recruitmentController = __importStar(require("../controllers/recruitment.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/public/jobs', recruitmentController.getPublicJobs);
router.get('/public/jobs/:id', recruitmentController.getPublicJob);
router.post('/public/apply', recruitmentController.addApplicant);
// Protected Routes
router.use(auth_middleware_1.authenticate);
router.post('/jobs', (0, auth_middleware_1.authorizePermission)('recruitment', 'add'), recruitmentController.createJob);
router.get('/jobs', (0, auth_middleware_1.authorizePermission)('recruitment', 'view'), recruitmentController.getJobs);
router.get('/jobs/:id', (0, auth_middleware_1.authorizePermission)('recruitment', 'view'), recruitmentController.getJob);
router.post('/applicants', (0, auth_middleware_1.authorizePermission)('recruitment', 'add'), recruitmentController.addApplicant);
router.get('/applicants', (0, auth_middleware_1.authorizePermission)('recruitment', 'view'), recruitmentController.getApplicants);
router.get('/applicants/:id', (0, auth_middleware_1.authorizePermission)('recruitment', 'view'), recruitmentController.getApplicant);
router.patch('/applicants/:id/status', (0, auth_middleware_1.authorizePermission)('recruitment', 'edit'), recruitmentController.updateApplicantStatus);
router.post('/interviews', (0, auth_middleware_1.authorizePermission)('recruitment', 'add'), recruitmentController.scheduleInterview);
router.get('/interviews/me', recruitmentController.getMyInterviews);
exports.default = router;
