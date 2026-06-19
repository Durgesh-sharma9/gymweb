import { Router } from 'express';
import { signup, verifyEmail, resendVerification } from '../controllers/signup.controller.js';

const router = Router();

router.post('/signup', signup);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;
