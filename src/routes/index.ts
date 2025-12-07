import { Router } from 'express';
import authRoutes from './auth.routes';
import formRoutes from './forms.routes';
import webhookRoutes from './webhooks.routes';
import airtableRoutes from './airtable.routes';
import submissionRoutes from './submissions.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/forms', formRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/airtable', airtableRoutes);
router.use('/submissions', submissionRoutes);

export default router;

