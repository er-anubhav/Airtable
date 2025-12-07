"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhooks_controller_1 = require("../controllers/webhooks.controller");
const router = (0, express_1.Router)();
// Endpoint for Airtable to hit
// Note: We might need to expose a generic endpoint or one with ID.
// If Airtable sends the ID in the body, a generic endpoint works.
router.post('/airtable', webhooks_controller_1.receiveAirtableWebhook);
exports.default = router;
