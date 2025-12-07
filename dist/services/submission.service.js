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
exports.SubmissionService = void 0;
const form_model_1 = require("../models/form.model");
const submission_model_1 = require("../models/submission.model");
const user_model_1 = require("../models/user.model");
const airtable_service_1 = require("./airtable.service");
const conditionEvaluator_1 = require("../utils/conditionEvaluator");
exports.SubmissionService = {
    submitForm: (formId, answers) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        // 1. Fetch Form
        const form = yield form_model_1.Form.findById(formId);
        if (!form) {
            throw new Error('Form not found');
        }
        // 2. Validate & Evaluate Visibility
        const visibleAnswers = {};
        const airtableFields = {};
        for (const question of form.questions) {
            const isVisible = (0, conditionEvaluator_1.shouldShowQuestion)(question.conditionalRules, answers // We use raw answers for evaluation, even if some answers might be from hidden fields (though technically hidden fields shouldn't have answers, but safety first)
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
        const owner = yield user_model_1.User.findById(form.ownerId);
        if (!owner) {
            throw new Error('Form owner not found');
        }
        // 4. Save to Airtable
        let airtableRecord;
        try {
            airtableRecord = yield airtable_service_1.AirtableService.createRecord(owner, form.airtableBaseId, form.airtableTableId, airtableFields);
        }
        catch (err) {
            console.error('Airtable Error:', ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err);
            throw new Error('Failed to save to Airtable: ' + (((_d = (_c = (_b = err.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.error) === null || _d === void 0 ? void 0 : _d.message) || err.message));
        }
        // 5. Save to MongoDB
        const submission = yield submission_model_1.Submission.create({
            formId: form._id,
            airtableRecordId: airtableRecord.id,
            answers: visibleAnswers
        });
        return submission;
    }),
    getSubmissionsByFormId: (formId) => __awaiter(void 0, void 0, void 0, function* () {
        return yield submission_model_1.Submission.find({ formId }).sort({ createdAt: -1 });
    })
};
