import { Router } from 'express';
import { reviewController } from '../controllers/reviewController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/', authenticateToken, reviewController.addReview);
router.delete('/:id', authenticateToken, reviewController.deleteReview);

export default router;

