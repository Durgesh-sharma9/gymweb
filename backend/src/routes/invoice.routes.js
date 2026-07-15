import { Router } from 'express';
import { getInvoices, getInvoice, downloadInvoicePDF } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireGymOwner, requireGymStaff } from '../middleware/roleGuard.js';
import { injectGymId } from '../middleware/tenantGuard.js';
import { requirePermission } from '../middleware/permissionGuard.js';

const router = Router();
router.use(authenticate, injectGymId, requireGymStaff);

router.get('/', requireGymOwner, getInvoices);
router.get('/:id', requirePermission('collectFees'), getInvoice);
router.get('/:id/pdf', requirePermission('collectFees'), downloadInvoicePDF);

export default router;
