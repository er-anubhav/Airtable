import mongoose, { Schema, Document } from 'mongoose';

export interface IConditionalRule {
    dependsOn: string; // questionKey
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
}

export interface IQuestion {
    questionKey: string;
    airtableFieldId: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[]; // For select fields
    conditionalRules?: IConditionalRule[];
    conditionLogic?: 'and' | 'or';
}

export interface IForm extends Document {
    ownerId: mongoose.Types.ObjectId;
    airtableBaseId: string;
    airtableTableId: string;
    title: string;
    description?: string;
    questions: IQuestion[];
    createdAt: Date;
    updatedAt: Date;
}

const ConditionalRuleSchema = new Schema({
    dependsOn: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true }
});

const QuestionSchema = new Schema({
    questionKey: { type: String, required: true },
    airtableFieldId: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    conditionalRules: [ConditionalRuleSchema],
    conditionLogic: { type: String, enum: ['and', 'or'], default: 'and' }
});

const FormSchema: Schema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    airtableBaseId: { type: String, required: true },
    airtableTableId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [QuestionSchema]
}, {
    timestamps: true
});

export const Form = mongoose.model<IForm>('Form', FormSchema);
