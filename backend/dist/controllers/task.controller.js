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
exports.removeAttachment = exports.addAttachment = exports.deleteComment = exports.addComment = exports.removeAssignee = exports.addAssignee = exports.deleteTask = exports.updateTask = exports.getTask = exports.getTasks = exports.createTask = void 0;
const error_1 = require("../utils/error");
const taskService = __importStar(require("../services/task.service"));
const error_2 = require("../utils/error");
exports.createTask = (0, error_1.catchAsync)(async (req, res) => {
    if (!req.user)
        throw new error_2.AppError('User not authenticated', 401);
    // If boardId comes from params (nested route)
    const boardId = req.params.boardId || req.body.boardId;
    const task = await taskService.createTask({
        ...req.body,
        boardId,
        createdByUserId: req.user.id
    });
    res.status(201).json({ status: 'success', data: task });
});
exports.getTasks = (0, error_1.catchAsync)(async (req, res) => {
    // Handling filters
    // If nested under board: /boards/:boardId/tasks
    const boardId = req.params.boardId || req.query.boardId;
    // Parse query arrays (e.g. status=TODO&status=DONE)
    const status = req.query.status ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status]) : undefined;
    const priority = req.query.priority ? (Array.isArray(req.query.priority) ? req.query.priority : [req.query.priority]) : undefined;
    const assigneeIds = req.query.assigneeIds ? (Array.isArray(req.query.assigneeIds) ? req.query.assigneeIds : [req.query.assigneeIds]) : undefined;
    // Legacy support for single query params if still used by old frontend, but our service handles arrays.
    const filters = {
        boardId,
        planId: req.query.planId,
        milestoneId: req.query.milestoneId,
        epicId: req.query.epicId,
        projectId: req.query.projectId || req.query.project, // Handle legacy
        status: status,
        priority: priority,
        assigneeIds: assigneeIds,
        search: req.query.search,
        dueDateFrom: req.query.dueDateFrom,
        dueDateTo: req.query.dueDateTo
    };
    const tasks = await taskService.getTasks(filters);
    res.json({ status: 'success', data: tasks });
});
exports.getTask = (0, error_1.catchAsync)(async (req, res) => {
    const task = await taskService.getTask(req.params.id);
    res.json({ status: 'success', data: task });
});
exports.updateTask = (0, error_1.catchAsync)(async (req, res) => {
    if (!req.user)
        throw new error_2.AppError('User not authenticated', 401);
    const task = await taskService.updateTask(req.params.id, req.body, req.user.id);
    res.json({ status: 'success', data: task });
});
exports.deleteTask = (0, error_1.catchAsync)(async (req, res) => {
    if (!req.user)
        throw new error_2.AppError('User not authenticated', 401);
    await taskService.deleteTask(req.params.id, req.user.id);
    res.status(204).json({ status: 'success', data: null });
});
// Assignments
exports.addAssignee = (0, error_1.catchAsync)(async (req, res) => {
    // body: { userId }
    if (!req.user)
        throw new error_2.AppError('User not authenticated', 401);
    const assignment = await taskService.addAssignee(req.params.id, req.body.userId, req.user.id);
    res.status(201).json({ status: 'success', data: assignment });
});
exports.removeAssignee = (0, error_1.catchAsync)(async (req, res) => {
    // DELETE /tasks/:id/assignments/:userId
    if (!req.user)
        throw new error_2.AppError('User not authenticated', 401);
    await taskService.removeAssignee(req.params.id, req.params.userId, req.user.id);
    res.status(204).json({ status: 'success', data: null });
});
// Comments
exports.addComment = (0, error_1.catchAsync)(async (req, res) => {
    if (!req.user?.id)
        throw new error_2.AppError('User not authenticated', 401);
    const comment = await taskService.addComment(req.params.id, req.body.body, req.user.id);
    res.status(201).json({ status: 'success', data: comment });
});
exports.deleteComment = (0, error_1.catchAsync)(async (req, res) => {
    if (!req.user?.id)
        throw new error_2.AppError('User not authenticated', 401);
    await taskService.deleteComment(req.params.commentId, req.user.id);
    res.status(204).json({ status: 'success', data: null });
});
exports.addAttachment = (0, error_1.catchAsync)(async (req, res) => {
    if (!req.user?.id)
        throw new error_2.AppError('User not authenticated', 401);
    if (!req.file)
        throw new error_2.AppError('No file uploaded', 400);
    const attachment = await taskService.addAttachment(req.params.id, req.file, req.user.id);
    res.status(201).json({ status: 'success', data: attachment });
});
exports.removeAttachment = (0, error_1.catchAsync)(async (req, res) => {
    if (!req.user?.id)
        throw new error_2.AppError('User not authenticated', 401);
    await taskService.removeAttachment(req.params.attachmentId);
    res.status(204).json({ status: 'success', data: null });
});
