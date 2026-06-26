import { Router } from 'express';
import {
  submitRegistration, getPublicGym,
} from '../controllers/registration.controller.js';
import { getPublicInvoice, downloadPublicInvoicePDF } from '../controllers/payment.controller.js';
import { getActivePlatformPlans } from '../controllers/superAdmin.controller.js';

const router = Router();

router.get('/plans', getActivePlatformPlans);
router.get('/gyms/:gymSlug', getPublicGym);
router.post('/register/:gymSlug', submitRegistration);
router.get('/invoices/:token', getPublicInvoice);
router.get('/invoices/:token/pdf', downloadPublicInvoicePDF);

export default router;
