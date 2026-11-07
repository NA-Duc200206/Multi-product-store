import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';
import { ShoppingCart, ChevronLeft, Minus, Plus, ShieldCheck, RefreshCw, Star, MessageSquare } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Selected variant configuration states
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Thumbnail selection
  const [activeImage, setActiveImage] = useState('');
  const [selectedThumb, setSelectedThumb] = useState(0);

  // Active tab state
  const [activeTab, setActiveTab] = useState('reviews'); // 'description' | 'reviews'

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.products.getById(id);
        setProduct(res.product);
        setActiveImage(res.product.image);
        setSelectedThumb(0);
        
        // Auto-select first variant color/size if available
        if (res.product.options?.colors?.length > 0) {
          setSelectedColor(res.product.options.colors[0]);
        }
        if (res.product.options?.sizes?.length > 0) {
          setSelectedSize(res.product.options.sizes[0]);
        }
      } catch (err) {
        console.error('Failed to load product details:', err.message);
        showToast('Product does not exist.', 'error');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '40px 5%' }}>
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(product.price);

  const handleQuantityChange = (type) => {
    if (type === 'dec' && quantity > 1) {
      setQuantity(quantity - 1);
    } else if (type === 'inc' && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    if (product.stock === 0) {
      showToast('Product is out of stock.', 'warning');
      return;
    }
    
    addToCart(product, quantity, selectedColor, selectedSize);
    
    let variantInfo = '';
    if (selectedColor || selectedSize) {
      variantInfo = ` (${[selectedColor, selectedSize].filter(Boolean).join(', ')})`;
    }
    showToast(`Added ${quantity} x "${product.name}"${variantInfo} to cart!`, 'success');
  };

  // Generate 4 mock image angles / variants based on main image
  const thumbnails = [
    product.image,
    // Angle 2: Close-up zoom (styling overlay placeholder)
    product.image,
    // Angle 3: Alternate lighting/zoom
    product.image,
    // Angle 4: Alternate view
    product.image
  ];

  // Ratings calculation: parse Mongoose hexadecimal string ID into a deterministic numeric value
  const idNum = parseInt(String(product.id || product._id || '0').slice(-6), 16) || 0;
  const productRating = product.rating || (4 + (idNum % 11) / 10);
  const totalReviews = (idNum * 17) % 150 + 12;

  // Mock Reviews
  const mockReviews = [
    {
      id: 1,
      name: "Minh Anh Nguyen",
      rating: 5,
      date: "12/05/2026",
      text: "Excellent product quality, carefully packaged, and ultra-fast delivery. The material is very soft and premium. Will definitely support the shop long term."
    },
    {
      id: 2,
      name: "Vy Tran",
      rating: 4,
      date: "28/04/2026",
      text: "Very beautiful colors, matches the website description perfectly. Comfortable to use. The customer service responds fast and is extremely friendly."
    },
    {
      id: 3,
      name: "Khanh Gia Hoang",
      rating: 5,
      date: "15/04/2026",
      text: "100% genuine product, fully verified details. Very competitive pricing. Shipped faster than expected, and packaged very professionally."
    }
  ];

  return (
    <div style={{ padding: '40px 5%' }}>
      {/* Breadcrumb Back Navigation */}
      <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-secondary)', marginBottom: '32px', fontWeight: '600', transition: 'var(--transition-fast)' }} className="back-link">
        <ChevronLeft size={16} /> Back to shop
      </Link>

      {/* Main Split Section: Desktop Left (Images), Right (Metadata & Actions) */}
      <div className="product-split-container">
        
        {/* Left Side: Image Gallery */}
        <ScrollReveal direction="left" duration={800} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Large Main Image */}
          <div className="glass-card" style={{ padding: '16px', borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{
              position: 'relative',
              paddingTop: '100%', // 1:1 Aspect Ratio
              overflow: 'hidden',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--glass-border)'
            }}>
              <img 
                src={activeImage || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800'} 
                alt={product.name} 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  // Alternate angle presentation zooms
                  transform: selectedThumb === 1 ? 'scale(1.3)' : selectedThumb === 2 ? 'scale(1.15) rotate(5deg)' : selectedThumb === 3 ? 'scale(1.2) translate(10px, -10px)' : 'scale(1)',
                  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
            </div>
          </div>

          {/* Row of 4 Thumbnail preview boxes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {thumbnails.map((img, idx) => {
              const isSelected = selectedThumb === idx;
              return (
                <button
                  key={idx}
                  onClick={() => { setSelectedThumb(idx); }}
                  onMouseEnter={() => { setSelectedThumb(idx); }}
                  style={{
                    padding: '0',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    background: 'var(--input-bg)',
                    position: 'relative',
                    paddingTop: '100%',
                    boxShadow: isSelected ? 'var(--shadow-neon)' : 'none',
                    transition: 'var(--transition-smooth)',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                  }}
                >
                  <img 
                    src={img || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800'} 
                    alt={`Thumbnail ${idx}`} 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: isSelected ? 1 : 0.7,
                      transform: idx === 1 ? 'scale(1.3)' : idx === 2 ? 'scale(1.15) rotate(5deg)' : idx === 3 ? 'scale(1.2) translate(10px, -10px)' : 'scale(1)',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Right Side: Product Metadata & Actions */}
        <ScrollReveal direction="right" duration={800}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Header / Category / Title */}
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '12px', fontSize: '11px' }}>
                {product.category?.name || 'Product'}
              </span>
              <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '12px', lineHeight: '1.2' }}>
                {product.name}
              </h1>

              {/* Rating Summary Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '100px',
                  padding: '4px 12px',
                }}>
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#fbbf24' }}>
                    {productRating.toFixed(1)}
                  </span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  | &nbsp; {totalReviews} customer reviews
                </span>
              </div>
            </div>

            {/* High Contrast Bold Price & Availability */}
            <div style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Price</span>
                <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-secondary)', letterSpacing: '-0.02em' }}>
                  {formattedPrice}
                </span>
              </div>
              <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-error'}`} style={{ padding: '6px 12px', fontSize: '12px' }}>
                {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of stock'}
              </span>
            </div>

            {/* Short Description */}
            <div>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '700' }}>Product Introduction</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px', whiteSpace: 'pre-line' }}>
                {product.description || 'Premium product exquisitely designed to meet the highest quality standards, providing a complete and satisfying user experience.'}
              </p>
            </div>

            {/* Variant Selector: Selection Buttons with Active Styling */}
            {product.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Color Selection */}
                {product.options.colors && product.options.colors.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '700' }}>Colors</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {product.options.colors.map(color => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              boxShadow: isSelected ? 'var(--shadow-neon)' : 'none',
                              border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--glass-border)'
                            }}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {product.options.sizes && product.options.sizes.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '700' }}>Sizes</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {product.options.sizes.map(size => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              boxShadow: isSelected ? 'var(--shadow-neon)' : 'none',
                              border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--glass-border)'
                            }}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity Modifier & Add to Cart full-width Row */}
            {product.stock > 0 ? (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
                {/* Quantity Modifier */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  padding: '4px',
                  height: '48px'
                }}>
                  <button 
                    onClick={() => handleQuantityChange('dec')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ minWidth: '40px', textAlign: 'center', fontWeight: '700', fontSize: '15px' }}>{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange('inc')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  className="btn btn-primary add-to-cart-btn"
                  style={{
                    padding: '14px 28px',
                    height: '48px',
                    flex: 1,
                    fontSize: '15px'
                  }}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>
                Product temporarily out of stock
              </div>
            )}

            {/* Guarantee / Value Badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginTop: '10px',
              borderTop: '1px solid var(--glass-border)',
              paddingTop: '20px'
            }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={18} color="var(--color-success)" />
                <span>100% genuine product</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <RefreshCw size={18} color="var(--color-success)" />
                <span>Easy returns & exchanges</span>
              </div>
            </div>

          </div>
        </ScrollReveal>
      </div>

      {/* Below Split Section: Tabbed Layout (Info & Reviews) */}
      <section style={{ marginTop: '60px' }}>
        {/* Tab Headers */}
        <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid var(--glass-border)', marginBottom: '30px' }}>
          <button 
            onClick={() => setActiveTab('reviews')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'reviews' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '16px',
              paddingBottom: '12px',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <MessageSquare size={16} /> Customer Reviews ({mockReviews.length})
            {activeTab === 'reviews' && (
              <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', background: 'var(--color-primary)' }}></div>
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('description')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'description' ? 'var(--color-primary)' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '16px',
              paddingBottom: '12px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            Details
            {activeTab === 'description' && (
              <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', background: 'var(--color-primary)' }}></div>
            )}
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="glass-card" style={{ padding: '32px' }}>
          {activeTab === 'reviews' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {mockReviews.map((rev) => (
                <div 
                  key={rev.id} 
                  style={{
                    borderBottom: rev.id !== mockReviews.length ? '1px solid var(--glass-border)' : 'none',
                    paddingBottom: rev.id !== mockReviews.length ? '24px' : '0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '15px' }}>
                      {rev.name}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {rev.date}
                    </span>
                  </div>

                  {/* Review Stars */}
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        fill={i < rev.rating ? '#f59e0b' : 'none'} 
                        color={i < rev.rating ? '#f59e0b' : 'var(--text-muted)'} 
                      />
                    ))}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                    {rev.text}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Technical Specifications & Care Instructions</h3>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Brand: GlowStore Premium</li>
                <li>Origin: Vietnam / Genuine imported materials</li>
                <li>Storage: Store in a cool, dry place, avoid direct sunlight</li>
                <li>Warranty / Expiry: Refer to product packaging</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .product-split-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: flex-start;
        }

        .back-link:hover {
          color: var(--text-primary) !important;
          transform: translateX(-4px);
        }

        .add-to-cart-btn:hover {
          background: linear-gradient(135deg, var(--color-secondary), var(--color-primary)) !important;
          box-shadow: 0 6px 20px var(--color-secondary-glow), 0 0 10px var(--color-primary-glow) !important;
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .product-split-container {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
