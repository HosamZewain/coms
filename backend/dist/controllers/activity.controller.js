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
exports.getTaskActivities = exports.getUserActivities = exports.getRecentActivities = void 0;
const error_1 = require("../utils/error");
const activityService = __importStar(require("../services/activity.service"));
exports.getRecentActivities = (0, error_1.catchAsync)(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const data = await activityService.getRecentActivities(limit);
    res.json({ status: 'success', data });
});
exports.getUserActivities = (0, error_1.catchAsync)(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const data = await activityService.getUserActivities(req.params.userId, limit);
    res.json({ status: 'success', data });
});
exports.getTaskActivities = (0, error_1.catchAsync)(async (req, res) => {
    const data = await activityService.getTaskActivities(req.params.taskId);
    res.json({ status: 'success', data });
});
