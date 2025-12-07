import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';

const router = Router();

// /api/auth/airtable
router.get('/airtable', AuthController.redirect);

// /api/auth/airtable/callback (Must match redirect URI in config)
router.get('/airtable/callback', AuthController.callback);

export default router;
