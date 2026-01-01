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
exports.getAuditLogs = exports.getSystemLogs = exports.getDashboardStats = void 0;
const error_1 = require("../utils/error");
const prisma_1 = require("../utils/prisma");
const reportingService = __importStar(require("../services/reporting.service"));
const logger_service_1 = require("../services/logger.service");
exports.getDashboardStats = (0, error_1.catchAsync)(async (req, res) => {
    // req.user includes role info because of our auth middleware (we'll need to ensure role is included in the JWT payload or fetched)
    // Assuming req.user is populated with { id, role: { name } } or we fetch it.
    // Check if req.user has role. If not, we might need to fetch full user details.
    // For now, let's assume `protect` middleware attaches basic user info, 
    // but ideally we should fetch the FULL user with Role/Dept/Team relations to be safe.
    const fullUser = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true }
    });
    const stats = await reportingService.getDashboardStats(fullUser);
    res.json({ status: 'success', data: stats });
});
// This was for file logs, keeping it or replacing?
// The user wants "full system log" which implies the new DB audit logs.
// Let's add a new endpoint for Audit Logs specifically.
const auditService = __importStar(require("../services/audit.service"));
exports.getSystemLogs = (0, error_1.catchAsync)(async (req, res) => {
    // Legacy file/console logs
    const logs = await (0, logger_service_1.getLogs)(100);
    res.json({ status: 'success', data: logs });
});
exports.getAuditLogs = (0, error_1.catchAsync)(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    const logs = await auditService.getAuditLogs(limit, offset);
    res.json({ status: 'success', data: logs });
});
