import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AirtableService } from '../services/airtable.service';
import { logger } from '../utils/logger';
import { JWT_SECRET, FRONTEND_URL } from '../config';



// Helper to generate code challenge
const base64URLEncode = (buffer: Buffer) => {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
};

const sha256 = (buffer: Buffer) => {
    return crypto.createHash('sha256').update(buffer).digest();
};

// Initiates the OAuth flow
export const redirect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const state = crypto.randomUUID();
        const codeVerifier = base64URLEncode(crypto.randomBytes(32));
        const codeChallenge = base64URLEncode(sha256(Buffer.from(codeVerifier)));

        // Store verifier in cookie (short lived)
        res.cookie('airtable_code_verifier', codeVerifier, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 10 * 60 * 1000 // 10 minutes
        });

        const url = AirtableService.getAuthorizationUrl(state, codeChallenge);
        res.redirect(url);
    } catch (error) {
        next(error);
    }
};

// Handles the OAuth callback
export const callback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code, state, error } = req.query;
        const codeVerifier = req.cookies['airtable_code_verifier'];

        if (error) {
            logger.error(`OAuth Error: ${error}`);
            // Explicit return to avoid TypeScript error about fallthrough / no return
            res.status(400).json({ success: false, message: error });
            return;
        }

        if (!code || typeof code !== 'string') {
            res.status(400).json({ success: false, message: 'Missing authorization code' });
            return;
        }

        if (!codeVerifier) {
            res.status(400).json({ success: false, message: 'Missing code verifier (cookie)' });
            return;
        }

        // Exchange code for tokens
        const tokenData = await AirtableService.exchangeCodeForToken(code, codeVerifier);

        // Clear cookie
        res.clearCookie('airtable_code_verifier');

        // Process user logic (save DB etc)
        const user = await AirtableService.handleAuthCallback(tokenData);

        // Generate JWT
        const token = jwt.sign(
            { id: user.airtableUserId, email: user.profile?.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect to Frontend with token
        res.redirect(`${FRONTEND_URL}/login?token=${token}`);

    } catch (error) {
        next(error);
    }
};
