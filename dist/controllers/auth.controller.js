"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callback = exports.redirect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const airtable_service_1 = require("../services/airtable.service");
const logger_1 = require("../utils/logger");
const config_1 = require("../config");
// Initiates the OAuth flow
const redirect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const state = Math.random().toString(36).substring(7); // Simple random state for now
        const url = airtable_service_1.AirtableService.getAuthorizationUrl(state);
        res.redirect(url);
    }
    catch (error) {
        next(error);
    }
});
exports.redirect = redirect;
// Handles the OAuth callback
const callback = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { code, state, error } = req.query;
        if (error) {
            logger_1.logger.error(`OAuth Error: ${error}`);
            // Explicit return to avoid TypeScript error about fallthrough / no return
            res.status(400).json({ success: false, message: error });
            return;
        }
        if (!code || typeof code !== 'string') {
            res.status(400).json({ success: false, message: 'Missing authorization code' });
            return;
        }
        // Exchange code for tokens
        const tokenData = yield airtable_service_1.AirtableService.exchangeCodeForToken(code);
        // Process user logic (save DB etc)
        const user = yield airtable_service_1.AirtableService.handleAuthCallback(tokenData);
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ id: user.airtableUserId, email: (_a = user.profile) === null || _a === void 0 ? void 0 : _a.email }, config_1.JWT_SECRET, { expiresIn: '7d' });
        // Redirect to Frontend with token
        res.redirect(`${config_1.FRONTEND_URL}/login?token=${token}`);
    }
    catch (error) {
        next(error);
    }
});
exports.callback = callback;
