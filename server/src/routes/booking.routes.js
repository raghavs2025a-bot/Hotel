import { Router } from 'express';
import * as C from '../controllers/booking.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.post('/quote', C.quote);
router.post('/', authenticate, C.create);
router.get('/my', authenticate, C.mine);
router.get('/:id', authenticate, C.detail);
router.post('/:id/cancel', authenticate, C.cancel);
export default router;
