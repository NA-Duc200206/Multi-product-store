import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', categoryController.getAll);
router.post('/', authenticateToken, isAdmin, categoryController.create);
router.put('/:id', authenticateToken, isAdmin, categoryController.update);
router.delete('/:id', authenticateToken, isAdmin, categoryController.delete);

export default router;
