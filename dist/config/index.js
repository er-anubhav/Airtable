"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTEND_URL = exports.JWT_SECRET = exports.AIRTABLE_REDIRECT_URI = exports.AIRTABLE_CLIENT_SECRET = exports.AIRTABLE_CLIENT_ID = exports.MONGO_URI = exports.NODE_ENV = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT || 3000;
exports.NODE_ENV = process.env.NODE_ENV || 'development';
// Database
exports.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/airtable_app';
// Airtable OAuth
exports.AIRTABLE_CLIENT_ID = process.env.AIRTABLE_CLIENT_ID || '';
exports.AIRTABLE_CLIENT_SECRET = process.env.AIRTABLE_CLIENT_SECRET || '';
exports.AIRTABLE_REDIRECT_URI = process.env.AIRTABLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';
// JWT & Frontend
exports.JWT_SECRET = process.env.JWT_SECRET || 'secret';
exports.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
