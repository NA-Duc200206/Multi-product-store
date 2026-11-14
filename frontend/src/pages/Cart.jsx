import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatVND, getSafeImageUrl, handleImageError } from '../utils/formatters';
import {
  Trash2,
  ShoppingBag,
  Plus,
  Minus,
  CreditCard,
  Truck,
  Tag,
  Check,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

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
  const [activeCoupons, setActiveCoupons] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchActiveCoupons = async () => {
      try {
        const res = await api.coupons.getActive();
        const list = Array.isArray(res) ? res : res?.coupons || [];
        if (mounted) setActiveCoupons(list);
      } catch {
        // Non-blocking: active coupon suggestions are optional
      }
    };
    fetchActiveCoupons();
    return () => {
      mounted = false;
    };
  }, []);

  const subtotal = getCartTotal();
  // Free shipping on orders over 1,000,000 VND, otherwise 30,000 VND
  const shippingFee = subtotal > 1000000 ? 0 : 30000;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  const formatCurrency = formatVND;

  const applyCouponCode = async (rawCode) => {
    setCouponFeedback(null);
    const trimmed = rawCode.trim();
    if (!trimmed) {
      setCouponFeedback({ type: 'error', message: 'Please enter a coupon code.' });
      return;
    }

    setPromoCode(trimmed.toUpperCase());
    setValidatingCoupon(true);
    try {
      const res = await api.coupons.validate(trimmed, subtotal);
      setDiscountAmount(res.discountAmount);
      setAppliedCode(res.code);
      setCouponFeedback({
        type: 'success',
        message: `Coupon "${res.code}" applied (-${formatCurrency(res.discountAmount)}).`,
      });
    } catch (err) {
      // Fallback promo codes
      const cleanCode = trimmed.toUpperCase();
      if (cleanCode === 'UCONEXT' || cleanCode === 'GLOW10' || cleanCode === 'SALE10') {
        const disc = Math.round(subtotal * 0.1);
        setDiscountAmount(disc);
        setAppliedCode(cleanCode);
        setCouponFeedback({
          type: 'success',
          message: `Promo code "${cleanCode}" applied (10% discount).`,
        });
      } else {
        setCouponFeedback({ type: 'error', message: err.message || 'Invalid or expired coupon code.' });
      }
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleApplyPromoCode = (e) => {
    e.preventDefault();
    applyCouponCode(promoCode);
  };

  const handleRemoveCoupon = () => {
    setAppliedCode('');
    setDiscountAmount(0);
    setPromoCode('');
    setCouponFeedback(null);
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
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      }));

      const fullShippingAddress = `${fullName.trim()} | ${phoneNumber.trim()} | ${streetAddress.trim()}, ${provinceCity.trim()}${
        orderNotes ? ` (Note: ${orderNotes.trim()})` : ''
      }`;

      const orderResponse = await api.orders.create({
        items: orderItems,
        shippingAddress: fullShippingAddress,
        paymentMethod,
        couponCode: appliedCode || undefined,
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

  // Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="cart-page-container" style={{ textAlign: 'center', paddingTop: '80px', paddingBottom: '80px' }}>
        <div
          style={{
            width: '88px',
            height: '88px',
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
          <ShoppingBag size={38} />
        </div>
        <h2 style={{ fontSize: '26px', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: '700' }}>
          Your cart is empty
        </h2>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            fontSize: '15px',
            maxWidth: '450px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6',
          }}
        >
          No items in your cart? Browse our shop for the latest electronics, apparel, and lifestyle essentials.
        </p>
        <Link
          to="/products"
          className="btn btn-primary"
          style={{
            padding: '13px 28px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--brand)',
            color: '#ffffff',
            border: 'none',
          }}
        >
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
        <style>{`
          .cart-page-container {
            max-width: 1560px;
            margin: 0 auto;
            padding: 36px 48px 72px;
          }
          @media (max-width: 1024px) {
            .cart-page-container { padding: 28px 28px 56px; }
          }
          @media (max-width: 640px) {
            .cart-page-container { padding: 20px 16px 48px; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Shopping Cart
        </h1>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>
          {cart.reduce((sum, item) => sum + item.quantity, 0)} items
        </span>
      </div>

      {/* Responsive layout: 2 Columns */}
      <div className="cart-layout">
        {/* Left Side: Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.map((item, idx) => {
            const itemSubtotal = item.price * item.quantity;
            return (
              <div
                key={`${item.productId}-${item.color}-${item.size}-${idx}`}
                className="cart-surface cart-item-row"
              >
                {/* Square Product Image Thumbnail */}
                <Link
                  to={`/product/${item.productId}`}
                  className="cart-item-thumb"
                >
                  <img
                    src={getSafeImageUrl(item.image)}
                    onError={handleImageError}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Link>

                {/* Product Name & Variant Details */}
                <div className="cart-item-info">
                  <Link to={`/product/${item.productId}`} style={{ textDecoration: 'none' }}>
                    <h3
                      style={{
                        fontSize: '17px',
                        color: 'var(--text-primary)',
                        marginBottom: '8px',
                        fontWeight: '700',
                        lineHeight: '1.35',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.name}
                    </h3>
                  </Link>

                  {/* Variant info */}
                  {item.color || item.size ? (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {item.color && (
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: '600',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Color: {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span
                          style={{
                            fontSize: '12.5px',
                            fontWeight: '600',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Size: {item.size}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      Standard
                    </span>
                  )}

                  <span style={{ fontSize: '14.5px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    Unit Price: {formatCurrency(item.price)}
                  </span>
                </div>

                {/* Interactive Quantity Adjustment Block */}
                <div className="cart-item-qty">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1, item.color, item.size)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '15px', fontWeight: '700' }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1, item.color, item.size)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      width: '34px',
                      height: '34px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Subtotal Calculation */}
                <div className="cart-item-subtotal">
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Subtotal</span>
                  <span style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {formatCurrency(itemSubtotal)}
                  </span>
                </div>

                {/* Clean Delete Icon Button */}
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId, item.color, item.size)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '8px',
                    transition: 'var(--transition-fast)',
                    justifySelf: 'end',
                  }}
                  className="delete-item-btn cart-item-delete"
                  title="Remove from cart"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Right Side: Sticky Order Summary & Checkout Form */}
        <aside className="summary-sidebar">
          <div
            className="cart-surface"
            style={{
              padding: '24px',
              borderRadius: '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'sticky',
              top: '100px',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '800',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '14px',
              }}
            >
              Order Summary
            </h2>

            {/* Pricing breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'var(--text-secondary)' }}>
                <span>Shipping Fee</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span>
              </div>

              {/* Promo Code Discount */}
              {discountAmount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '15px',
                    color: 'var(--color-success)',
                    fontWeight: '600',
                  }}
                >
                  <span>Discount ({appliedCode || 'Coupon'})</span>
                  <span style={{ whiteSpace: 'nowrap' }}>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              {/* Free Shipping Hint */}
              {shippingFee > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    background: 'rgba(36, 84, 244, 0.08)',
                    border: '1px dashed rgba(36, 84, 244, 0.35)',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: 'var(--brand)',
                    fontWeight: '600',
                  }}
                >
                  <Truck size={15} style={{ flexShrink: 0 }} />
                  <span>Add {formatCurrency(1000000 - subtotal)} more for Free Shipping!</span>
                </div>
              )}

              {/* Grand Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '20px',
                  fontWeight: '800',
                  color: 'var(--text-primary)',
                  borderTop: '1px solid var(--glass-border)',
                  paddingTop: '16px',
                  marginTop: '4px',
                }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--brand)', whiteSpace: 'nowrap' }}>{formatCurrency(total)}</span>
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
                    placeholder="Promo code (e.g. UCONEXT10)..."
                    className="glass-input"
                    style={{ height: '42px', padding: '0 12px 0 36px', fontSize: '13.5px', textTransform: 'uppercase' }}
                    disabled={!!appliedCode}
                  />
                  <Tag
                    size={15}
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  />
                </div>
                {appliedCode ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="btn btn-secondary"
                    style={{ padding: '0 14px', fontSize: '13px', height: '42px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                    title="Remove coupon"
                  >
                    <X size={14} /> Clear
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-secondary"
                    style={{ padding: '0 18px', fontSize: '13.5px', height: '42px', fontWeight: '700', flexShrink: 0 }}
                    disabled={validatingCoupon}
                  >
                    {validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                )}
              </form>

              {/* Suggested Active Coupons */}
              {activeCoupons.length > 0 && !appliedCode && (
                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Available Coupons (click to apply):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeCoupons.map((coupon) => {
                      const label =
                        coupon.discountType === 'percentage'
                          ? `${coupon.discountValue}% off`
                          : `-${formatCurrency(coupon.discountValue)}`;
                      return (
                        <button
                          key={coupon._id || coupon.code}
                          type="button"
                          onClick={() => applyCouponCode(coupon.code)}
                          disabled={validatingCoupon}
                          className="coupon-chip"
                          title={
                            coupon.minOrderAmount > 0
                              ? `Min order: ${formatCurrency(coupon.minOrderAmount)}`
                              : 'Click to apply coupon'
                          }
                        >
                          <Tag size={11} />
                          <span>{coupon.code}</span>
                          <span style={{ opacity: 0.75 }}>({label})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {couponFeedback && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: couponFeedback.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
                  }}
                >
                  {couponFeedback.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  <span>{couponFeedback.message}</span>
                </div>
              )}
            </div>

            {/* Conditional Form: Checkout Steps (Shipping/Payment) */}
            {isCheckoutMode && user && (
              <form
                onSubmit={handleCheckoutSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  borderTop: '1px solid var(--glass-border)',
                  paddingTop: '20px',
                  marginTop: '6px',
                }}
              >
                {/* Structured Shipping Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                    Shipping Information
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Recipient Name *
                      </span>
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
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Phone Number *
                      </span>
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
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Province / City *
                    </span>
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
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Street Address / Ward / District *
                    </span>
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
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Order Note (Optional)
                    </span>
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
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                    Payment Method
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* COD */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '11px 12px',
                        borderRadius: '10px',
                        border: `1px solid ${paymentMethod === 'cod' ? 'var(--brand)' : 'var(--glass-border)'}`,
                        background: paymentMethod === 'cod' ? 'rgba(36, 84, 244, 0.08)' : 'transparent',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        style={{ accentColor: 'var(--brand)' }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        COD (Cash on Delivery)
                      </span>
                    </label>

                    {/* VNPAY */}
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        padding: '11px 12px',
                        borderRadius: '10px',
                        border: `1px solid ${paymentMethod === 'vnpay' ? 'var(--brand)' : 'var(--glass-border)'}`,
                        background: paymentMethod === 'vnpay' ? 'rgba(36, 84, 244, 0.08)' : 'transparent',
                        transition: 'var(--transition-fast)',
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'vnpay'}
                        onChange={() => setPaymentMethod('vnpay')}
                        style={{ accentColor: 'var(--brand)' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={14} color="var(--brand)" />
                        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          VNPAY Online Payment
                        </span>
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
                  className="btn btn-primary proceed-checkout-btn"
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
                type="button"
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
        .cart-page-container {
          max-width: 1560px;
          margin: 0 auto;
          padding: 36px 48px 72px;
        }

        .cart-surface {
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
        }

        .cart-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 400px;
          gap: 32px;
          align-items: flex-start;
        }

        .cart-item-row {
          display: grid;
          grid-template-columns: 100px minmax(0, 1fr) auto auto auto;
          gap: 22px;
          align-items: center;
          padding: 20px 24px;
          border-radius: 16px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .cart-item-thumb {
          width: 100px;
          height: 100px;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          display: block;
        }

        .cart-item-info {
          min-width: 0;
        }

        .cart-item-qty {
          display: flex;
          align-items: center;
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 4px;
        }

        .cart-item-subtotal {
          min-width: 112px;
          text-align: right;
          display: flex;
          flex-direction: column;
        }

        .cart-item-row:hover {
          border-color: rgba(36, 84, 244, 0.35);
          box-shadow: var(--card-hover-shadow);
        }

        .delete-item-btn:hover {
          color: var(--color-error) !important;
          background: rgba(239, 68, 68, 0.08);
          border-radius: 10px;
        }

        .coupon-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--brand);
          background: rgba(36, 84, 244, 0.08);
          border: 1px solid rgba(36, 84, 244, 0.25);
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .coupon-chip:hover:not(:disabled) {
          background: rgba(36, 84, 244, 0.16);
          border-color: var(--brand);
        }

        .proceed-checkout-btn {
          background: var(--brand) !important;
          color: #ffffff !important;
          border: none !important;
          box-shadow: 0 4px 14px rgba(36, 84, 244, 0.25) !important;
        }

        .proceed-checkout-btn:hover:not(:disabled) {
          background: var(--brand-hover) !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(36, 84, 244, 0.35) !important;
        }

        @media (max-width: 1024px) {
          .cart-page-container {
            padding: 28px 28px 56px;
          }
          .cart-layout {
            grid-template-columns: 1fr 340px;
            gap: 24px;
          }
        }

        @media (max-width: 900px) {
          .cart-layout {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .summary-sidebar {
            position: relative;
          }
          .summary-sidebar > div {
            position: relative !important;
            top: 0 !important;
          }
        }

        @media (max-width: 640px) {
          .cart-page-container {
            padding: 20px 16px 48px;
          }
          .cart-item-row {
            grid-template-columns: 76px minmax(0, 1fr);
            gap: 12px 14px;
            padding: 14px;
          }
          .cart-item-thumb {
            width: 76px;
            height: 76px;
          }
          .cart-item-qty {
            grid-column: 1 / 2;
            justify-self: start;
          }
          .cart-item-subtotal {
            grid-column: 2 / 3;
            min-width: 0;
            text-align: left;
            justify-self: start;
          }
          .cart-item-delete {
            grid-column: 2 / 3;
            grid-row: 2;
            justify-self: end;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;
