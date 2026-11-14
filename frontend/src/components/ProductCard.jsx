import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star, Heart, Eye, Check } from 'lucide-react';
import { formatVND, translateCategoryName, getSafeImageUrl, handleImageError } from '../utils/formatters';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const formattedPrice = formatVND(product.price);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultColor = product.options?.colors?.length > 0 ? product.options.colors[0] : null;
    const defaultSize = product.options?.sizes?.length > 0 ? product.options.sizes[0] : null;
    addToCart(product, 1, defaultColor, defaultSize);
    setIsAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsAdded(false), 1400);
  };

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const hasRating = typeof product.rating === 'number' && product.rating > 0;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Link 
        to={`/product/${product._id || product.id}`} 
        className="glass-card product-card-hover" 
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '400px',
          padding: '16px',
          position: 'relative',
          borderRadius: 'var(--radius-lg, 20px)',
          background: 'var(--glass-bg)',
          border: '1px solid',
          borderColor: isHovered ? 'var(--brand, #2454F4)' : 'var(--glass-border)',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isHovered ? 'translateY(-6px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 20px 40px -10px rgba(36, 84, 244, 0.18)' : '0 8px 24px -10px rgba(0,0,0,0.08)',
          zIndex: isHovered ? 10 : 1
        }}
      >
        {/* Product Image Container */}
        <div style={{
          borderRadius: 'var(--radius-md, 14px)',
          overflow: 'hidden',
          position: 'relative',
          paddingTop: '100%', // 1:1 Aspect Ratio
          marginBottom: '16px',
          background: 'var(--bg-secondary)'
        }}>
          <img 
            src={getSafeImageUrl(product.image)} 
            alt={product.name} 
            loading="lazy"
            onError={handleImageError}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isHovered ? 'scale(1.06)' : 'scale(1)'
            }}
          />
          
          {/* Badges */}
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
            {hasDiscount && (
              <span style={{
                background: '#0f172a', color: '#ffffff', fontSize: '11px', fontWeight: '700',
                padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.02em'
              }}>
                -{discountPercent}%
              </span>
            )}
            {product.stock === 0 && (
              <span style={{
                background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '10px', fontWeight: '700',
                padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--glass-border)', letterSpacing: '0.04em'
              }}>
                OUT OF STOCK
              </span>
            )}
          </div>

          {/* Hover Action Buttons */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '0',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 3
          }}>
            {[
              { icon: <Heart size={15} />, label: 'Wishlist' },
              { icon: <Eye size={15} />, label: 'Quick View' }
            ].map((action, i) => (
              <button key={i} title={action.label} onClick={(e) => e.preventDefault()} style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
                border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-primary)', cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#2454F4'; e.currentTarget.style.borderColor = '#2454F4'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
              >
                {action.icon}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <span style={{ fontSize: '11px', color: '#2454F4', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>
            {translateCategoryName(product.category?.name || product.category || 'Featured')}
          </span>

          <h3 style={{
            fontSize: '15px',
            fontWeight: '700',
            marginBottom: '8px',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'var(--text-primary)'
          }}>
            {product.name}
          </h3>

          {hasRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const isFilled = i < Math.floor(product.rating);
                  return (
                    <Star 
                      key={i} 
                      size={13} 
                      fill={isFilled ? '#f59e0b' : 'none'} 
                      color={isFilled ? '#f59e0b' : 'var(--glass-border)'} 
                    />
                  );
                })}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                {product.rating.toFixed(1)} {product.reviewCount ? `(${product.reviewCount})` : ''}
              </span>
            </div>
          )}

          {/* Footer Info & Action */}
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '12px',
            borderTop: '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {hasDiscount && (
                <span style={{ fontSize: '11px', textDecoration: 'line-through', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  {formatVND(product.originalPrice)}
                </span>
              )}
              <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {formattedPrice}
              </span>
            </div>
            
            {product.stock > 0 && (
              <button 
                onClick={handleAddToCart}
                style={{
                  width: isAdded ? 'auto' : '38px',
                  minWidth: '38px',
                  height: '38px',
                  padding: isAdded ? '0 10px' : '0',
                  borderRadius: '10px',
                  background: isAdded ? '#10b981' : isHovered ? '#2454F4' : 'var(--glass-bg)',
                  color: isAdded || isHovered ? '#ffffff' : 'var(--text-primary)',
                  border: '1px solid',
                  borderColor: isAdded ? '#10b981' : isHovered ? 'transparent' : 'var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isAdded
                    ? '0 6px 16px rgba(16, 185, 129, 0.3)'
                    : isHovered
                    ? '0 6px 16px rgba(36, 84, 244, 0.3)'
                    : 'none',
                  transform: isAdded ? 'scale(1.05)' : 'scale(1)',
                  flexShrink: 0
                }}
                title={isAdded ? 'Added to cart' : 'Add to cart'}
              >
                {isAdded ? (
                  <>
                    <Check size={15} strokeWidth={2.5} />
                    <span>Added</span>
                  </>
                ) : (
                  <ShoppingCart size={15} />
                )}
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
