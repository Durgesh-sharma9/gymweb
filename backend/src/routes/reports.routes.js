import { Router } from 'express';
import {
  getRevenueReport, getAttendanceReport, getMemberReport,
} from '../controllers/reports.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireGymOwner } from '../middleware/roleGuard.js';
import { injectGymId } from '../middleware/tenantGuard.js';

const router = Router();
router.use(authenticate, injectGymId, requireGymOwner);

router.get('/revenue', getRevenueReport);
router.get('/attendance', getAttendanceReport);
router.get('/members', getMemberReport);

export default router;
