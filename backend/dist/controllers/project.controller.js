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
exports.getProjectMembers = exports.removeMember = exports.addMember = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getAllProjects = exports.createProject = void 0;
const error_1 = require("../utils/error");
const projectService = __importStar(require("../services/project.service"));
exports.createProject = (0, error_1.catchAsync)(async (req, res) => {
    const data = await projectService.createProject(req.body);
    res.status(201).json({ status: 'success', data });
});
exports.getAllProjects = (0, error_1.catchAsync)(async (req, res) => {
    const data = await projectService.getAllProjects(req.query);
    res.json({ status: 'success', data });
});
exports.getProjectById = (0, error_1.catchAsync)(async (req, res) => {
    const data = await projectService.getProjectById(req.params.id);
    res.json({ status: 'success', data });
});
exports.updateProject = (0, error_1.catchAsync)(async (req, res) => {
    const data = await projectService.updateProject(req.params.id, req.body);
    res.json({ status: 'success', data });
});
exports.deleteProject = (0, error_1.catchAsync)(async (req, res) => {
    await projectService.deleteProject(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
exports.addMember = (0, error_1.catchAsync)(async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    const project = await projectService.addMember(id, userId);
    res.status(200).json({
        status: 'success',
        data: project
    });
});
exports.removeMember = (0, error_1.catchAsync)(async (req, res) => {
    const { id, userId } = req.params;
    await projectService.removeMember(id, userId);
    res.status(200).json({
        status: 'success',
        data: null
    });
});
exports.getProjectMembers = (0, error_1.catchAsync)(async (req, res) => {
    const data = await projectService.getProjectMembers(req.params.id);
    res.json({ status: 'success', data });
});
