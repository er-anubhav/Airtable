import { AIRTABLE_CLIENT_ID, AIRTABLE_CLIENT_SECRET, AIRTABLE_REDIRECT_URI } from './index';

export const AIRTABLE_CONFIG = {
    apiKey: process.env.AIRTABLE_API_KEY, // Keeping for backward compat if needed
    baseId: process.env.AIRTABLE_BASE_ID,
    clientId: AIRTABLE_CLIENT_ID,
    clientSecret: AIRTABLE_CLIENT_SECRET,
    redirectUri: AIRTABLE_REDIRECT_URI,
    scopes: ['data.records:read', 'data.records:write', 'schema.bases:read', 'webhook:manage'],
};

