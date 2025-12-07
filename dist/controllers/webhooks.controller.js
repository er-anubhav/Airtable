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
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveAirtableWebhook = void 0;
const webhook_service_1 = require("../services/webhook.service");
const receiveAirtableWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Airtable sends a POST with a body (sometimes empty or ping)
    // We should validate the MAC secret if we stored it, but for MVP we process assuming validity or check headers.
    // The webhook ID is usually in the URL or body?
    // "One endpoint can handle multiple webhooks".
    // Usually we configure the webhook callback URL to include the ID? e.g. /webhooks/airtable/:webhookId
    // OR we lookup the webhook based on the body payload?
    // Airtable payload: { base: { id: ... }, webhook: { id: ... }, timestamp: ... }
    var _a, _b;
    // Check request body for webhook ID
    const webhookId = (_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.webhook) === null || _b === void 0 ? void 0 : _b.id;
    if (!webhookId) {
        // Could be a verification ping? Airtable does send an empty POST for verification challenge?
        // Actually, for verification, they might not send body?
        // "Airtable sends a request... you must respond with 200 OK".
        return res.status(200).send('OK');
    }
    // Acknowledge immediately
    res.status(200).send('OK');
    // Process in background
    webhook_service_1.WebhookService.handleWebhookNotification(webhookId).catch(err => {
        console.error('Background webhook processing failed:', err);
    });
});
exports.receiveAirtableWebhook = receiveAirtableWebhook;
