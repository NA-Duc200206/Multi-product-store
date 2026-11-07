import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ShoppingCart, Star, Heart, Eye, ArrowLeftRight } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(product.price);

  const handleAddToCart = (e) => {
    e.preventDefault();
    const defaultColor = product.options?.colors?.length > 0 ? product.options.colors[0] : null;
    const defaultSize = product.options?.sizes?.length > 0 ? product.options.sizes[0] : null;
    addToCart(product, 1, defaultColor, defaultSize);
    showToast(`Added "${product.name}" to cart!`, 'success');
  };

  const getHashCode = (str) => {
    if (!str) return 0;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const idHash = getHashCode(product.id || '');
  const rating = product.rating || (4 + (idHash % 11) / 10);
  const reviewCount = (idHash * 17) % 150 + 12;
  const isDiscounted = idHash % 3 === 0;

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
        to={`/product/${product.id}`} 
        className="glass-card product-card-hover" 
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '420px',
          padding: '16px',
          position: 'relative',
          borderRadius: '24px',
          background: 'var(--glass-bg)',
          border: '1px solid',
          borderColor: isHovered ? 'var(--color-accent)' : 'var(--glass-border)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 25px 50px -12px rgba(58, 97, 246, 0.15)' : '0 10px 30px -10px rgba(0,0,0,0.1)',
          zIndex: isHovered ? 10 : 1
        }}
      >
        {/* Product Image Container */}
        <div style={{
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          paddingTop: '100%', // 1:1 Aspect Ratio
          marginBottom: '20px',
          background: 'var(--bg-secondary)'
        }}>
          <img 
            src={product.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800'} 
            alt={product.name} 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isHovered ? 'scale(1.1)' : 'scale(1)'
            }}
          />
          
          {/* Badges */}
          <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
            {isDiscounted && (
              <span style={{
                background: 'var(--color-error)', color: 'white', fontSize: '10px', fontWeight: '800',
                padding: '6px 12px', borderRadius: '100px', letterSpacing: '0.05em'
              }}>
                -15% OFF
              </span>
            )}
            {product.stock === 0 && (
              <span style={{
                background: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '10px', fontWeight: '800',
                padding: '6px 12px', borderRadius: '100px', border: '1px solid var(--glass-border)'
              }}>
                SOLD OUT
              </span>
            )}
          </div>

          {/* Hover Action Buttons */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '0',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 3
          }}>
            {[
              { icon: <Heart size={16} />, label: 'Wishlist' },
              { icon: <Eye size={16} />, label: 'Quick View' },
              { icon: <ArrowLeftRight size={16} />, label: 'Compare' }
            ].map((action, i) => (
              <button key={i} title={action.label} onClick={(e) => e.preventDefault()} style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'var(--glass-bg)', backdropFilter: 'blur(8px)',
                border: '1px solid var(--glass-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-primary)', cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-accent)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
              >
                {action.icon}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <span style={{ fontSize: '11px', color: 'var(--color-accent)', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            {product.category?.name || 'Premium'}
          </span>

          <h3 style={{
            fontSize: '16px',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {Array.from({ length: 5 }).map((_, i) => {
                const isFilled = i < Math.floor(rating);
                return (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={isFilled ? '#f59e0b' : 'none'} 
                    color={isFilled ? '#f59e0b' : 'var(--glass-border)'} 
                  />
                );
              })}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>
              ({reviewCount})
            </span>
          </div>

          {/* Footer Info & Action */}
          <div style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px solid var(--glass-border)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {isDiscounted && (
                <span style={{ fontSize: '12px', textDecoration: 'line-through', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(product.price * 1.15)}
                </span>
              )}
              <span style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-primary)' }}>
                {formattedPrice}
              </span>
            </div>
            
            {product.stock > 0 && (
              <button 
                onClick={handleAddToCart}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: isHovered ? 'linear-gradient(135deg, var(--color-accent) 0%, #7b46f3 100%)' : 'var(--glass-bg)',
                  color: isHovered ? '#fff' : 'var(--text-primary)',
                  border: '1px solid',
                  borderColor: isHovered ? 'transparent' : 'var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isHovered ? '0 8px 20px rgba(123, 70, 243, 0.3)' : 'none',
                  flexShrink: 0
                }}
                title="Add to Cart"
              >
                <ShoppingCart size={16} />
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
