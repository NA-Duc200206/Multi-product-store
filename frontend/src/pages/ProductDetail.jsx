import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';
import { ShoppingCart, ChevronLeft, Minus, Plus, Star, MessageSquare, Trash2, Send, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartFeedback, setCartFeedback] = useState('');
  const addedTimerRef = useRef(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState(null);
  
  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);
  
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
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await api.reviews.getByProductId(id);
      setReviews(res.reviews || []);
      setAverageRating(res.averageRating || 5.0);
      setTotalReviews(res.totalReviews || 0);
    } catch (err) {
      console.error('Failed to load reviews:', err.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewFeedback(null);
    if (!user) {
      navigate('/login');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewFeedback({ type: 'error', message: 'Please enter your review comment.' });
      return;
    }
    setSubmittingReview(true);
    try {
      await api.reviews.add({
        productId: id,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      setReviewFeedback({ type: 'success', message: 'Thank you! Your review has been posted.' });
      setReviewComment('');
      fetchReviews();
    } catch (err) {
      setReviewFeedback({ type: 'error', message: err.message || 'Failed to submit review.' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setReviewFeedback(null);
    try {
      await api.reviews.delete(reviewId);
      setReviewFeedback({ type: 'success', message: 'Review removed.' });
      fetchReviews();
    } catch (err) {
      setReviewFeedback({ type: 'error', message: err.message || 'Failed to delete review.' });
    }
  };

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
      setCartFeedback('Product is currently out of stock.');
      return;
    }

    setCartFeedback('');
    addToCart(product, quantity, selectedColor, selectedSize);
    setAddedToCart(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAddedToCart(false), 1600);
  };

  // Generate 4 mock image angles / variants based on main image
  const thumbnails = [
    product.image,
    product.image,
    product.image,
    product.image
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
                    {averageRating.toFixed(1)}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: product.stock > 0 ? '#10b981' : '#ef4444' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: product.stock > 0 ? '#10b981' : '#ef4444', display: 'inline-block' }} />
                <span>{product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of stock'}</span>
              </div>
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
              <>
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
                    fontSize: '15px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    background: addedToCart ? '#10b981' : undefined,
                    borderColor: addedToCart ? '#10b981' : undefined,
                    color: addedToCart ? '#ffffff' : undefined,
                    transition: 'all 0.25s ease'
                  }}
                >
                  {addedToCart ? (
                    <>
                      <Check size={19} strokeWidth={2.5} /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Add to Cart
                    </>
                  )}
                </button>
              </div>
              {cartFeedback && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '13px', color: '#ef4444' }}>
                  <AlertCircle size={15} />
                  <span>{cartFeedback}</span>
                </div>
              )}
              </>
            ) : (
              <div className="glass-card" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>
                Product temporarily out of stock
              </div>
            )}

            {/* Trust and delivery notes without tacky generic icons */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              marginTop: '12px',
              borderTop: '1px solid var(--glass-border)',
              paddingTop: '16px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: '1.5'
            }}>
              <span>• Certified authentic product</span>
              <span>• 30-day transparent returns</span>
              <span>• Nationwide delivery with tracking</span>
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
            <MessageSquare size={16} /> Customer Reviews ({totalReviews})
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Write Review Form */}
              <div style={{
                background: 'var(--input-bg)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid var(--glass-border)'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px' }}>
                  Write a Customer Review
                </h4>
                {reviewFeedback && (
                  <div
                    role="status"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      marginBottom: '16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: reviewFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      border: `1px solid ${reviewFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      color: reviewFeedback.type === 'success' ? '#10b981' : '#ef4444'
                    }}
                  >
                    {reviewFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{reviewFeedback.message}</span>
                  </div>
                )}
                {user ? (
                  <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Your Rating
                      </label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Star
                              size={22}
                              fill={star <= reviewRating ? '#f59e0b' : 'none'}
                              color={star <= reviewRating ? '#f59e0b' : 'var(--text-muted)'}
                            />
                          </button>
                        ))}
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#fbbf24', marginLeft: '6px' }}>
                          {reviewRating} / 5 Stars
                        </span>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Your Feedback
                      </label>
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your detailed thoughts, packaging quality, product finish..."
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '10px',
                          border: '1px solid var(--glass-border)',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          resize: 'vertical',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="btn btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 24px',
                          fontSize: '14px',
                          fontWeight: '600',
                          borderRadius: '10px'
                        }}
                      >
                        <Send size={15} />
                        {submittingReview ? 'Submitting...' : 'Post Review'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      Please sign in to your account to submit a review and rating for this product.
                    </span>
                    <button
                      onClick={() => navigate('/login')}
                      className="btn btn-primary"
                      style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '8px' }}
                    >
                      Sign In Now
                    </button>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <MessageSquare size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                  <p style={{ fontSize: '15px', fontWeight: '500' }}>No reviews yet for this product.</p>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>Be the first customer to share your thoughts!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map((rev) => {
                    const isAuthorOrAdmin = user && (user.id === rev.userId || user._id === rev.userId || user.id === rev.user?._id || user.role === 'admin');
                    return (
                      <div 
                        key={rev.id || rev._id} 
                        style={{
                          borderBottom: '1px solid var(--glass-border)',
                          paddingBottom: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: 'var(--color-primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '700',
                              fontSize: '13px'
                            }}>
                              {(rev.user?.name || 'C').charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '15px' }}>
                              {rev.user?.name || 'Verified Customer'}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Recently'}
                            </span>
                            {isAuthorOrAdmin && (
                              <button
                                onClick={() => handleDeleteReview(rev.id || rev._id)}
                                title="Delete review"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Review Stars */}
                        <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={13} 
                              fill={i < rev.rating ? '#f59e0b' : 'none'} 
                              color={i < rev.rating ? '#f59e0b' : 'var(--text-muted)'} 
                            />
                          ))}
                        </div>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginTop: '4px' }}>
                          {rev.comment}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '16px' }}>Technical Specifications, Care Instructions</h3>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Brand: UCONEXT Official</li>
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
