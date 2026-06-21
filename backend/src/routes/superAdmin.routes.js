import { Router } from 'express';
import {
  getDashboard, getGymOwners, createGymOwner, updateGymOwner,
  getGyms, updateGymStatus, getGymDetails, getPlatformPlans, createPlatformPlan,
  updatePlatformPlan, getAnalytics, getSubscriptionRequests,
  approveSubscriptionRequest, rejectSubscriptionRequest, getRevenue,
} from '../controllers/superAdmin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/roleGuard.js';

const router = Router();
router.use(authenticate, requireSuperAdmin);

router.get('/dashboard', getDashboard);
router.get('/gym-owners', getGymOwners);
router.post('/gym-owners', createGymOwner);
router.put('/gym-owners/:id', updateGymOwner);
router.get('/gyms', getGyms);
router.get('/gyms/:id', getGymDetails);
router.put('/gyms/:id/status', updateGymStatus);
router.get('/plans', getPlatformPlans);
router.post('/plans', createPlatformPlan);
router.put('/plans/:id', updatePlatformPlan);
router.get('/analytics', getAnalytics);
router.get('/subscription-requests', getSubscriptionRequests);
router.put('/subscription-requests/:id/approve', approveSubscriptionRequest);
router.put('/subscription-requests/:id/reject', rejectSubscriptionRequest);
router.get('/revenue', getRevenue);

export default router;
