export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  GYM_OWNER: 'gym_owner',
  TRAINER: 'trainer',
};

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const MEMBER_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  INACTIVE: 'inactive',
};

export const PAYMENT_METHODS = ['cash', 'upi', 'bank_transfer', 'card'];

export const EXPENSE_CATEGORIES = [
  'rent',
  'electricity',
  'water',
  'equipment',
  'trainer_salary',
  'other',
];

export const RECEIPT_TEMPLATES = ['professional_white', 'modern_blue', 'premium_gold'];

export const DEFAULT_TRAINER_PERMISSIONS = {
  addMember: false,
  renewMembership: false,
  viewAssignedMembers: true,
  collectFees: false,
};

export const ACTIVITY_ACTIONS = {
  MEMBER_ADDED: 'member_added',
  MEMBER_UPDATED: 'member_updated',
  MEMBER_INACTIVE: 'member_inactivated',
  MEMBER_REACTIVATED: 'member_reactivated',
  MEMBERSHIP_CREATED: 'membership_created',
  MEMBERSHIP_RENEWED: 'membership_renewed',
  FEE_COLLECTED: 'fee_collected',
  ATTENDANCE_CHECKIN: 'attendance_checkin',
  ATTENDANCE_CHECKOUT: 'attendance_checkout',
  TRAINER_ADDED: 'trainer_added',
  TRAINER_UPDATED: 'trainer_updated',
  EXPENSE_ADDED: 'expense_added',
  REGISTRATION_APPROVED: 'registration_approved',
};
