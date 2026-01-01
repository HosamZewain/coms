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
exports.getEmployeeMonthlyReport = exports.addManualAttendance = exports.getAttendanceStats = exports.getMyAttendance = exports.getTodayReport = exports.punchOut = exports.punchIn = void 0;
const error_1 = require("../utils/error");
const attendanceService = __importStar(require("../services/attendance.service"));
const zod_1 = require("zod");
const punchSchema = zod_1.z.object({
    location: zod_1.z.enum(['OFFICE', 'HOME']),
    projectId: zod_1.z.string(),
    task: zod_1.z.string(),
    notes: zod_1.z.string().optional()
});
exports.punchIn = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const body = punchSchema.parse(req.body);
    const data = await attendanceService.punchIn(userId, { ...body, ipAddress });
    res.status(201).json({ status: 'success', data });
});
exports.punchOut = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const body = punchSchema.parse(req.body);
    const data = await attendanceService.punchOut(userId, { ...body, ipAddress });
    res.json({ status: 'success', data });
});
exports.getTodayReport = (0, error_1.catchAsync)(async (req, res) => {
    const dateStr = req.query.date;
    const date = dateStr ? new Date(dateStr) : new Date();
    const data = await attendanceService.getDailyReport(date);
    res.json({ status: 'success', data });
});
exports.getMyAttendance = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const data = await attendanceService.getMyAttendance(userId);
    res.json({ status: 'success', data });
});
exports.getAttendanceStats = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const data = await attendanceService.getAttendanceStats(userId);
    res.json({ status: 'success', data });
});
exports.addManualAttendance = (0, error_1.catchAsync)(async (req, res) => {
    const { userId } = req.body; // Target user
    if (!userId)
        throw new Error('User ID is required');
    const data = await attendanceService.addManualAttendance(userId, req.body);
    res.status(201).json({ status: 'success', data });
});
exports.getEmployeeMonthlyReport = (0, error_1.catchAsync)(async (req, res) => {
    const employeeId = req.query.employeeId;
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    if (!employeeId) {
        return res.status(400).json({ status: 'error', message: 'Employee ID is required' });
    }
    const data = await attendanceService.getEmployeeMonthlyReport(employeeId, startDate, endDate);
    res.json({ status: 'success', data });
});
