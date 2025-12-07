import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as AirtableController from '../controllers/airtable.controller';

const router = Router();

router.use(authenticate); // Protect all routes in this file

// /api/airtable/bases
router.get('/bases', AirtableController.getBases);

// /api/airtable/bases/:baseId/tables
router.get('/bases/:baseId/tables', AirtableController.getTables);

// /api/airtable/bases/:baseId/tables/:tableId/fields
router.get('/bases/:baseId/tables/:tableId/fields', AirtableController.getFields);

export default router;
