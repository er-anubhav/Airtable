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
exports.AirtableService = void 0;
const axios_1 = __importDefault(require("axios"));
const airtable_1 = require("../config/airtable");
const user_model_1 = require("../models/user.model");
const logger_1 = require("../utils/logger");
// Helper to calculate expiration date (approx 60 mins)
const calculateExpiration = (expiresIn) => {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    return expiresAt;
};
// Encode credentials for Basic Auth
const getEncodedCredentials = () => {
    return Buffer.from(`${airtable_1.AIRTABLE_CONFIG.clientId}:${airtable_1.AIRTABLE_CONFIG.clientSecret}`).toString('base64');
};
// Helper for making Airtable API requests with automatic token refresh
const makeAirtableRequest = (user, method, url, data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Check if token is expired or about to expire (e.g., within 5 minutes)
        if (new Date() >= new Date(user.tokenExpiresAt.getTime() - 5 * 60000)) {
            logger_1.logger.info('Token expired or expiring soon, refreshing...');
            const refreshData = yield exports.AirtableService.refreshAccessToken(user.refreshToken);
            // Update user tokens
            user.accessToken = refreshData.access_token;
            user.refreshToken = refreshData.refresh_token;
            user.tokenExpiresAt = calculateExpiration(refreshData.expires_in);
            yield user.save();
        }
        const config = {
            method,
            url,
            headers: {
                Authorization: `Bearer ${user.accessToken}`
            },
            data
        };
        const response = yield (0, axios_1.default)(config);
        return response.data;
    }
    catch (error) {
        // Double check for 401 just in case expiration check missed it or some other issue
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            logger_1.logger.warn('Received 401 from Airtable, attempting one-time refresh...');
            try {
                const refreshData = yield exports.AirtableService.refreshAccessToken(user.refreshToken);
                user.accessToken = refreshData.access_token;
                user.refreshToken = refreshData.refresh_token;
                user.tokenExpiresAt = calculateExpiration(refreshData.expires_in);
                yield user.save();
                // Retry request
                const retryConfig = {
                    method,
                    url,
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`
                    },
                    data
                };
                const retryResponse = yield (0, axios_1.default)(retryConfig);
                return retryResponse.data;
            }
            catch (refreshError) {
                logger_1.logger.error('Failed to refresh token on 401 retry');
                throw refreshError;
            }
        }
        throw error;
    }
});
exports.AirtableService = {
    // Generate the URL to redirect the user to
    getAuthorizationUrl: (state) => {
        const params = new URLSearchParams({
            client_id: airtable_1.AIRTABLE_CONFIG.clientId,
            redirect_uri: airtable_1.AIRTABLE_CONFIG.redirectUri,
            response_type: 'code',
            scope: airtable_1.AIRTABLE_CONFIG.scopes.join(' '),
            state: state,
        });
        return `https://airtable.com/oauth2/v1/authorize?${params.toString()}`;
    },
    // Exchange authorization code for tokens
    exchangeCodeForToken: (code) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const response = yield axios_1.default.post('https://airtable.com/oauth2/v1/token', new URLSearchParams({
                code,
                redirect_uri: airtable_1.AIRTABLE_CONFIG.redirectUri,
                grant_type: 'authorization_code',
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${getEncodedCredentials()}`
                }
            });
            return response.data; // { access_token, refresh_token, expires_in, refresh_expires_in, scope }
        }
        catch (error) {
            logger_1.logger.error(`Error exchanging code for token: ${((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || error.message}`);
            throw error;
        }
    }),
    // Refresh access token
    refreshAccessToken: (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const response = yield axios_1.default.post('https://airtable.com/oauth2/v1/token', new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${getEncodedCredentials()}`
                }
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error(`Error refreshing token: ${((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || error.message}`);
            throw error;
        }
    }),
    // Get basic user info (identity)
    getUserInfo: (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const response = yield axios_1.default.get('https://api.airtable.com/v0/meta/whoami', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data; // { id, email, scopes }
        }
        catch (error) {
            logger_1.logger.error(`Error fetching user info: ${((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || error.message}`);
            throw error;
        }
    }),
    // Helper to find or create user in DB
    handleAuthCallback: (tokenData) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const userInfo = yield exports.AirtableService.getUserInfo(tokenData.access_token);
        let user = yield user_model_1.User.findOne({ airtableUserId: userInfo.id });
        const tokenExpiresAt = calculateExpiration(tokenData.expires_in);
        if (user) {
            user.accessToken = tokenData.access_token;
            user.refreshToken = tokenData.refresh_token; // Refresh token might change
            user.tokenExpiresAt = tokenExpiresAt;
            user.scopes = userInfo.scopes || ((_a = tokenData.scope) === null || _a === void 0 ? void 0 : _a.split(' ')) || [];
            user.lastLogin = new Date();
            user.profile = {
                id: userInfo.id,
                email: userInfo.email
            };
            yield user.save();
        }
        else {
            user = yield user_model_1.User.create({
                airtableUserId: userInfo.id,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                tokenExpiresAt: tokenExpiresAt,
                scopes: userInfo.scopes || ((_b = tokenData.scope) === null || _b === void 0 ? void 0 : _b.split(' ')) || [],
                profile: {
                    id: userInfo.id,
                    email: userInfo.email
                },
                lastLogin: new Date()
            });
        }
        return user;
    }),
    // New Data Fetching Methods
    getBases: (user) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeAirtableRequest(user, 'get', 'https://api.airtable.com/v0/meta/bases');
        return data.bases;
    }),
    getTables: (user, baseId) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield makeAirtableRequest(user, 'get', `https://api.airtable.com/v0/meta/bases/${baseId}/tables`);
        return data.tables;
    }),
    getFields: (user, baseId, tableId) => __awaiter(void 0, void 0, void 0, function* () {
        const tables = yield exports.AirtableService.getTables(user, baseId);
        const table = tables.find((t) => t.id === tableId);
        if (!table) {
            throw new Error('Table not found');
        }
        const allowedTypes = ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelects', 'multipleAttachments'];
        const filteredFields = table.fields.filter((field) => allowedTypes.includes(field.type));
        return filteredFields;
    }),
    createRecord: (user, baseId, tableId, fields) => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            fields: fields
        };
        const response = yield makeAirtableRequest(user, 'post', `https://api.airtable.com/v0/${baseId}/${tableId}`, data);
        return response; // Contains .id, .createdTime, .fields
    }),
    createWebhook: (user, baseId, notificationUrl) => __awaiter(void 0, void 0, void 0, function* () {
        const data = {
            notificationUrl,
            specification: {
                options: {
                    filters: {
                        dataTypes: ['tableData'],
                        recordChangeScope: 'tbl', // Listen to all tables, or specify table
                    }
                }
            }
        };
        const response = yield makeAirtableRequest(user, 'post', `https://api.airtable.com/v0/bases/${baseId}/webhooks`, data);
        return response; // Contains id, macSecret, expirationTime
    }),
    getWebhookPayloads: (user_1, baseId_1, webhookId_1, ...args_1) => __awaiter(void 0, [user_1, baseId_1, webhookId_1, ...args_1], void 0, function* (user, baseId, webhookId, cursor = 0) {
        // GET https://api.airtable.com/v0/bases/{baseId}/webhooks/{webhookId}/payloads[?cursor={cursor}&limit={limit}]
        // Keep limit Default (usually 50)
        let url = `https://api.airtable.com/v0/bases/${baseId}/webhooks/${webhookId}/payloads`;
        if (cursor > 0) {
            url += `?cursor=${cursor}`;
        }
        const response = yield makeAirtableRequest(user, 'get', url);
        return response; // Contains payloads (array), cursor (next cursor)
    })
};
