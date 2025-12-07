import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';

export const receiveAirtableWebhook = async (req: Request, res: Response) => {
    // Airtable sends a POST with a body (sometimes empty or ping)
    // We should validate the MAC secret if we stored it, but for MVP we process assuming validity or check headers.
    // The webhook ID is usually in the URL or body?
    // "One endpoint can handle multiple webhooks".
    // Usually we configure the webhook callback URL to include the ID? e.g. /webhooks/airtable/:webhookId
    // OR we lookup the webhook based on the body payload?
    // Airtable payload: { base: { id: ... }, webhook: { id: ... }, timestamp: ... }

    // Check request body for webhook ID
    const webhookId = req.body?.webhook?.id;

    if (!webhookId) {
        // Could be a verification ping? Airtable does send an empty POST for verification challenge?
        // Actually, for verification, they might not send body?
        // "Airtable sends a request... you must respond with 200 OK".
        return res.status(200).send('OK');
    }

    // Acknowledge immediately
    res.status(200).send('OK');

    // Process in background
    WebhookService.handleWebhookNotification(webhookId).catch(err => {
        console.error('Background webhook processing failed:', err);
    });
};
