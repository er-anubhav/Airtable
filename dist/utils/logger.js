"use strict";
// Logger utility
// Can wrap console.log or use winston/pino
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (msg) => console.log(`[INFO] ${msg}`),
    error: (msg) => console.error(`[ERROR] ${msg}`),
    warn: (msg) => console.warn(`[WARN] ${msg}`),
};
