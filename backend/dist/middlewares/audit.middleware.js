"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = void 0;
const audit_service_1 = require("../services/audit.service");
const auditMiddleware = (req, res, next) => {
    // Only log state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        // Intercept json method to check for success before logging
        const originalJson = res.json;
        res.json = function (body) {
            // Restore original to ensure response sends
            res.json = originalJson;
            // Perform logging asynchronously after response is initiated
            // We use 'finish' event or just fire and forget here if we are checking body status
            // Checking body status directly
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const user = req.user;
                if (user) {
                    // Determine Action
                    let action = 'UNKNOWN';
                    if (req.method === 'POST')
                        action = 'CREATE';
                    if (req.method === 'PUT' || req.method === 'PATCH')
                        action = 'UPDATE';
                    if (req.method === 'DELETE')
                        action = 'DELETE';
                    // Resource path (e.g., /api/employees/123 -> /api/employees)
                    // A bit simplistic, but works for general logging. 
                    // Can refine to extract resource name more cleanly.
                    const resource = req.baseUrl || req.path;
                    // Scrub sensitive data
                    const details = { ...req.body };
                    if (details.password)
                        details.password = '[REDACTED]';
                    // Log it
                    (0, audit_service_1.logAction)(user.userId || user.id, action, resource, details, req.ip).catch(err => console.error('Audit Log Error:', err));
                }
            }
            return res.json(body);
        };
    }
    next();
};
exports.auditMiddleware = auditMiddleware;
