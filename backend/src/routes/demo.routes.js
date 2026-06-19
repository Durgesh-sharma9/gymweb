import { Router } from 'express';
import { bookDemo, getDemoRequests, updateDemoStatus } from '../controllers/demo.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/demo-request', bookDemo);
router.get('/demo-request', authenticate, getDemoRequests);
router.patch('/demo-request/:id', authenticate, updateDemoStatus);

export default router;
