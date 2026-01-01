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
exports.incrementView = exports.getDocuments = exports.uploadDocument = exports.updateOvertimeStatus = exports.getAllOvertime = exports.getMyOvertime = exports.requestOvertime = exports.getAwards = exports.giveAward = exports.getAwardTypes = exports.createAwardType = exports.deleteWorkRegulation = exports.updateWorkRegulation = exports.getWorkRegulations = exports.createWorkRegulation = void 0;
const error_1 = require("../utils/error");
const hrService = __importStar(require("../services/hr.service"));
// Regulations
exports.createWorkRegulation = (0, error_1.catchAsync)(async (req, res) => {
    // Basic validation could be added here or via middleware
    const data = await hrService.createWorkRegulation(req.body);
    res.status(201).json({ status: 'success', data });
});
exports.getWorkRegulations = (0, error_1.catchAsync)(async (req, res) => {
    const data = await hrService.getWorkRegulations();
    res.json({ status: 'success', data });
});
exports.updateWorkRegulation = (0, error_1.catchAsync)(async (req, res) => {
    const data = await hrService.updateWorkRegulation(req.params.id, req.body);
    res.json({ status: 'success', data });
});
exports.deleteWorkRegulation = (0, error_1.catchAsync)(async (req, res) => {
    await hrService.deleteWorkRegulation(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
// Award Setup
exports.createAwardType = (0, error_1.catchAsync)(async (req, res) => {
    const data = await hrService.createAwardType(req.body);
    res.status(201).json({ status: 'success', data });
});
exports.getAwardTypes = (0, error_1.catchAsync)(async (req, res) => {
    const data = await hrService.getAwardTypes();
    res.json({ status: 'success', data });
});
// Give Award
exports.giveAward = (0, error_1.catchAsync)(async (req, res) => {
    const data = await hrService.giveAward(req.body);
    res.status(201).json({ status: 'success', data });
});
exports.getAwards = (0, error_1.catchAsync)(async (req, res) => {
    const data = await hrService.getAwards();
    res.json({ status: 'success', data });
});
// Overtime
exports.requestOvertime = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const data = await hrService.requestOvertime(userId, req.body);
    res.status(201).json({ status: 'success', data });
});
exports.getMyOvertime = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const data = await hrService.getOvertimeRequests(userId);
    res.json({ status: 'success', data });
});
exports.getAllOvertime = (0, error_1.catchAsync)(async (req, res) => {
    const data = await hrService.getOvertimeRequests();
    res.json({ status: 'success', data });
});
exports.updateOvertimeStatus = (0, error_1.catchAsync)(async (req, res) => {
    const { status } = req.body;
    const approverId = req.user.userId;
    const data = await hrService.updateOvertimeStatus(req.params.id, status, approverId);
    res.json({ status: 'success', data });
});
// Documents
exports.uploadDocument = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    let url = req.body.url;
    if (req.file) {
        // Construct full URL for the uploaded file
        // Assuming the backend serves 'uploads' statically or via a specific route
        // We'll store the relative path or full URL depending on how profiles are handled
        // For consistency with profile images, let's store a path that the frontend can resolve
        url = `/uploads/documents/${req.file.filename}`;
    }
    if (!url) {
        return res.status(400).json({ status: 'error', message: 'No document file or URL provided' });
    }
    const data = await hrService.uploadDocument({ ...req.body, url }, userId);
    res.status(201).json({ status: 'success', data });
});
exports.getDocuments = (0, error_1.catchAsync)(async (req, res) => {
    const data = await hrService.getDocuments();
    res.json({ status: 'success', data });
});
exports.incrementView = (0, error_1.catchAsync)(async (req, res) => {
    await hrService.incrementDocumentView(req.params.id);
    res.json({ status: 'success' });
});
