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
exports.FormService = void 0;
const form_model_1 = require("../models/form.model");
const logger_1 = require("../utils/logger");
const webhook_model_1 = require("../models/webhook.model");
const airtable_service_1 = require("./airtable.service");
const user_model_1 = require("../models/user.model");
exports.FormService = {
    createForm: (userId, formData) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const form = yield form_model_1.Form.create(Object.assign(Object.assign({}, formData), { ownerId: userId }));
            // Webhook Registration
            // Check if we already have a webhook for this Base for this User
            // Note: formData.airtableBaseId might be undefined if not provided, but model requires it? 
            // The model is likely strict, but partial allows undefined.
            if (formData.airtableBaseId) {
                const existingWebhook = yield webhook_model_1.WebhookSubscription.findOne({
                    userId: userId,
                    baseId: formData.airtableBaseId
                });
                if (!existingWebhook) {
                    // Create new webhook
                    const owner = yield user_model_1.User.findById(userId);
                    if (owner) {
                        try {
                            // Use env var for URL, fallback to localhost
                            const webhookUrl = process.env.WEBHOOK_URL ?
                                `${process.env.WEBHOOK_URL}/api/webhooks/airtable` :
                                `http://localhost:3000/api/webhooks/airtable`; // Needs public URL
                            const webhookData = yield airtable_service_1.AirtableService.createWebhook(owner, formData.airtableBaseId, webhookUrl);
                            yield webhook_model_1.WebhookSubscription.create({
                                webhookId: webhookData.id,
                                baseId: formData.airtableBaseId,
                                userId: owner._id,
                                macSecret: webhookData.macSecret,
                                expirationTime: webhookData.expirationTime
                            });
                            logger_1.logger.info(`Webhook created for base: ${formData.airtableBaseId}`);
                        }
                        catch (err) {
                            // Don't fail form creation if webhook fails (optional)
                            logger_1.logger.error(`Failed to create webhook: ${err.message}`);
                        }
                    }
                }
            }
            return form;
        }
        catch (error) {
            logger_1.logger.error(`Error creating form: ${error.message}`);
            throw error;
        }
    }),
    getFormById: (formId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const form = yield form_model_1.Form.findById(formId);
            if (!form) {
                throw new Error('Form not found');
            }
            return form;
        }
        catch (error) {
            logger_1.logger.error(`Error fetching form: ${error.message}`);
            throw error;
        }
    }),
    getFormsByUser: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const forms = yield form_model_1.Form.find({ ownerId: userId }).sort({ createdAt: -1 });
            return forms;
        }
        catch (error) {
            logger_1.logger.error(`Error fetching user forms: ${error.message}`);
            throw error;
        }
    })
};
