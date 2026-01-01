"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizePermission = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../utils/error");
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return next(new error_1.AppError('Authentication required', 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            ...decoded,
            id: decoded.userId // Add id field for compatibility
        };
        next();
    }
    catch (error) {
        next(new error_1.AppError('Invalid token', 401));
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        // Normalize both sides to upper case for comparison
        const upperRoles = roles.map(r => r.toUpperCase());
        if (!req.user || !upperRoles.includes(req.user.role.toUpperCase())) { // Bug fix: was checking against mixed case roles
            return next(new error_1.AppError('Forbidden: Role not authorized', 403));
        }
        next();
    };
};
exports.authorize = authorize;
const authorizePermission = (module, action) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return next(new error_1.AppError('Forbidden: No permissions found', 403));
        }
        const requiredPermission = `${module}:${action}`;
        const hasPermission = req.user.permissions.includes(requiredPermission) ||
            req.user.permissions.includes('*:*') ||
            req.user.permissions.includes(`${module}:*`);
        if (!hasPermission) {
            return next(new error_1.AppError(`Forbidden: Missing permission ${requiredPermission}`, 403));
        }
        next();
    };
};
exports.authorizePermission = authorizePermission;
