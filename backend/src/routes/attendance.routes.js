import { Router } from 'express';
import {
  checkIn, checkOut, getTodayAttendance, getAttendanceHistory,
} from '../controllers/attendance.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireGymStaff } from '../middleware/roleGuard.js';
import { injectGymId } from '../middleware/tenantGuard.js';

const router = Router();
router.use(authenticate, injectGymId, requireGymStaff);

router.get('/today', getTodayAttendance);
router.get('/history', getAttendanceHistory);
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

export default router;
