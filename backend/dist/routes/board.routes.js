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
const express_1 = require("express");
const boardController = __importStar(require("../controllers/board.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', boardController.getBoards);
router.post('/', boardController.createBoard);
router.get('/:id', boardController.getBoard);
router.patch('/:id', boardController.updateBoard); // params.id
router.delete('/:id', boardController.deleteBoard);
// Nested Resources - Plans
// import * as planController from '../controllers/plan.controller'; // Ensure this file exists and exports
// router.get('/:boardId/plans', planController.getPlans);
// router.post('/:boardId/plans', planController.createPlan);
// Nested Resources - Epics
const epicController = __importStar(require("../controllers/epic.controller"));
router.get('/:boardId/epics', epicController.getEpics);
router.post('/:boardId/epics', epicController.createEpic);
// Nested Resources - Tasks
const taskController = __importStar(require("../controllers/task.controller"));
router.get('/:boardId/tasks', taskController.getTasks);
router.post('/:boardId/tasks', taskController.createTask);
// Nested Resources - Queries
const queryController = __importStar(require("../controllers/query.controller"));
router.get('/:boardId/queries', queryController.getQueries);
router.post('/:boardId/queries', queryController.createQuery);
// Access management
router.post('/:id/access', boardController.addMember);
router.delete('/:id/access/:accessId', boardController.removeMember);
exports.default = router;
