import { Router } from 'express';
import {
  collectPayment, getPayments, getInvoices, getInvoice, downloadInvoicePDF,
} from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireGymStaff, requireGymOwner } from '../middleware/roleGuard.js';
import { injectGymId } from '../middleware/tenantGuard.js';
import { requirePermission } from '../middleware/permissionGuard.js';

const router = Router();
router.use(authenticate, injectGymId, requireGymStaff);

router.get('/', requireGymOwner, getPayments);
router.post('/', requirePermission('collectFees'), collectPayment);
router.get('/invoices', requireGymOwner, getInvoices);
router.get('/invoices/:id', requirePermission('collectFees'), getInvoice);
router.get('/invoices/:id/pdf', requirePermission('collectFees'), downloadInvoicePDF);

export default router;
