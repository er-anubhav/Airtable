import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookSubscription extends Document {
    webhookId: string;
    baseId: string;
    userId: mongoose.Types.ObjectId;
    cursor: number;
    macSecret?: string;
    expirationTime?: Date;
}

const WebhookSubscriptionSchema: Schema = new Schema({
    webhookId: { type: String, required: true },
    baseId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cursor: { type: Number, default: 0 },
    macSecret: { type: String },
    expirationTime: { type: Date }
}, {
    timestamps: true
});

export const WebhookSubscription = mongoose.model<IWebhookSubscription>('WebhookSubscription', WebhookSubscriptionSchema);
