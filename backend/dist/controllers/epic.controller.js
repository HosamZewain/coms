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
exports.deleteEpic = exports.updateEpic = exports.getEpic = exports.getEpics = exports.createEpic = void 0;
const error_1 = require("../utils/error");
const epicService = __importStar(require("../services/epic.service"));
const error_2 = require("../utils/error");
exports.createEpic = (0, error_1.catchAsync)(async (req, res) => {
    const boardId = req.params.boardId;
    if (!req.user)
        throw new error_2.AppError('User not authenticated', 401);
    const epic = await epicService.createEpic({
        boardId,
        ...req.body,
        createdByUserId: req.user.id
    });
    res.status(201).json({ status: 'success', data: epic });
});
exports.getEpics = (0, error_1.catchAsync)(async (req, res) => {
    const boardId = req.params.boardId;
    const epics = await epicService.getEpics(boardId);
    res.json({ status: 'success', data: epics });
});
exports.getEpic = (0, error_1.catchAsync)(async (req, res) => {
    const epic = await epicService.getEpic(req.params.id);
    res.json({ status: 'success', data: epic });
});
exports.updateEpic = (0, error_1.catchAsync)(async (req, res) => {
    const epic = await epicService.updateEpic(req.params.id, req.body);
    res.json({ status: 'success', data: epic });
});
exports.deleteEpic = (0, error_1.catchAsync)(async (req, res) => {
    await epicService.deleteEpic(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
