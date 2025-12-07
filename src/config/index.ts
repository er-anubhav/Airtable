import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Database
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/airtable_app';

// Airtable OAuth
export const AIRTABLE_CLIENT_ID = process.env.AIRTABLE_CLIENT_ID || '';
export const AIRTABLE_CLIENT_SECRET = process.env.AIRTABLE_CLIENT_SECRET || '';
export const AIRTABLE_REDIRECT_URI = process.env.AIRTABLE_REDIRECT_URI || 'http://localhost:3000/api/auth/airtable/callback';

// JWT & Frontend
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';


