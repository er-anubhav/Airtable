import { Form } from '../models/form.model';
import { Submission } from '../models/submission.model';
import { User } from '../models/user.model';
import { AirtableService } from './airtable.service';
import { shouldShowQuestion, ConditionalRules } from '../utils/conditionEvaluator';

export const SubmissionService = {
    submitForm: async (formId: string, answers: Record<string, any>) => {
        // 1. Fetch Form
        const form = await Form.findById(formId);
        if (!form) {
            throw new Error('Form not found');
        }

        // 2. Validate & Evaluate Visibility
        const visibleAnswers: Record<string, any> = {};
        const airtableFields: Record<string, any> = {};

        for (const question of form.questions) {
            const isVisible = shouldShowQuestion(
                question.conditionalRules as unknown as ConditionalRules,
                answers // We use raw answers for evaluation, even if some answers might be from hidden fields (though technically hidden fields shouldn't have answers, but safety first)
            );

            if (isVisible) {
                const value = answers[question.questionKey];

                // Check Required
                if (question.required && (value === undefined || value === null || value === '')) {
                    throw new Error(`Field '${question.label}' is required.`);
                }

                // Add to visible answers map
                if (value !== undefined) {
                    visibleAnswers[question.questionKey] = value;
                    // Map to Airtable Field ID for API
                    // Note: Airtable API expects Field Names or IDs. Using IDs is safer.
                    // However, we need to verify if we stored airtableFieldId correctly.
                    // In FormBuilder we saved airtableFieldId.
                    // Airtable API docs say: "To reference a field by ID, pass the ID as the key".
                    // Wait, sometimes it expects Names. Let's use what we have.
                    // "You can create a record with a JSON object... keys are field names or IDs"
                    airtableFields[question.airtableFieldId] = value;
                }
            }
        }

        // 3. Get Owner to access Airtable
        const owner = await User.findById(form.ownerId);
        if (!owner) {
            throw new Error('Form owner not found');
        }

        // 4. Save to Airtable
        let airtableRecord;
        try {
            airtableRecord = await AirtableService.createRecord(
                owner,
                form.airtableBaseId,
                form.airtableTableId,
                airtableFields
            );
        } catch (err: any) {
            console.error('Airtable Error:', err.response?.data || err);
            throw new Error('Failed to save to Airtable: ' + (err.response?.data?.error?.message || err.message));
        }

        // 5. Save to MongoDB
        const submission = await Submission.create({
            formId: form._id,
            airtableRecordId: airtableRecord.id,
            answers: visibleAnswers
        });

        return submission;
    },

    getSubmissionsByFormId: async (formId: string) => {
        return await Submission.find({ formId }).sort({ createdAt: -1 });
    }
};
