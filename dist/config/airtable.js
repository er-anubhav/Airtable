"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIRTABLE_CONFIG = void 0;
const index_1 = require("./index");
exports.AIRTABLE_CONFIG = {
    apiKey: process.env.AIRTABLE_API_KEY, // Keeping for backward compat if needed
    baseId: process.env.AIRTABLE_BASE_ID,
    clientId: index_1.AIRTABLE_CLIENT_ID,
    clientSecret: index_1.AIRTABLE_CLIENT_SECRET,
    redirectUri: index_1.AIRTABLE_REDIRECT_URI,
    scopes: ['data.records:read', 'data.records:write', 'schema.bases:read', 'user.email:read'],
};
