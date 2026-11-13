import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { subscribeToEvent } from '../services/socket';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Eye, Calendar, MapPin, CreditCard } from 'lucide-react';

const AdminOrders = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      showToast('Access denied.', 'error');
      navigate('/');
      return;
    }
    loadOrders();

    const unsubCreated = subscribeToEvent('order:created', (newOrder) => {
      showToast(`⚡ New order received: #${String(newOrder.id || newOrder._id).slice(-6)}!`, 'info');
      loadOrders();
    });

    const unsubUpdated = subscribeToEvent('order:updated', () => {
      loadOrders();
    });

    const unsubCancelled = subscribeToEvent('order:cancelled', (ord) => {
      showToast(`Order #${String(ord.id || ord._id).slice(-6)} was cancelled.`, 'warning');
      loadOrders();
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubCancelled();
    };
  }, [isAdmin]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.orders.getAll();
      setOrders(res.orders || []);
    } catch (err) {
      showToast(err.message || 'Failed to load orders.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      let paymentStatus = undefined;
      // Auto transition payment status
      if (newStatus === 'completed' || newStatus === 'shipping') {
        paymentStatus = 'paid';
      }
      
      await api.orders.updateStatus(orderId, newStatus, paymentStatus);
      showToast(`Order #${orderId} updated successfully!`, 'success');
      loadOrders();
    } catch (err) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    try {
      await api.orders.updateStatus(orderId, undefined, newPaymentStatus);
      showToast(`Order #${orderId} payment status updated successfully!`, 'success');
      loadOrders();
    } catch (err) {
      showToast(err.message || 'Failed to update payment status.', 'error');
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'paid': return 'badge-success';
      case 'shipping': return 'badge-primary';
      case 'completed': return 'badge-success';
      case 'cancelled': return 'badge-error';
      default: return '';
    }
  };

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <div style={{ padding: '40px 5%' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px' }}>
          <ChevronLeft size={14} /> Back to Dashboard
        </Link>
        <h1 style={{ fontSize: '32px', color: 'var(--text-primary)' }}>Manage Orders</h1>
      </div>

      {/* Orders Container */}
      <div className="glass-container" style={{ padding: '24px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No orders found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map(order => (
              <div 
                key={order.id} 
                className="glass-card" 
                style={{ 
                  padding: '20px', 
                  borderLeft: `4px solid ${order.status === 'cancelled' ? 'var(--color-error)' : order.status === 'completed' ? 'var(--color-success)' : 'var(--color-primary)'}`,
                  transition: 'var(--transition-smooth)'
                }}
              >
                {/* Summary Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>Order #{order.id}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer: {order.user?.name} ({order.user?.email})</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Total</span>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-secondary)' }}>{formatVND(order.totalAmount)}</span>
                    </div>

                    {/* Status Update Select */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`badge ${getStatusClass(order.status)}`}
                        style={{ border: 'none', padding: '6px 10px', fontSize: '11px', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipping">Shipping</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => toggleExpandOrder(order.id)}
                      className="btn btn-secondary"
                      style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px' }}
                    >
                      {expandedOrderId === order.id ? 'Collapse' : 'View Details'}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Panel */}
                {expandedOrderId === order.id && (
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px dashed rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* Meta info columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', fontSize: '13px' }}>
                      {/* Date & Address */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                          <Calendar size={14} /> <span>Date: {formatDate(order.createdAt)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-secondary)' }}>
                          <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} /> 
                          <span>Address: {order.shippingAddress}</span>
                        </div>
                      </div>

                      {/* Payment info */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                          <CreditCard size={14} /> 
                          <span>Method: {order.paymentMethod === 'vnpay' ? 'VNPAY Online Payment' : 'Cash on Delivery (COD)'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>Payment:</span>
                          <select
                            value={order.paymentStatus}
                            onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                            className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}
                            style={{ border: 'none', padding: '4px 8px', fontSize: '10px', cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="pending">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                        {order.vnpayTxnRef && (
                          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>VNPAY TxnRef: {order.vnpayTxnRef}</div>
                        )}
                      </div>
                    </div>

                    {/* Items table */}
                    <div>
                      <h4 style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '10px' }}>Ordered Items:</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px' }}>
                            <img src={item.product?.image} alt={item.product?.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{item.product?.name}</span>
                              <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                <span>Quantity: {item.quantity}</span>
                                {item.color && <span>• Color: {item.color}</span>}
                                {item.size && <span>• Size: {item.size}</span>}
                              </div>
                            </div>
                            <span style={{ fontWeight: '600' }}>{formatVND(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
