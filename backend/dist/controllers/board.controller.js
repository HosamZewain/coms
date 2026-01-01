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
exports.removeMember = exports.addMember = exports.deleteBoard = exports.updateBoard = exports.getBoard = exports.getBoards = exports.createBoard = void 0;
const error_1 = require("../utils/error");
const boardService = __importStar(require("../services/board.service"));
const error_2 = require("../utils/error");
exports.createBoard = (0, error_1.catchAsync)(async (req, res) => {
    if (!req.user)
        throw new error_2.AppError('User not authenticated', 401);
    const board = await boardService.createBoard({
        ...req.body,
        ownerUserId: req.user.id
    });
    res.status(201).json({ status: 'success', data: board });
});
exports.getBoards = (0, error_1.catchAsync)(async (req, res) => {
    if (!req.user)
        throw new error_2.AppError('User not authenticated', 401);
    const teamIds = req.user.teamId ? [req.user.teamId] : [];
    // If user is in multiple teams or we have a complicated team structure, fetch them.
    // For now assuming user.teamId is the main one.
    const boards = await boardService.getBoards(req.user.id, teamIds);
    res.json({ status: 'success', data: boards });
});
exports.getBoard = (0, error_1.catchAsync)(async (req, res) => {
    // Permission check should be here or service. 
    // For MVP, we let service fetch and if empty throw 404. Service does basic fetch.
    // Real auth check: is user in board.access OR is it ORG visible?
    if (!req.user)
        throw new error_2.AppError('User not authenticated', 401);
    const board = await boardService.getBoard(req.params.id, req.user.id);
    // Manual permission check for security
    const hasAccess = board.visibility === 'ORG' ||
        board.access.some(a => a.userId === req.user.id || (req.user.teamId && a.teamId === req.user.teamId));
    if (!hasAccess)
        throw new error_2.AppError('You do not have permission to view this board', 403);
    res.json({ status: 'success', data: board });
});
exports.updateBoard = (0, error_1.catchAsync)(async (req, res) => {
    const board = await boardService.updateBoard(req.params.id, req.body);
    res.json({ status: 'success', data: board });
});
exports.deleteBoard = (0, error_1.catchAsync)(async (req, res) => {
    await boardService.deleteBoard(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
exports.addMember = (0, error_1.catchAsync)(async (req, res) => {
    // req.body: { principalId, type: 'USER' | 'TEAM', role }
    const { principalId, type, role } = req.body;
    const access = await boardService.addMember(req.params.id, principalId, type, role);
    res.status(201).json({ status: 'success', data: access });
});
exports.removeMember = (0, error_1.catchAsync)(async (req, res) => {
    // This expects accessId, not boardId/userId combo for simplicity in REST usually?
    // Or DELETE /boards/:id/access?userId=...
    // Req says: DELETE /boards/:id/access
    // Let's assume query params or body to identify MEMBER to remove.
    // For simplicity, let's look for accessId in body or query, or look it up.
    // Let's implement: DELETE /boards/:id/access/:accessId
    await boardService.removeMember(req.params.accessId);
    res.status(204).json({ status: 'success', data: null });
});
