import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/create-payment-url/:id', authenticateToken, paymentController.createPaymentUrl);
router.get('/verify-payment', paymentController.verifyPayment);
router.get('/vnpay_ipn', paymentController.vnpayIpn);

export default router;
