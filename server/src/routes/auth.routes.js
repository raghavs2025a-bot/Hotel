import { Router } from 'express';
import * as C from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();
router.post('/register', authLimiter, C.register);
router.post('/login', authLimiter, C.login);
router.post('/logout', C.logout);
router.get('/me', authenticate, C.me);
router.put('/profile', authenticate, C.updateProfile);
router.put('/password', authenticate, authLimiter, C.changePassword);
export default router;
