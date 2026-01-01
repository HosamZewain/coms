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
const companyController = __importStar(require("../controllers/company.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // All company routes require login
// Eventually restrict to Admin
// router.use(authorize(['Admin']));
router.get('/departments', companyController.getDepartments);
router.post('/departments', companyController.createDepartment);
router.put('/departments/:id', companyController.updateDepartment);
router.delete('/departments/:id', companyController.deleteDepartment);
router.get('/teams', companyController.getTeams);
router.post('/teams', companyController.createTeam);
router.put('/teams/:id', companyController.updateTeam);
router.delete('/teams/:id', companyController.deleteTeam);
router.get('/positions', companyController.getPositions);
router.post('/positions', companyController.createPosition);
router.put('/positions/:id', companyController.updatePosition);
router.delete('/positions/:id', companyController.deletePosition);
router.get('/profile', companyController.getProfile);
router.put('/profile', companyController.updateProfile);
router.get('/settings', companyController.getSettings);
router.put('/settings', companyController.updateSettings);
exports.default = router;
