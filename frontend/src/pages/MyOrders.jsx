import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { subscribeToEvent } from '../services/socket';
import { useToast } from '../context/ToastContext';
import { formatVND, getSafeImageUrl, handleImageError } from '../utils/formatters';
import { Package, Calendar, CreditCard, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ORDER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing', statuses: ['confirmed', 'packaging', 'paid'] },
  { key: 'shipping', label: 'Shipped', statuses: ['shipping'] },
  { key: 'delivered', label: 'Delivered', statuses: ['delivered', 'completed'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['cancelled', 'refund_requested', 'refund_completed'] },
];

const MyOrders = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

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

    // Subscribe to live status updates
    const unsubscribeUpdate = subscribeToEvent('order:updated', (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === updatedOrder.id || o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o))
      );
      showToast(
        `Order #${String(updatedOrder.id || updatedOrder._id).slice(-6)} status updated to ${updatedOrder.status}.`,
        'info'
      );
    });

    return () => {
      unsubscribeUpdate();
    };
  }, [showToast]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    const tab = ORDER_TABS.find((t) => t.key === activeTab);
    if (!tab) return orders;
    const matchStatuses = tab.statuses || [tab.key];
    return orders.filter((order) => matchStatuses.includes(order.status));
  }, [orders, activeTab]);

  const tabCounts = useMemo(() => {
    const counts = { all: orders.length };
    for (const tab of ORDER_TABS) {
      if (tab.key === 'all') continue;
      const matchStatuses = tab.statuses || [tab.key];
      counts[tab.key] = orders.filter((o) => matchStatuses.includes(o.status)).length;
    }
    return counts;
  }, [orders]);

  const formatCurrency = formatVND;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'confirmed':
      case 'packaging':
      case 'paid':
        return <span className="badge badge-secondary">Processing</span>;
      case 'shipping':
        return <span className="badge badge-primary">Shipped</span>;
      case 'delivered':
      case 'completed':
        return <span className="badge badge-success">Delivered</span>;
      case 'cancelled':
      case 'refund_requested':
      case 'refund_completed':
        return <span className="badge badge-error">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
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

  const handleConfirmCancelOrder = async (orderId) => {
    setCancellingId(orderId);
    try {
      await api.orders.cancelOrder(orderId);
      showToast('Order cancelled successfully.', 'success');
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
      setConfirmCancelId(null);
    } catch (err) {
      showToast(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="orders-page-container" style={{ textAlign: 'center', paddingTop: '60px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page-container" style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--brand)',
            marginBottom: '24px',
          }}
        >
          <Package size={36} />
        </div>
        <h2 style={{ fontSize: '24px', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: '700' }}>
          You have no orders yet
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
          Your order history will appear here once you make a purchase.
        </p>
        <Link
          to="/products"
          className="btn btn-primary"
          style={{
            padding: '12px 28px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--brand)',
            color: '#ffffff',
            border: 'none',
          }}
        >
          <ShoppingBag size={16} /> Shop Now
        </Link>
        <style>{`
          .orders-page-container {
            max-width: 1560px;
            margin: 0 auto;
            padding: 36px 48px 72px;
          }
          @media (max-width: 1024px) {
            .orders-page-container { padding: 28px 28px 56px; }
          }
          @media (max-width: 640px) {
            .orders-page-container { padding: 20px 16px 48px; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            My Orders
          </h1>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>
            {orders.length} total orders
          </span>
        </div>

        {/* Status Filter Tabs */}
        <div className="orders-tabs" role="tablist" aria-label="Filter orders by status">
          {ORDER_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = tabCounts[tab.key] || 0;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tab.key);
                  setConfirmCancelId(null);
                }}
                className={`orders-tab-btn ${isActive ? 'active' : ''}`}
              >
                <span>{tab.label}</span>
                <span className="orders-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Filtered Empty State */}
        {filteredOrders.length === 0 ? (
          <div
            className="orders-surface"
            style={{ padding: '48px 24px', borderRadius: '18px', textAlign: 'center', marginTop: '20px' }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginBottom: '12px' }}>
              No orders found in this status.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '8px 18px' }}
            >
              Show All Orders
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
            {filteredOrders.map((order) => {
              const isConfirmingCancel = confirmCancelId === order.id;
              const isCancelling = cancellingId === order.id;
              return (
                <div
                  key={order.id}
                  className="orders-surface"
                  style={{
                    padding: '24px',
                    borderRadius: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Header info */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      borderBottom: '1px solid var(--glass-border)',
                      paddingBottom: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-primary)' }}>
                        Order #{order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <Calendar size={14} />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <img
                          src={getSafeImageUrl(item.product?.image)}
                          onError={handleImageError}
                          alt={item.product?.name || 'Product'}
                          style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '10px',
                            objectFit: 'cover',
                            border: '1px solid var(--glass-border)',
                            background: 'var(--bg-elevated)',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4
                            style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                              marginBottom: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.product?.name}
                          </h4>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <span>Quantity: {item.quantity}</span>
                            {item.color && <span>• Color: {item.color}</span>}
                            {item.size && <span>• Size: {item.size}</span>}
                          </div>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer Summary info */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                      borderTop: '1px solid var(--glass-border)',
                      paddingTop: '16px',
                      marginTop: '4px',
                    }}
                  >
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={14} />
                      <span>Payment: {order.paymentMethod === 'vnpay' ? 'VNPAY Online' : 'COD (Cash on Delivery)'}</span>
                      <span>({order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Total Payment: </span>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--brand)' }}>
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>

                      {order.paymentMethod === 'vnpay' && order.paymentStatus === 'pending' && order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handlePayNow(order.id)}
                          className="btn btn-primary"
                          style={{
                            padding: '8px 16px',
                            fontSize: '12px',
                            background: 'var(--brand)',
                            color: '#ffffff',
                            border: 'none',
                          }}
                        >
                          Pay Now
                        </button>
                      )}

                      {order.status === 'pending' && !isConfirmingCancel && (
                        <button
                          type="button"
                          onClick={() => setConfirmCancelId(order.id)}
                          className="btn btn-secondary"
                          style={{
                            padding: '8px 16px',
                            fontSize: '12px',
                            color: '#ef4444',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                          }}
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Cancel Confirmation */}
                  {isConfirmingCancel && (
                    <div
                      role="alert"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.28)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '13px', fontWeight: '600' }}>
                        <AlertTriangle size={16} />
                        <span>Are you sure you want to cancel Order #{order.id}?</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setConfirmCancelId(null)}
                          disabled={isCancelling}
                          className="btn btn-secondary"
                          style={{ padding: '6px 14px', fontSize: '12px' }}
                        >
                          Keep Order
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmCancelOrder(order.id)}
                          disabled={isCancelling}
                          className="btn"
                          style={{
                            padding: '6px 14px',
                            fontSize: '12px',
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: '700',
                          }}
                        >
                          {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .orders-page-container {
          max-width: 1560px;
          margin: 0 auto;
          padding: 36px 48px 72px;
        }

        .orders-surface {
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
        }

        .orders-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding-bottom: 4px;
        }

        .orders-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .orders-tab-btn:hover {
          border-color: rgba(36, 84, 244, 0.35);
          color: var(--text-primary);
        }

        .orders-tab-btn.active {
          background: var(--brand);
          border-color: var(--brand);
          color: #ffffff;
        }

        .orders-tab-count {
          font-size: 11px;
          padding: 1px 7px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.14);
        }

        .orders-tab-btn:not(.active) .orders-tab-count {
          background: var(--bg-elevated);
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .orders-page-container { padding: 28px 28px 56px; }
        }

        @media (max-width: 640px) {
          .orders-page-container { padding: 20px 16px 48px; }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;
