import { Router } from 'express';
import {
  getMembers, checkMobile, getMember, createMemberWithMembership,
  updateMember, updateMemberStatus, renewMembership, assignTrainer,
  getExpiryRemindersList, getMembersWithDues, getMembershipHistory, deleteMember,
} from '../controllers/member.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireGymStaff, requireGymOwner } from '../middleware/roleGuard.js';
import { injectGymId } from '../middleware/tenantGuard.js';
import { requirePermission } from '../middleware/permissionGuard.js';

const router = Router();
router.use(authenticate, injectGymId, requireGymStaff);

router.get('/', getMembers);
router.get('/dues', requireGymOwner, getMembersWithDues);
router.get('/expiry-reminders', requireGymOwner, getExpiryRemindersList);
router.get('/check-mobile/:mobile', requirePermission('addMember', 'renewMembership'), checkMobile);
router.get('/:id', getMember);
router.post('/', requirePermission('addMember'), createMemberWithMembership);
router.put('/:id', requireGymOwner, updateMember);
router.delete('/:id', requireGymOwner, deleteMember);
router.put('/:id/status', requireGymOwner, updateMemberStatus);
router.post('/:id/renew', requirePermission('renewMembership'), renewMembership);
router.put('/:id/assign-trainer', requireGymOwner, assignTrainer);
router.get('/:memberId/history', getMembershipHistory);

export default router;
