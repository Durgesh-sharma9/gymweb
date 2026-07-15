import { Router } from 'express';
import { getAnnouncements, createAnnouncement, getActivityLogs } from '../controllers/announcement.controller.js';
import { generateMessage, previewPricing, backupGymData } from '../controllers/utility.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireGymOwner, requireGymStaff } from '../middleware/roleGuard.js';
import { injectGymId } from '../middleware/tenantGuard.js';
import { requirePermission } from '../middleware/permissionGuard.js';

const router = Router();

router.get('/announcements', authenticate, injectGymId, requireGymOwner, getAnnouncements);
router.post('/announcements', authenticate, injectGymId, requireGymOwner, createAnnouncement);
router.get('/activity-logs', authenticate, injectGymId, requireGymOwner, getActivityLogs);
router.get('/whatsapp', authenticate, injectGymId, requireGymStaff, requirePermission('collectFees'), generateMessage);
router.post('/pricing/preview', authenticate, injectGymId, requireGymStaff, previewPricing);
router.get('/backup', authenticate, injectGymId, requireGymOwner, backupGymData);

export default router;
