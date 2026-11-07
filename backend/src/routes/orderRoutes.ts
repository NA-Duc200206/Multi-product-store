import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, orderController.create);
router.get('/my-orders', authenticateToken, orderController.getMyOrders);
router.get('/:id', authenticateToken, orderController.getById);
router.get('/', authenticateToken, isAdmin, orderController.getAll);
router.put('/:id/status', authenticateToken, isAdmin, orderController.updateStatus);

export default router;
