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
exports.getFormSubmissions = exports.submitForm = void 0;
const submission_service_1 = require("../services/submission.service");
const response_1 = require("../utils/response");
const submitForm = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { formId } = req.params;
        const { answers } = req.body;
        if (!answers) {
            return res.status(400).json({ success: false, message: 'Answers are required' });
        }
        const submission = yield submission_service_1.SubmissionService.submitForm(formId, answers);
        (0, response_1.sendResponse)(res, 201, true, submission, 'Form submitted successfully');
    }
    catch (error) {
        // If validation error, return 400
        if (error.message.includes('required') || error.message.includes('found')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
});
exports.submitForm = submitForm;
const getFormSubmissions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { formId } = req.params;
        const submissions = yield submission_service_1.SubmissionService.getSubmissionsByFormId(formId);
        (0, response_1.sendResponse)(res, 200, true, submissions);
    }
    catch (error) {
        next(error);
    }
});
exports.getFormSubmissions = getFormSubmissions;
