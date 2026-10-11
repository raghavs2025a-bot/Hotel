import { Router } from 'express';
import * as C from '../controllers/room.controller.js';

const router = Router();
router.get('/meta', C.meta);
router.get('/featured', C.featured);
router.get('/testimonials', C.testimonials);
router.get('/', C.list);
router.get('/:id', C.detail);
export default router;
