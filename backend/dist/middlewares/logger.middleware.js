"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionLogger = void 0;
const logger_service_1 = require("../services/logger.service");
const actionLogger = async (req, res, next) => {
    // Only log state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const originalSend = res.send;
        res.send = function (data) {
            res.send = originalSend;
            // Log after response is sent
            const userId = req.user?.userId || null;
            const resource = req.originalUrl.split('?')[0]; // path without query params
            const action = req.method;
            const ip = req.ip || req.socket.remoteAddress || null;
            (0, logger_service_1.logAction)(userId, action, resource, {
                body: req.body,
                params: req.params,
                query: req.query,
                statusCode: res.statusCode
            }, ip);
            return originalSend.apply(res, arguments);
        };
    }
    next();
};
exports.actionLogger = actionLogger;
