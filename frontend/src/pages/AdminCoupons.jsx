import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Ticket, Plus, Trash2, Calendar, Tag, Check, Copy } from 'lucide-react';

const AdminCoupons = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Coupon Form state
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: '',
    usageLimit: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!isAdmin) {
      showToast('Access denied. Administrator privileges required.', 'error');
      navigate('/');
      return;
    }
    loadCoupons();
  }, [isAdmin]);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.coupons.getAll();
      setCoupons(res.coupons || []);
    } catch (err) {
      showToast(err.message || 'Failed to load coupons.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      showToast('Coupon code is required.', 'warning');
      return;
    }
    if (formData.discountValue <= 0) {
      showToast('Discount value must be greater than zero.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await api.coupons.create({
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        minOrderAmount: Number(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        usageLimit: Number(formData.usageLimit) || 100,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate + 'T23:59:59')
      });
      showToast(`Coupon ${formData.code.toUpperCase()} created successfully!`, 'success');
      setShowModal(false);
      setFormData({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscountAmount: '',
        usageLimit: 100,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      loadCoupons();
    } catch (err) {
      showToast(err.message || 'Failed to create coupon.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon ${code}?`)) return;
    try {
      await api.coupons.delete(id);
      showToast(`Coupon ${code} removed.`, 'success');
      loadCoupons();
    } catch (err) {
      showToast(err.message || 'Failed to delete coupon.', 'error');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Copied ${code} to clipboard!`, 'info');
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div style={{ padding: '40px 5%' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link 
          to="/admin" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            textDecoration: 'none', 
            color: 'var(--text-secondary)', 
            marginBottom: '16px', 
            fontWeight: '600' 
          }}
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Ticket size={28} color="var(--color-primary)" /> Discount Coupons & Vouchers
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Create and manage promotional discount vouchers for checkout campaigns.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)} 
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontSize: '14px' }}
          >
            <Plus size={16} /> Create New Coupon
          </button>
        </div>
      </div>

      {/* Coupons Grid / Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Ticket size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>No discount coupons created yet.</p>
          <button 
            onClick={() => setShowModal(true)} 
            className="btn btn-secondary" 
            style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={15} /> Create your first coupon
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {coupons.map((c) => {
            const now = new Date();
            const isExpired = new Date(c.endDate) < now;
            const isExhausted = c.usedCount >= c.usageLimit;
            const isActive = !isExpired && !isExhausted;

            return (
              <div 
                key={c.id || c._id} 
                className="glass-card" 
                style={{ 
                  padding: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  border: isActive ? '1px solid var(--glass-border)' : '1px solid rgba(239, 68, 68, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Status indicator bar */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: isActive ? 'var(--color-primary)' : '#ef4444'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: '18px', 
                      fontWeight: '800', 
                      letterSpacing: '0.05em', 
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                      background: 'var(--input-bg)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--glass-border)'
                    }}>
                      {c.code}
                    </span>
                    <button 
                      onClick={() => copyCode(c.code)} 
                      title="Copy code"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '100px',
                    textTransform: 'uppercase',
                    background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: isActive ? '#10b981' : '#ef4444',
                    border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                  }}>
                    {isActive ? 'Active' : isExpired ? 'Expired' : 'Exhausted'}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {c.description || 'Special store discount'}
                </div>

                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Discount:</span>
                    <strong style={{ color: 'var(--color-secondary)' }}>
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `-${formatVND(c.discountValue)}`}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Min Order:</span>
                    <span>{formatVND(c.minOrderAmount)}</span>
                  </div>
                  {c.maxDiscountAmount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Max Discount:</span>
                      <span>{formatVND(c.maxDiscountAmount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Usage:</span>
                    <span>{c.usedCount || 0} / {c.usageLimit}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <span>Valid until:</span>
                    <span>{new Date(c.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleDeleteCoupon(c.id || c._id, c.code)} 
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      fontSize: '12px',
                      cursor: 'pointer',
                      padding: '4px 8px'
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Coupon Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '520px', width: '100%', padding: '32px', borderRadius: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Create New Discount Voucher
            </h3>

            <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Coupon Code (e.g. VIP20, FREESHIP) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="WELCOME10"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Description / Note
                </label>
                <input
                  type="text"
                  placeholder="10% discount for first orders"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Type
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (VND)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Min Order Amount (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Max Discount (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Usage Limit (Count)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--glass-border)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', borderRadius: '8px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ padding: '10px 24px', borderRadius: '8px' }}
                >
                  {submitting ? 'Creating...' : 'Create Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;

