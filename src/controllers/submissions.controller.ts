import { Request, Response, NextFunction } from 'express';
import { SubmissionService } from '../services/submission.service';
import { sendResponse } from '../utils/response';

export const submitForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { formId } = req.params;
        const { answers } = req.body;

        if (!answers) {
            return res.status(400).json({ success: false, message: 'Answers are required' });
        }

        const submission = await SubmissionService.submitForm(formId, answers);

        sendResponse(res, 201, true, submission, 'Form submitted successfully');
    } catch (error: any) {
        // If validation error, return 400
        if (error.message.includes('required') || error.message.includes('found')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

export const getFormSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { formId } = req.params;
        const submissions = await SubmissionService.getSubmissionsByFormId(formId);
        sendResponse(res, 200, true, submissions);
    } catch (error) {
        next(error);
    }
};
