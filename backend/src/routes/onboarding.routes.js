import { Router } from 'express';
import { getOnboardingStatus, completeOnboardingStep, skipOnboarding } from '../controllers/onboarding.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/onboarding/status', authenticate, getOnboardingStatus);
router.post('/onboarding/step/:step', authenticate, completeOnboardingStep);
router.post('/onboarding/skip', authenticate, skipOnboarding);

export default router;
