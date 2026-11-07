import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateToken, isAdmin, analyticsController.getDashboard);

export default router;
