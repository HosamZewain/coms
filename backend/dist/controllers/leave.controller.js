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
exports.updateBalance = exports.getBalances = exports.deleteLeave = exports.updateLeaveStatus = exports.getAllLeaves = exports.getMyLeaves = exports.createLeave = exports.getLeaveTypes = void 0;
const error_1 = require("../utils/error");
const leaveService = __importStar(require("../services/leave.service"));
exports.getLeaveTypes = (0, error_1.catchAsync)(async (req, res) => {
    const data = await leaveService.getLeaveTypes();
    res.json({ status: 'success', data });
});
exports.createLeave = (0, error_1.catchAsync)(async (req, res) => {
    // Admin can specify userId in body to create for others, else defaults to current user
    const userId = req.body.userId || req.user.userId;
    // If Admin creating for others, auto-approve? Let's assume passed status 'APPROVED' handles it
    const data = await leaveService.createLeaveRequest(userId, req.body);
    res.status(201).json({ status: 'success', data });
});
exports.getMyLeaves = (0, error_1.catchAsync)(async (req, res) => {
    const data = await leaveService.getMyLeaves(req.user.userId);
    res.json({ status: 'success', data });
});
exports.getAllLeaves = (0, error_1.catchAsync)(async (req, res) => {
    const data = await leaveService.getAllLeaves(req.user.userId);
    res.json({ status: 'success', data });
});
exports.updateLeaveStatus = (0, error_1.catchAsync)(async (req, res) => {
    const { status } = req.body;
    const data = await leaveService.updateLeaveStatus(req.params.id, status, req.user.userId);
    res.json({ status: 'success', data });
});
exports.deleteLeave = (0, error_1.catchAsync)(async (req, res) => {
    await leaveService.deleteLeaveRequest(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
exports.getBalances = (0, error_1.catchAsync)(async (req, res) => {
    const { userId } = req.params;
    const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
    const data = await leaveService.getUserBalances(userId, year);
    res.json({ status: 'success', data });
});
exports.updateBalance = (0, error_1.catchAsync)(async (req, res) => {
    const { userId } = req.params;
    const { leaveTypeId, balance, year } = req.body;
    const data = await leaveService.updateUserBalance(userId, leaveTypeId, balance, year || new Date().getFullYear());
    res.json({ status: 'success', data });
});
