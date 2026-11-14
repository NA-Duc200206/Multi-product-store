import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticateToken, authController.getProfile);
router.put('/me', authenticateToken, authController.updateProfile);
router.put('/cart', authenticateToken, authController.syncCart);

// Admin User Management
router.get('/users', authenticateToken, isAdmin, authController.getAllUsers);
router.put('/users/:id/role', authenticateToken, isAdmin, authController.updateUserRole);

export default router;
