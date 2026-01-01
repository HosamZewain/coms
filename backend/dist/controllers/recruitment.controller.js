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
exports.getMyInterviews = exports.scheduleInterview = exports.updateApplicantStatus = exports.getApplicant = exports.getApplicants = exports.addApplicant = exports.getPublicJob = exports.getPublicJobs = exports.getJob = exports.getJobs = exports.createJob = void 0;
const error_1 = require("../utils/error");
const recruitmentService = __importStar(require("../services/recruitment.service"));
// Job
exports.createJob = (0, error_1.catchAsync)(async (req, res) => {
    const data = await recruitmentService.createJob(req.body);
    res.status(201).json({ status: 'success', data });
});
exports.getJobs = (0, error_1.catchAsync)(async (req, res) => {
    const data = await recruitmentService.getJobs();
    res.json({ status: 'success', data });
});
exports.getJob = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const data = await recruitmentService.getJob(id);
    if (!data)
        return res.status(404).json({ status: 'fail', message: 'Job not found' });
    res.json({ status: 'success', data });
});
exports.getPublicJobs = (0, error_1.catchAsync)(async (req, res) => {
    const data = await recruitmentService.getPublicJobs();
    res.json({ status: 'success', data });
});
exports.getPublicJob = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const data = await recruitmentService.getPublicJob(id);
    if (!data) {
        return res.status(404).json({ status: 'fail', message: 'Job not found' });
    }
    res.json({ status: 'success', data });
});
// Applicant
exports.addApplicant = (0, error_1.catchAsync)(async (req, res) => {
    const data = await recruitmentService.addApplicant(req.body);
    res.status(201).json({ status: 'success', data });
});
exports.getApplicants = (0, error_1.catchAsync)(async (req, res) => {
    const { jobId } = req.query;
    const data = await recruitmentService.getApplicants(jobId);
    res.json({ status: 'success', data });
});
exports.getApplicant = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const data = await recruitmentService.getApplicant(id);
    if (!data)
        return res.status(404).json({ status: 'fail', message: 'Applicant not found' });
    res.json({ status: 'success', data });
});
exports.updateApplicantStatus = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const data = await recruitmentService.updateApplicantStatus(id, status);
    res.json({ status: 'success', data });
});
// Interview
exports.scheduleInterview = (0, error_1.catchAsync)(async (req, res) => {
    const data = await recruitmentService.scheduleInterview(req.body);
    res.status(201).json({ status: 'success', data });
});
exports.getMyInterviews = (0, error_1.catchAsync)(async (req, res) => {
    const userId = req.user.userId;
    const data = await recruitmentService.getMyInterviews(userId);
    res.json({ status: 'success', data });
});
