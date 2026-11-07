import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Package, Calendar, Clock, CreditCard, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.orders.getMyOrders();
        setOrders(res.orders || []);
      } catch (err) {
        showToast(err.message || 'Failed to load orders.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge badge-warning">Pending</span>;
      case 'paid': return <span className="badge badge-success">Paid</span>;
      case 'shipping': return <span className="badge badge-primary">Shipping</span>;
      case 'completed': return <span className="badge badge-success">Completed</span>;
      case 'cancelled': return <span className="badge badge-error">Cancelled</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const handlePayNow = async (orderId) => {
    try {
      showToast('Creating payment link...', 'info');
      const res = await api.payments.createPaymentUrl(orderId);
      window.location.href = res.paymentUrl;
    } catch (err) {
      showToast(err.message || 'Failed to create payment portal.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 5%', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: '80px 5%', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--glass-border)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '24px'
        }}>
          <Package size={36} />
        </div>
        <h2 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '12px' }}>You have no orders yet</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
          Your order history will appear here once you make a purchase.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ padding: '12px 28px' }}>
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 5%' }}>
      <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '32px' }}>My Orders</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {orders.map((order) => (
          <div key={order.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>Order #{order.id}</span>
                {getStatusBadge(order.status)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Calendar size={14} />
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </div>

            {/* Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img 
                    src={item.product?.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800'} 
                    alt={item.product?.name} 
                    style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.product?.name}</h4>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <span>Quantity: {item.quantity}</span>
                      {item.color && <span>• Color: {item.color}</span>}
                      {item.size && <span>• Size: {item.size}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Footer Summary info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '8px' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={14} />
                <span>Payment: {order.paymentMethod === 'vnpay' ? 'VNPAY Online' : 'COD (Cash on Delivery)'}</span>
                <span>({order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Payment: </span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-secondary)' }}>{formatCurrency(order.totalAmount)}</span>
                </div>
                {order.paymentMethod === 'vnpay' && order.paymentStatus === 'pending' && order.status === 'pending' && (
                  <button 
                    onClick={() => handlePayNow(order.id)}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
