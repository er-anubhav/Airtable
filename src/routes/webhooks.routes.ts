import { Router } from 'express';
import { receiveAirtableWebhook } from '../controllers/webhooks.controller';

const router = Router();

// Endpoint for Airtable to hit
// Note: We might need to expose a generic endpoint or one with ID.
// If Airtable sends the ID in the body, a generic endpoint works.
router.post('/airtable', receiveAirtableWebhook);

export default router;
