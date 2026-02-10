import { Router } from 'express';
import { getProfile, updateProfile, subscribeToPush } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.post('/profile', authMiddleware, updateProfile);
router.post('/subscribe', authMiddleware, subscribeToPush);

export default router;
