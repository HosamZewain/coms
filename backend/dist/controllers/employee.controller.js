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
exports.uploadProfileImage = exports.createEmployee = exports.updateEmployee = exports.getEmployee = exports.getEmployees = exports.deleteDependent = exports.addDependent = exports.updateMyProfile = exports.getMyProfile = void 0;
const error_1 = require("../utils/error");
const employeeService = __importStar(require("../services/employee.service"));
exports.getMyProfile = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const data = await employeeService.getProfile(userId);
    res.json({ status: 'success', data });
});
exports.updateMyProfile = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    // TODO: Add validation schema
    const data = await employeeService.upsertProfile(userId, req.body);
    res.json({ status: 'success', data });
});
exports.addDependent = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const data = await employeeService.addDependent(userId, req.body);
    res.json({ status: 'success', data });
});
exports.deleteDependent = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await employeeService.removeDependent(id);
    res.json({ status: 'success', message: 'Dependent removed' });
});
exports.getEmployees = (0, error_1.catchAsync)(async (req, res) => {
    const data = await employeeService.getAllEmployees();
    res.json({ status: 'success', data });
});
exports.getEmployee = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const data = await employeeService.getEmployeeById(id);
    res.json({ status: 'success', data });
});
exports.updateEmployee = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const data = await employeeService.updateEmployeeById(id, req.body);
    res.json({ status: 'success', data });
});
exports.createEmployee = (0, error_1.catchAsync)(async (req, res) => {
    const data = await employeeService.createEmployee(req.body);
    res.status(201).json({ status: 'success', data });
});
const uploadProfileImage = async (req, res) => {
    try {
        console.log('Upload Debug: Controller Entry');
        console.log('Upload Debug: Params:', req.params);
        console.log('Upload Debug: File:', req.file ? 'Present' : 'Missing');
        if (!req.file) {
            throw new Error('No file uploaded');
        }
        const idOrSlug = req.params.id;
        console.log('Upload Debug: Resolving ID/Slug:', idOrSlug);
        // Resolve user first (handle slug vs uuid)
        const user = await employeeService.getEmployeeById(idOrSlug);
        if (!user) {
            console.error('Upload Debug: User not found for:', idOrSlug);
            throw new Error(`Employee not found for Identifier: ${idOrSlug}`);
        }
        console.log('Upload Debug: Resolved User UUID:', user.id);
        // Construct public URL. Assuming 'uploads' is served statically.
        const imageUrl = `/uploads/profiles/${req.file.filename}`;
        console.log('Upload Debug: Upserting Profile Image URL:', imageUrl);
        await employeeService.upsertProfile(user.id, { profileImage: imageUrl });
        res.json({
            status: 'success',
            data: { imageUrl },
            message: 'Profile image uploaded successfully'
        });
    }
    catch (error) {
        console.error('CRITICAL UPLOAD ERROR:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Unknown upload error',
            stack: error.stack
        });
    }
};
exports.uploadProfileImage = uploadProfileImage;
