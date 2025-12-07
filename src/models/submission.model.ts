import mongoose, { Schema, Document } from 'mongoose';

export interface ISubmission extends Document {
    formId: mongoose.Types.ObjectId;
    airtableRecordId: string;
    answers: Map<string, any>; // questionKey -> value
    createdAt: Date;
    updatedAt: Date;
    deletedInAirtable?: boolean;
}

const SubmissionSchema: Schema = new Schema({
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    airtableRecordId: { type: String, required: true },
    answers: { type: Map, of: Schema.Types.Mixed, required: true },
    deletedInAirtable: { type: Boolean, default: false }
}, {
    timestamps: true
});

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema);
