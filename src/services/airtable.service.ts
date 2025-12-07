import axios from 'axios';
import { AIRTABLE_CONFIG } from '../config/airtable';
import { User, IUser } from '../models/user.model';
import { logger } from '../utils/logger';

// Helper to calculate expiration date (approx 60 mins)
const calculateExpiration = (expiresIn: number) => {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    return expiresAt;
};

// Encode credentials for Basic Auth
const getEncodedCredentials = () => {
    return Buffer.from(`${AIRTABLE_CONFIG.clientId}:${AIRTABLE_CONFIG.clientSecret}`).toString('base64');
};

// Helper for making Airtable API requests with automatic token refresh
const makeAirtableRequest = async (user: IUser, method: 'get' | 'post', url: string, data?: any) => {
    try {
        // Check if token is expired or about to expire (e.g., within 5 minutes)
        if (new Date() >= new Date(user.tokenExpiresAt.getTime() - 5 * 60000)) {
            logger.info('Token expired or expiring soon, refreshing...');
            const refreshData = await AirtableService.refreshAccessToken(user.refreshToken);

            // Update user tokens
            user.accessToken = refreshData.access_token;
            user.refreshToken = refreshData.refresh_token;
            user.tokenExpiresAt = calculateExpiration(refreshData.expires_in);
            await user.save();
        }

        const config = {
            method,
            url,
            headers: {
                Authorization: `Bearer ${user.accessToken}`
            },
            data
        };

        const response = await axios(config);
        return response.data;
    } catch (error: any) {
        // Double check for 401 just in case expiration check missed it or some other issue
        if (error.response?.status === 401) {
            logger.warn('Received 401 from Airtable, attempting one-time refresh...');
            try {
                const refreshData = await AirtableService.refreshAccessToken(user.refreshToken);
                user.accessToken = refreshData.access_token;
                user.refreshToken = refreshData.refresh_token;
                user.tokenExpiresAt = calculateExpiration(refreshData.expires_in);
                await user.save();

                // Retry request
                const retryConfig = {
                    method,
                    url,
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`
                    },
                    data
                };
                const retryResponse = await axios(retryConfig);
                return retryResponse.data;
            } catch (refreshError: any) {
                logger.error('Failed to refresh token on 401 retry');
                throw refreshError;
            }
        }
        throw error;
    }
};

export const AirtableService = {
    // Generate the URL to redirect the user to
    getAuthorizationUrl: (state: string, codeChallenge: string) => {
        const params = new URLSearchParams({
            client_id: AIRTABLE_CONFIG.clientId,
            redirect_uri: AIRTABLE_CONFIG.redirectUri,
            response_type: 'code',
            scope: AIRTABLE_CONFIG.scopes.join(' '),
            state: state,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256'
        });
        return `https://airtable.com/oauth2/v1/authorize?${params.toString()}`;
    },

    // Exchange authorization code for tokens
    exchangeCodeForToken: async (code: string, codeVerifier: string) => {
        try {
            const response = await axios.post('https://airtable.com/oauth2/v1/token', new URLSearchParams({
                code,
                redirect_uri: AIRTABLE_CONFIG.redirectUri,
                grant_type: 'authorization_code',
                code_verifier: codeVerifier
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${getEncodedCredentials()}`
                }
            });

            return response.data; // { access_token, refresh_token, expires_in, refresh_expires_in, scope }
        } catch (error: any) {
            logger.error(`Error exchanging code for token: ${error.response?.data?.error || error.message}`);
            throw error;
        }
    },

    // Refresh access token
    refreshAccessToken: async (refreshToken: string) => {
        try {
            const response = await axios.post('https://airtable.com/oauth2/v1/token', new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${getEncodedCredentials()}`
                }
            });

            return response.data;
        } catch (error: any) {
            logger.error(`Error refreshing token: ${error.response?.data?.error || error.message}`);
            throw error;
        }
    },

    // Get basic user info (identity)
    getUserInfo: async (accessToken: string) => {
        try {
            const response = await axios.get('https://api.airtable.com/v0/meta/whoami', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data; // { id, email, scopes }
        } catch (error: any) {
            logger.error(`Error fetching user info: ${error.response?.data?.error || error.message}`);
            throw error;
        }
    },

    // Helper to find or create user in DB
    handleAuthCallback: async (tokenData: any) => {
        const userInfo = await AirtableService.getUserInfo(tokenData.access_token);

        let user = await User.findOne({ airtableUserId: userInfo.id });

        const tokenExpiresAt = calculateExpiration(tokenData.expires_in);

        if (user) {
            user.accessToken = tokenData.access_token;
            user.refreshToken = tokenData.refresh_token; // Refresh token might change
            user.tokenExpiresAt = tokenExpiresAt;
            user.scopes = userInfo.scopes || tokenData.scope?.split(' ') || [];
            user.lastLogin = new Date();
            user.profile = {
                id: userInfo.id,
                email: userInfo.email
            };
            await user.save();
        } else {
            user = await User.create({
                airtableUserId: userInfo.id,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                tokenExpiresAt: tokenExpiresAt,
                scopes: userInfo.scopes || tokenData.scope?.split(' ') || [],
                profile: {
                    id: userInfo.id,
                    email: userInfo.email
                },
                lastLogin: new Date()
            });
        }
        return user;
    },

    // New Data Fetching Methods

    getBases: async (user: IUser) => {
        const data = await makeAirtableRequest(user, 'get', 'https://api.airtable.com/v0/meta/bases');
        return data.bases;
    },

    getTables: async (user: IUser, baseId: string) => {
        const data = await makeAirtableRequest(user, 'get', `https://api.airtable.com/v0/meta/bases/${baseId}/tables`);
        return data.tables;
    },

    getFields: async (user: IUser, baseId: string, tableId: string) => {
        const tables = await AirtableService.getTables(user, baseId);
        const table = tables.find((t: any) => t.id === tableId);

        if (!table) {
            throw new Error('Table not found');
        }

        const allowedTypes = ['singleLineText', 'multilineText', 'singleSelect', 'multipleSelects', 'multipleAttachments'];

        const filteredFields = table.fields.filter((field: any) => allowedTypes.includes(field.type));

        return filteredFields;
    },

    createRecord: async (user: IUser, baseId: string, tableId: string, fields: Record<string, any>) => {
        const data = {
            fields: fields
        };
        const response = await makeAirtableRequest(user, 'post', `https://api.airtable.com/v0/${baseId}/${tableId}`, data);
        return response; // Contains .id, .createdTime, .fields
    },

    createWebhook: async (user: IUser, baseId: string, notificationUrl: string) => {
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
        const response = await makeAirtableRequest(user, 'post', `https://api.airtable.com/v0/bases/${baseId}/webhooks`, data);
        return response; // Contains id, macSecret, expirationTime
    },

    getWebhookPayloads: async (user: IUser, baseId: string, webhookId: string, cursor: number = 0) => {
        // GET https://api.airtable.com/v0/bases/{baseId}/webhooks/{webhookId}/payloads[?cursor={cursor}&limit={limit}]
        // Keep limit Default (usually 50)
        let url = `https://api.airtable.com/v0/bases/${baseId}/webhooks/${webhookId}/payloads`;
        if (cursor > 0) {
            url += `?cursor=${cursor}`;
        }

        const response = await makeAirtableRequest(user, 'get', url);
        return response; // Contains payloads (array), cursor (next cursor)
    }
};
