import { Router } from 'express';
import { productController } from '../controllers/productController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', authenticateToken, isAdmin, productController.create);
router.put('/:id', authenticateToken, isAdmin, productController.update);
router.delete('/:id', authenticateToken, isAdmin, productController.delete);

export default router;
