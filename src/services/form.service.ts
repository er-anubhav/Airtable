import { Form, IForm } from '../models/form.model';
import { logger } from '../utils/logger';
import { WebhookSubscription } from '../models/webhook.model';
import { AirtableService } from './airtable.service';
import { User } from '../models/user.model';

export const FormService = {
    createForm: async (userId: string, formData: Partial<IForm>) => {
        try {
            const form = await Form.create({
                ...formData,
                ownerId: userId
            });

            // Webhook Registration
            // Check if we already have a webhook for this Base for this User
            // Note: formData.airtableBaseId might be undefined if not provided, but model requires it? 
            // The model is likely strict, but partial allows undefined.
            if (formData.airtableBaseId) {
                const existingWebhook = await WebhookSubscription.findOne({
                    userId: userId,
                    baseId: formData.airtableBaseId
                });

                if (!existingWebhook) {
                    // Create new webhook
                    const owner = await User.findById(userId);
                    if (owner) {
                        try {
                            // Use env var for URL, fallback to localhost
                            const webhookUrl = process.env.WEBHOOK_URL ?
                                `${process.env.WEBHOOK_URL}/api/webhooks/airtable` :
                                `http://localhost:3000/api/webhooks/airtable`; // Needs public URL

                            const webhookData = await AirtableService.createWebhook(owner, formData.airtableBaseId, webhookUrl);

                            await WebhookSubscription.create({
                                webhookId: webhookData.id,
                                baseId: formData.airtableBaseId,
                                userId: owner._id,
                                macSecret: webhookData.macSecret,
                                expirationTime: webhookData.expirationTime
                            });
                            logger.info(`Webhook created for base: ${formData.airtableBaseId}`);
                        } catch (err: any) {
                            // Don't fail form creation if webhook fails (optional)
                            logger.error(`Failed to create webhook: ${err.message}`);
                        }
                    }
                }
            }

            return form;
        } catch (error: any) {
            logger.error(`Error creating form: ${error.message}`);
            throw error;
        }
    },

    getFormById: async (formId: string) => {
        try {
            const form = await Form.findById(formId);
            if (!form) {
                throw new Error('Form not found');
            }
            return form;
        } catch (error: any) {
            logger.error(`Error fetching form: ${error.message}`);
            throw error;
        }
    },

    getFormsByUser: async (userId: string) => {
        try {
            const forms = await Form.find({ ownerId: userId }).sort({ createdAt: -1 });
            return forms;
        } catch (error: any) {
            logger.error(`Error fetching user forms: ${error.message}`);
            throw error;
        }
    }
};
