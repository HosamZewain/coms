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
exports.moveTask = exports.getProjectPlans = exports.archivePlan = exports.updatePlan = exports.createPlan = void 0;
const catchAsync_1 = require("../utils/catchAsync");
const planService = __importStar(require("../services/plan.service"));
exports.createPlan = (0, catchAsync_1.catchAsync)(async (req, res) => {
    // Force projectId from params if not in body
    const projectId = req.params.projectId || req.body.projectId;
    const data = await planService.createPlan({ ...req.body, projectId }, req.user.id);
    res.status(201).json({ status: 'success', data });
});
exports.updatePlan = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await planService.updatePlan(req.params.id, req.body);
    res.json({ status: 'success', data });
});
exports.archivePlan = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await planService.archivePlan(req.params.id);
    res.json({ status: 'success', data });
});
exports.getProjectPlans = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (req.params.projectId) {
        const data = await planService.getPlansByProject(req.params.projectId);
        res.json({ status: 'success', data });
    }
    else {
        const data = await planService.getAllPlans();
        res.json({ status: 'success', data });
    }
});
exports.moveTask = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const data = await planService.moveTaskToPlan(req.params.taskId, req.body.planId);
    res.json({ status: 'success', data });
});
