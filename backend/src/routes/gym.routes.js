import { Router } from 'express';
import { getOwnerDashboard } from '../controllers/dashboard.controller.js';
import { getTrainerDashboard } from '../controllers/trainer.controller.js';
import {
  getSettings, updateGeneral, updateTax, updateDiscount,
  updateReceipt, updateWhatsapp, getRegistrationLink,
} from '../controllers/settings.controller.js';
import { createSubscriptionRequest, getGymDetails, getGymLimits, getGymSubscriptionRequests } from '../controllers/superAdmin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireGymOwner, requireGymStaff } from '../middleware/roleGuard.js';
import { injectGymId } from '../middleware/tenantGuard.js';

const router = Router();
router.use(authenticate, injectGymId);

router.get('/dashboard', requireGymOwner, getOwnerDashboard);
router.get('/trainer/dashboard', requireGymStaff, getTrainerDashboard);

router.get('/settings', requireGymOwner, getSettings);
router.put('/settings/general', requireGymOwner, updateGeneral);
router.put('/settings/tax', requireGymOwner, updateTax);
router.put('/settings/discount', requireGymOwner, updateDiscount);
router.put('/settings/receipt', requireGymOwner, updateReceipt);
router.put('/settings/whatsapp', requireGymOwner, updateWhatsapp);
router.get('/settings/registration-link', requireGymOwner, getRegistrationLink);

router.post('/subscription-request', requireGymOwner, createSubscriptionRequest);
router.get('/subscription-requests', requireGymOwner, getGymSubscriptionRequests);
router.get('/details', requireGymOwner, getGymDetails);
router.get('/limits', requireGymOwner, getGymLimits);

export default router;
