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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const planController = __importStar(require("../controllers/plan.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const milestone_routes_1 = __importDefault(require("./milestone.routes"));
const router = express_1.default.Router({ mergeParams: true });
router.use(auth_middleware_1.authenticate);
router
    .route('/')
    .post((0, auth_middleware_1.authorize)(['ADMIN', 'MANAGER', 'EMPLOYEE']), planController.createPlan)
    .get((0, auth_middleware_1.authorize)(['ADMIN', 'MANAGER', 'EMPLOYEE']), planController.getProjectPlans);
router
    .route('/:id')
    .patch((0, auth_middleware_1.authorize)(['ADMIN', 'MANAGER', 'EMPLOYEE']), planController.updatePlan);
router
    .route('/:id/archive')
    .post((0, auth_middleware_1.authorize)(['ADMIN', 'MANAGER', 'EMPLOYEE']), planController.archivePlan);
// Nested routes
router.use('/:planId/milestones', milestone_routes_1.default);
exports.default = router;
