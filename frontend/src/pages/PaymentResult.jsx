import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, XCircle, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending'); // 'success' | 'failed' | 'cod_success'
  const [orderId, setOrderId] = useState(null);
  const [message, setMessage] = useState('');

  const triggerConfetti = () => {
    // Elegant celebratory confetti burst
    const duration = 2 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#cbd5e1', '#94a3b8', '#3a61f6']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#cbd5e1', '#94a3b8', '#3a61f6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  useEffect(() => {
    const verifyVnpay = async () => {
      // 1. Case: COD success redirection
      if (searchParams.get('method') === 'cod') {
        setStatus('cod_success');
        setLoading(false);
        triggerConfetti();
        return;
      }

      // 2. Case: VNPAY callback verification
      if (searchParams.get('vnp_SecureHash')) {
        try {
          const res = await api.payments.verifyPayment(searchParams.toString());
          if (res.success) {
            setStatus('success');
            setOrderId(res.orderId);
            setMessage(res.message);
            triggerConfetti();
            showToast('Payment successful!', 'success');
          } else {
            setStatus('failed');
            setOrderId(res.orderId);
            setMessage(res.message || 'Payment unsuccessful.');
            showToast('Payment failed.', 'error');
          }
        } catch (error) {
          setStatus('failed');
          setMessage(error.message || 'Transaction digital signature verification failed.');
          showToast('Payment verification error.', 'error');
        } finally {
          setLoading(false);
        }
        return;
      }

      // 3. Fallback: No params, just render simple error or redirect
      setStatus('failed');
      setMessage('No valid transaction information found.');
      setLoading(false);
    };

    verifyVnpay();
  }, [searchParams]);

  if (loading) {
    return (
      <div style={{ padding: '80px 5%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 size={48} className="animate-spin" style={{ color: 'var(--color-primary)', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>Verifying transaction details...</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Please do not close or reload this page.</p>
        
        <style>{`
          .animate-spin {
            animation: spin 1.5s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isSuccess = status === 'success' || status === 'cod_success';

  return (
    <div style={{ maxWidth: '1560px', margin: '0 auto', padding: '60px 24px', display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          maxWidth: '550px',
          width: '100%',
          padding: '40px',
          textAlign: 'center',
          borderRadius: '24px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
        }}
      >
        
        {/* Outcome Icon */}
        <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '24px' }}>
          {isSuccess ? (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-success)',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
            }}>
              <CheckCircle2 size={48} />
            </div>
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-error)',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)'
            }}>
              <XCircle size={48} />
            </div>
          )}
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '16px' }}>
          {isSuccess ? 'Order placed successfully!' : 'Transaction Failed'}
        </h1>

        {/* Message */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
          {status === 'success' && `Thank you for shopping with us! Your order #${orderId} has been successfully paid online via VNPAY gateway and is being prepared for packaging.`}
          {status === 'cod_success' && 'Your order has been received and is being processed. We will contact you soon to confirm the details before shipping via Cash on Delivery.'}
          {status === 'failed' && (message || 'An error occurred during your payment process. Please contact support or try making the payment again.')}
        </p>

        {/* Info panel */}
        {orderId && (
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '32px',
            fontSize: '14px',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Order Code:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>#{orderId}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                {status === 'cod_success' ? 'COD - Cash on Delivery' : 'VNPAY Online Payment'}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isSuccess ? (
            <>
              <Link to="/products" className="btn btn-primary" style={{ padding: '12px', background: 'var(--brand)', color: '#ffffff', border: 'none' }}>
                Continue Shopping
              </Link>
              <Link to="/orders" className="btn btn-secondary" style={{ padding: '12px' }}>
                View My Orders
              </Link>
            </>
          ) : (
            <>
              <Link to="/cart" className="btn btn-primary" style={{ padding: '12px', background: 'var(--brand)', color: '#ffffff', border: 'none' }}>
                Back to Cart to Retry
              </Link>
              <Link to="/" className="btn btn-secondary" style={{ padding: '12px' }}>
                Go to Home
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default PaymentResult;
