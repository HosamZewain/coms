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
exports.getMe = exports.login = exports.register = void 0;
const error_1 = require("../utils/error");
const authService = __importStar(require("../services/auth.service"));
const validation_1 = require("../utils/validation");
exports.register = (0, error_1.catchAsync)(async (req, res, next) => {
    try {
        const data = validation_1.registerSchema.parse(req.body);
        const user = await authService.registerUser(data);
        res.status(201).json({ status: 'success', data: user });
    }
    catch (error) {
        console.error('REGISTER ERROR:', error); // DEBUG LOG
        next(error); // Pass the error to the next middleware (e.g., global error handler)
    }
});
exports.login = (0, error_1.catchAsync)(async (req, res) => {
    const data = validation_1.loginSchema.parse(req.body);
    const result = await authService.loginUser(data);
    res.status(200).json({ status: 'success', data: result });
});
exports.getMe = (0, error_1.catchAsync)(async (req, res) => {
    const user = await authService.getUserById(req.user.userId);
    res.status(200).json({ status: 'success', data: user });
});
