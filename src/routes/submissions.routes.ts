import { Router } from 'express';
import { submitForm } from '../controllers/submissions.controller';

const router = Router();

// Public route for form submission
router.post('/:formId', submitForm);

export default router;
