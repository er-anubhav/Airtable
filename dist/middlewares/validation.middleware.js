"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
// Middleware helper for validating requests
const validate = (schema) => (req, res, next) => {
    // Validation logic here
    next();
};
exports.validate = validate;
