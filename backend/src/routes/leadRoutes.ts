import { Router } from 'express';
import {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  exportLeadsCSV,
} from '../controllers/leadController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createLeadSchema, updateLeadSchema, leadQuerySchema } from '../validators/index.js';

const router = Router();

router.use(authenticate);

router.get('/export/csv', exportLeadsCSV);

router.post('/', validate(createLeadSchema), createLead);
router.get('/', validate(leadQuerySchema, 'query'), getLeads);
router.get('/:id', getLeadById);
router.put('/:id', validate(updateLeadSchema), updateLead);
router.delete('/:id', deleteLead);

export default router;
