import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Trash2, ShoppingBag, Plus, Minus, CreditCard, Truck, Tag, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Checkout states
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provinceCity, setProvinceCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'vnpay'
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutFeedback, setCheckoutFeedback] = useState(null);

  // Promo Code states
  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState(null);

  const subtotal = getCartTotal();
  // Free shipping on orders over 1,000,000 VND, otherwise 30,000 VND
  const shippingFee = subtotal > 1000000 ? 0 : 30000;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleApplyPromoCode = async (e) => {
    e.preventDefault();
    setCouponFeedback(null);
    if (!promoCode.trim()) {
      setCouponFeedback({ type: 'error', message: 'Please enter a coupon code.' });
      return;
    }

    setValidatingCoupon(true);
    try {
      const res = await api.coupons.validate(promoCode.trim(), subtotal);
      setDiscountAmount(res.discountAmount);
      setAppliedCode(res.code);
      setCouponFeedback({ type: 'success', message: `Coupon "${res.code}" applied (-${formatCurrency(res.discountAmount)}).` });
    } catch (err) {
      // Fallback promo codes
      const cleanCode = promoCode.trim().toUpperCase();
      if (cleanCode === 'UCONEXT' || cleanCode === 'GLOW10' || cleanCode === 'SALE10') {
        const disc = Math.round(subtotal * 0.1);
        setDiscountAmount(disc);
        setAppliedCode(cleanCode);
        setCouponFeedback({ type: 'success', message: `Promo code "${cleanCode}" applied (10% discount).` });
      } else {
        setCouponFeedback({ type: 'error', message: err.message || 'Invalid or expired coupon code.' });
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    setCheckoutFeedback(null);
    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }
    setIsCheckoutMode(true);
    if (!fullName && user.name) setFullName(user.name);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setCheckoutFeedback(null);

    if (!fullName.trim() || !phoneNumber.trim() || !provinceCity.trim() || !streetAddress.trim()) {
      setCheckoutFeedback({ type: 'error', message: 'Please fill in recipient name, phone, city, and address.' });
      return;
    }

    setCheckingOut(true);
    try {
      const orderItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        color: item.color,
        size: item.size
      }));

      const fullShippingAddress = `${fullName.trim()} | ${phoneNumber.trim()} | ${streetAddress.trim()}, ${provinceCity.trim()}${orderNotes ? ` (Note: ${orderNotes.trim()})` : ''}`;

      const orderResponse = await api.orders.create({
        items: orderItems,
        shippingAddress: fullShippingAddress,
        paymentMethod,
        couponCode: appliedCode || undefined
      });

      const order = orderResponse.order;

      if (paymentMethod === 'vnpay') {
        const paymentResponse = await api.payments.createPaymentUrl(order.id);
        const paymentUrl = paymentResponse.paymentUrl;
        clearCart();
        window.location.href = paymentUrl;
      } else {
        clearCart();
        navigate('/payment-result?method=cod');
      }
    } catch (error) {
      setCheckoutFeedback({ type: 'error', message: error.message || 'Failed to place order. Please try again.' });
    } finally {
      setCheckingOut(false);
    }
  };

  // Alternative Empty Cart State
  if (cart.length === 0) {
    return (
      <div style={{ padding: '80px 5%', textAlign: 'center' }}>
        <div style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--glass-border)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary)',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-neon-tint)'
        }}>
          <ShoppingBag size={40} />
        </div>
        <h2 style={{ fontSize: '26px', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: '700' }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px', maxWidth: '450px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
          No items in your cart? Browse our shop for the latest designer clothing and premium cosmetics.
        </p>
        <Link to="/products" className="btn btn-primary" style={{ padding: '14px 32px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 5%' }}>
      <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '32px' }}>Shopping Cart</h1>

      {/* Responsive layout: 2 Columns */}
      <div className="cart-layout">
        
        {/* Left Side: Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.map((item, idx) => {
            const itemSubtotal = item.price * item.quantity;
            return (
              <div 
                key={`${item.productId}-${item.color}-${item.size}-${idx}`} 
                className="glass-card cart-item-row"
                style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  alignItems: 'center', 
                  padding: '18px',
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {/* Square Product Image Thumbnail */}
                <div style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}>
                  <img 
                    src={item.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800'} 
                    alt={item.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>

                {/* Product Name & Variant Details */}
                <div style={{ flex: 1 }}>
                  <Link to={`/product/${item.productId}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ 
                      fontSize: '16px', 
                      color: 'var(--text-primary)', 
                      marginBottom: '6px', 
                      fontWeight: '600',
                      display: '-webkit-box', 
                      WebkitLineClamp: 1, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden' 
                    }}>
                      {item.name}
                    </h3>
                  </Link>
                  
                  {/* Variant info */}
                  {(item.color || item.size) ? (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {item.color && <span className="badge badge-primary" style={{ fontSize: '10px', padding: '3px 8px' }}>Color: {item.color}</span>}
                      {item.size && <span className="badge badge-secondary" style={{ fontSize: '10px', padding: '3px 8px' }}>Size: {item.size}</span>}
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Standard</span>
                  )}
                  
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Unit Price: {formatCurrency(item.price)}
                  </span>
                </div>

                {/* Interactive Quantity Adjustment Block */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: 'var(--input-bg)', 
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px', 
                  padding: '4px' 
                }}>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color, item.size)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '14px', fontWeight: '700' }}>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color, item.size)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Subtotal Calculation */}
                <div style={{ minWidth: '120px', textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Subtotal</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-secondary)' }}>
                    {formatCurrency(itemSubtotal)}
                  </span>
                </div>

                {/* Clean Delete Icon Button */}
                <button 
                  onClick={() => removeFromCart(item.productId, item.color, item.size)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '10px', transition: 'var(--transition-fast)' }}
                  className="delete-item-btn"
                  title="Remove from cart"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Side: Sticky Order Summary & Checkout Form */}
        <aside className="summary-sidebar">
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', borderBottom: '1px solid var(--glass-border)', paddingBottom: '14px' }}>
              Order Summary
            </h2>

            {/* Pricing breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span>
              </div>
              
              {/* Promo Code Discount */}
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-success)', fontWeight: '600' }}>
                  <span>Discount ({appliedCode || 'Coupon'})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              {/* Free Shipping Hint */}
              {shippingFee > 0 && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(59, 130, 246, 0.05)', border: '1px dashed rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#60a5fa' }}>
                  <Truck size={14} />
                  <span>Add {formatCurrency(1000000 - subtotal)} more for Free Shipping!</span>
                </div>
              )}
              
              {/* Grand Total */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '18px', 
                fontWeight: '800', 
                color: 'var(--text-primary)', 
                borderTop: '1px solid var(--glass-border)', 
                paddingTop: '16px', 
                marginTop: '4px' 
              }}>
                <span>Total</span>
                <span style={{ color: 'var(--color-secondary)' }}>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Promo Code Input Block */}
            <div>
              <form onSubmit={handleApplyPromoCode} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (couponFeedback) setCouponFeedback(null);
                    }}
                    placeholder="Promo code (UCONEXT10)..."
                    className="glass-input"
                    style={{ paddingLeft: '34px', fontSize: '12px', textTransform: 'uppercase' }}
                    disabled={!!appliedCode}
                  />
                  <Tag size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ padding: '0 16px', fontSize: '12px', height: '40px', fontWeight: '700' }}
                  disabled={!!appliedCode || validatingCoupon}
                >
                  {validatingCoupon ? 'Checking...' : appliedCode ? <Check size={16} /> : 'Apply'}
                </button>
              </form>
              {couponFeedback && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: couponFeedback.type === 'success' ? '#10b981' : '#ef4444',
                  }}
                >
                  {couponFeedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{couponFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Conditional Form: Checkout Steps (Shipping/Payment) */}
            {isCheckoutMode && user && (
              <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '10px' }}>
                {/* Structured Shipping Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                    Shipping Information
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Recipient Name *</span>
                      <input 
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. David Nguyen"
                        className="glass-input"
                        style={{ height: '40px', fontSize: '13px' }}
                        required
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone Number *</span>
                      <input 
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0912 345 678"
                        className="glass-input"
                        style={{ height: '40px', fontSize: '13px' }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Province / City *</span>
                    <input 
                      type="text"
                      value={provinceCity}
                      onChange={(e) => setProvinceCity(e.target.value)}
                      placeholder="e.g. Hanoi / Ho Chi Minh City / Da Nang"
                      className="glass-input"
                      style={{ height: '40px', fontSize: '13px' }}
                      required
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Street Address / Ward / District *</span>
                    <input 
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. 120 Tran Duy Hung, Trung Hoa, Cau Giay"
                      className="glass-input"
                      style={{ height: '40px', fontSize: '13px' }}
                      required
                    />
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Order Note (Optional)</span>
                    <input 
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="e.g. Deliver during business hours"
                      className="glass-input"
                      style={{ height: '40px', fontSize: '13px' }}
                    />
                  </div>
                </div>

                {/* Payment Options */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Payment Method</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    
                    {/* COD */}
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      cursor: 'pointer', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: `1px solid ${paymentMethod === 'cod' ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                      background: paymentMethod === 'cod' ? 'rgba(124, 58, 237, 0.04)' : 'none',
                      transition: 'var(--transition-fast)'
                    }}>
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: '600' }}>COD (Cash on Delivery)</span>
                    </label>

                    {/* VNPAY */}
                    <label style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      cursor: 'pointer', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: `1px solid ${paymentMethod === 'vnpay' ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                      background: paymentMethod === 'vnpay' ? 'rgba(124, 58, 237, 0.04)' : 'none',
                      transition: 'var(--transition-fast)'
                    }}>
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={paymentMethod === 'vnpay'}
                        onChange={() => setPaymentMethod('vnpay')}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={14} color="var(--color-accent)" />
                        <span style={{ fontSize: '13px', fontWeight: '600' }}>VNPAY Online Payment</span>
                      </div>
                    </label>

                  </div>
                </div>

                {/* Inline Checkout Feedback */}
                {checkoutFeedback && (
                  <div
                    role="alert"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.28)',
                      color: '#ef4444',
                      fontSize: '12.5px',
                      fontWeight: '600',
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    <span>{checkoutFeedback.message}</span>
                  </div>
                )}

                {/* Final Submit Checkout */}
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={checkingOut}
                  style={{ padding: '14px', fontSize: '14px', fontWeight: '700', width: '100%', marginTop: '6px' }}
                >
                  {checkingOut ? 'Processing...' : paymentMethod === 'vnpay' ? 'Pay with VNPAY Online' : 'Place Order (COD)'}
                </button>
              </form>
            )}

            {/* Standard "Proceed to Checkout" Action Button */}
            {!isCheckoutMode && (
              <button 
                onClick={handleProceedToCheckout}
                className="btn btn-primary proceed-checkout-btn"
                style={{ padding: '14px', fontSize: '14px', fontWeight: '700', width: '100%', marginTop: '6px' }}
              >
                Proceed to Checkout
              </button>
            )}

          </div>
        </aside>

      </div>
      
      <style>{`
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
          align-items: flex-start;
        }

        .cart-item-row:hover {
          border-color: var(--color-primary-glow) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .delete-item-btn:hover {
          color: var(--color-error) !important;
          background: rgba(239, 68, 68, 0.08);
          border-radius: 10px;
        }

        .proceed-checkout-btn {
          background: linear-gradient(135deg, var(--color-secondary), var(--color-primary)) !important;
          box-shadow: 0 4px 15px var(--color-secondary-glow) !important;
        }

        .proceed-checkout-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--color-secondary-glow), 0 0 10px var(--color-primary-glow) !important;
        }

        @media (max-width: 900px) {
          .cart-layout {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .summary-sidebar {
            position: relative;
          }
          .summary-sidebar > div {
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;
