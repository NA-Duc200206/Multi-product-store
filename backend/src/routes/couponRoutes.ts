import { Router } from 'express';
import { couponController } from '../controllers/couponController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

// Public / Authenticated check
router.get('/active', couponController.getActiveCoupons);
router.post('/validate', authenticateToken, couponController.validateCoupon);

// Admin CRUD
router.get('/', authenticateToken, isAdmin, couponController.getAll);
router.post('/', authenticateToken, isAdmin, couponController.create);
router.put('/:id', authenticateToken, isAdmin, couponController.update);
router.delete('/:id', authenticateToken, isAdmin, couponController.delete);

export default router;

