import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as FormsController from '../controllers/forms.controller';
import { getFormSubmissions } from '../controllers/submissions.controller';

const router = Router();

// Create Form - Protected
router.post('/', authenticate, FormsController.createForm);

// Get Form - Public (for viewer)
router.get('/:id', FormsController.getForm);

// Get Form Responses - Protected
router.get('/:formId/responses', authenticate, getFormSubmissions);

// Get My Forms - Protected
router.get('/', authenticate, FormsController.getMyForms);

export default router;
