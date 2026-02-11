import { Router } from 'express';
import { getProfile, updateProfile, subscribeToPush } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { changePassword, logout } from '../controllers/authController.js';
import { getDailyReports, getLatestReport } from '../controllers/reportController.js';
const router = Router();
// Protect all user routes
router.use(authMiddleware);
router.get('/profile', getProfile);
router.post('/profile', updateProfile);
router.post('/subscribe', subscribeToPush);
router.post('/change-password', changePassword);
router.post('/logout', logout);
router.get('/reports', getDailyReports);
router.get('/reports/latest', getLatestReport);
export default router;
