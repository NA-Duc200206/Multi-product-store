import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticateToken, authController.getProfile);
router.put('/cart', authenticateToken, authController.syncCart);

export default router;
