import { Router } from 'express';
import { submitContact, getContacts, updateContactStatus } from '../controllers/contact.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/contact', submitContact);
router.get('/contact', authenticate, getContacts);
router.patch('/contact/:id', authenticate, updateContactStatus);

export default router;
