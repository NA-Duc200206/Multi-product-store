import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again in 15 minutes.' }
});

router.post('/login', authLimiter, authController.login);
router.post('/register', authLimiter, authController.register);
router.get('/me', authenticateToken, authController.getProfile);
router.put('/me', authenticateToken, authController.updateProfile);
router.put('/password', authLimiter, authenticateToken, authController.changePassword);
router.put('/cart', authenticateToken, authController.syncCart);

// Admin User Management
router.get('/users', authenticateToken, isAdmin, authController.getAllUsers);
router.put('/users/:id/role', authenticateToken, isAdmin, authController.updateUserRole);

export default router;
