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
exports.updateSettings = exports.getSettings = exports.updateProfile = exports.getProfile = exports.deletePosition = exports.updatePosition = exports.createPosition = exports.getPositions = exports.deleteTeam = exports.updateTeam = exports.createTeam = exports.getTeams = exports.deleteDepartment = exports.updateDepartment = exports.createDepartment = exports.getDepartments = void 0;
const error_1 = require("../utils/error");
const companyService = __importStar(require("../services/company.service"));
const zod_1 = require("zod");
const nameSchema = zod_1.z.object({ name: zod_1.z.string().min(2) });
const createPositionSchema = zod_1.z.object({ title: zod_1.z.string().min(2), departmentId: zod_1.z.string().uuid() });
const updatePositionSchema = zod_1.z.object({ title: zod_1.z.string().min(2) });
// Departments
exports.getDepartments = (0, error_1.catchAsync)(async (req, res) => {
    const data = await companyService.getDepartments();
    res.json({ status: 'success', data });
});
exports.createDepartment = (0, error_1.catchAsync)(async (req, res, next) => {
    try {
        const { name } = nameSchema.parse(req.body);
        const managerId = req.body.managerId;
        const data = await companyService.createDepartment(name, managerId);
        res.status(201).json({ status: 'success', data });
    }
    catch (error) {
        console.error('CREATE DEPT ERROR:', error);
        next(error);
    }
});
exports.updateDepartment = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { name } = nameSchema.parse(req.body);
    const managerId = req.body.managerId;
    const data = await companyService.updateDepartment(id, name, managerId);
    res.json({ status: 'success', data });
});
exports.deleteDepartment = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await companyService.deleteDepartment(id);
    res.json({ status: 'success', message: 'Department deleted' });
});
// Teams
exports.getTeams = (0, error_1.catchAsync)(async (req, res) => {
    const { departmentId } = req.query;
    const data = await companyService.getTeams(departmentId);
    res.json({ status: 'success', data });
});
exports.createTeam = (0, error_1.catchAsync)(async (req, res) => {
    const data = await companyService.createTeam(req.body);
    res.status(201).json({ status: 'success', data });
});
exports.updateTeam = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const data = await companyService.updateTeam(id, req.body);
    res.json({ status: 'success', data });
});
exports.deleteTeam = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await companyService.deleteTeam(id);
    res.json({ status: 'success', message: 'Team deleted' });
});
// Positions
exports.getPositions = (0, error_1.catchAsync)(async (req, res) => {
    const data = await companyService.getPositions();
    res.json({ status: 'success', data });
});
exports.createPosition = (0, error_1.catchAsync)(async (req, res) => {
    const { title, departmentId } = createPositionSchema.parse(req.body);
    const data = await companyService.createPosition(title, departmentId);
    res.status(201).json({ status: 'success', data });
});
exports.updatePosition = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { title } = updatePositionSchema.parse(req.body);
    const data = await companyService.updatePosition(id, title);
    res.json({ status: 'success', data });
});
exports.deletePosition = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    await companyService.deletePosition(id);
    res.json({ status: 'success', message: 'Position deleted' });
});
exports.getProfile = (0, error_1.catchAsync)(async (req, res) => {
    const data = await companyService.getCompanyProfile();
    res.json({ status: 'success', data });
});
exports.updateProfile = (0, error_1.catchAsync)(async (req, res) => {
    const data = await companyService.updateCompanyProfile(req.body);
    res.json({ status: 'success', data });
});
exports.getSettings = (0, error_1.catchAsync)(async (req, res) => {
    const keys = req.query.keys?.split(',') || [];
    const data = await companyService.getSettings(keys);
    res.json({ status: 'success', data });
});
exports.updateSettings = (0, error_1.catchAsync)(async (req, res) => {
    const data = await companyService.updateSettings(req.body);
    res.json({ status: 'success', data });
});
