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
const holidayController = __importStar(require("../controllers/holiday.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Allow all authenticated users to view holidays (or maybe just view?)
// For now, let's keep it restricted to Admin/HR for management, 
// but likely employees need to see them.
// Let's say VIEW is open to all (or specific role), but MODIFY is Admin/HR.
router.get('/', holidayController.getAllHolidays);
router.get('/:id', holidayController.getHoliday);
// Protected Management Routes
router.post('/', (0, auth_middleware_1.authorize)(['Admin', 'HR']), holidayController.createHoliday);
router.put('/:id', (0, auth_middleware_1.authorize)(['Admin', 'HR']), holidayController.updateHoliday);
router.delete('/:id', (0, auth_middleware_1.authorize)(['Admin', 'HR']), holidayController.deleteHoliday);
exports.default = router;
