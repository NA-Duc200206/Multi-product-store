import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ProductDetailSkeleton } from '../components/SkeletonLoader';
import ProductCard from '../components/ProductCard';
import {
  formatVND,
  translateCategoryName,
  getSafeImageUrl,
  handleImageError,
} from '../utils/formatters';
import {
  ShoppingCart,
  ChevronRight,
  Minus,
  Plus,
  Star,
  MessageSquare,
  Trash2,
  Send,
  Check,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const extractCategoryId = (prod) => {
  if (!prod) return null;
  if (typeof prod.categoryId === 'string') return prod.categoryId;
  return prod.categoryId?._id || prod.categoryId?.id || prod.category?._id || prod.category?.id || null;
};

const COMMITMENTS = [
  { num: '01', text: 'Certified authentic product' },
  { num: '02', text: '30-day transparent returns' },
  { num: '03', text: 'Nationwide delivery with tracking' },
];

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

  // Related & recently viewed products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(5.0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Selected variant configuration states
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Gallery state
  const [activeImage, setActiveImage] = useState('');

  // Active tab state
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'description'

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  // Fetch product details
  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setAddedToCart(false);
    setCartFeedback('');
    setReviewFeedback(null);
    setConfirmDeleteId(null);
    setRelatedProducts([]);

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.products.getById(id);
        const prod = res.product;
        setProduct(prod);
        setActiveImage(prod.image || '');

        if (prod.options?.colors?.length > 0) {
          setSelectedColor(prod.options.colors[0]);
        } else {
          setSelectedColor(null);
        }
        if (prod.options?.sizes?.length > 0) {
          setSelectedSize(prod.options.sizes[0]);
        } else {
          setSelectedSize(null);
        }

        // Track & load recently viewed products
        const currentId = prod._id || prod.id || id;
        try {
          const raw = localStorage.getItem('uconext_recently_viewed');
          const parsed = raw ? JSON.parse(raw) : [];
          const list = Array.isArray(parsed) ? parsed : [];
          const previousOthers = list.filter((item) => (item._id || item.id) !== currentId);
          setRecentlyViewed(previousOthers.slice(0, 4));

          const snapshot = {
            _id: currentId,
            id: currentId,
            name: prod.name,
            price: prod.price,
            originalPrice: prod.originalPrice,
            image: prod.image,
            stock: prod.stock,
            rating: prod.rating,
            category: prod.category,
            options: prod.options,
          };
          localStorage.setItem(
            'uconext_recently_viewed',
            JSON.stringify([snapshot, ...previousOthers].slice(0, 8))
          );
        } catch {
          // Ignore storage quota or JSON parse errors
        }

        const catId = extractCategoryId(prod);
        if (catId) {
          try {
            const relRes = await api.products.getAll({ categoryId: catId, limit: 5 });
            const currentId = prod._id || prod.id || id;
            const filtered = (relRes.products || [])
              .filter((p) => (p._id || p.id) !== currentId)
              .slice(0, 4);
            setRelatedProducts(filtered);
          } catch (relErr) {
            console.error('Failed to load related products:', relErr.message);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err.message);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

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

  // Unique gallery images (only show thumbnail strip if > 1 unique image)
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [];
    if (product.image) list.push(product.image);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [product]);

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
        comment: reviewComment.trim(),
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

  const handleConfirmDeleteReview = async (reviewId) => {
    setReviewFeedback(null);
    setDeletingReviewId(reviewId);
    try {
      await api.reviews.delete(reviewId);
      setConfirmDeleteId(null);
      setReviewFeedback({ type: 'success', message: 'Review removed.' });
      fetchReviews();
    } catch (err) {
      setReviewFeedback({ type: 'error', message: err.message || 'Failed to delete review.' });
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handleQuantityChange = (type) => {
    if (!product) return;
    if (type === 'dec' && quantity > 1) {
      setQuantity((prev) => prev - 1);
    } else if (type === 'inc' && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) {
      setCartFeedback('Product is currently out of stock.');
      return;
    }
    setCartFeedback('');
    addToCart(product, quantity, selectedColor, selectedSize);
    setAddedToCart(true);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAddedToCart(false), 1600);
  };

  const handleBuyNow = () => {
    if (!product || product.stock === 0) {
      setCartFeedback('Product is currently out of stock.');
      return;
    }
    setCartFeedback('');
    addToCart(product, quantity, selectedColor, selectedSize);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="pd-page">
        <div className="pd-container">
          <ProductDetailSkeleton />
        </div>
        <style>{pageStyles}</style>
      </div>
    );
  }

  if (!product) return null;

  const categoryId = extractCategoryId(product);
  const categoryLabel = translateCategoryName(product.category?.name || 'Product');
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* Editorial Breadcrumb */}
        <nav aria-label="Breadcrumb" className="pd-breadcrumb">
          <Link to="/" className="pd-breadcrumb-link">Home</Link>
          <ChevronRight size={14} className="pd-breadcrumb-sep" />
          <Link to="/products" className="pd-breadcrumb-link">Shop</Link>
          {product.category?.name && (
            <>
              <ChevronRight size={14} className="pd-breadcrumb-sep" />
              <Link
                to={categoryId ? `/products?categoryId=${categoryId}` : '/products'}
                className="pd-breadcrumb-link"
              >
                {categoryLabel}
              </Link>
            </>
          )}
          <ChevronRight size={14} className="pd-breadcrumb-sep" />
          <span className="pd-breadcrumb-current">{product.name}</span>
        </nav>

        {/* Main Split Layout */}
        <div className="pd-split">
          {/* Left: Clean Product Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-image-wrap">
              <img
                src={getSafeImageUrl(activeImage || product.image)}
                alt={product.name}
                onError={handleImageError}
                className="pd-main-image"
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="pd-thumb-strip">
                {galleryImages.map((imgUrl, idx) => {
                  const isSelected = (activeImage || product.image) === imgUrl;
                  return (
                    <button
                      key={imgUrl}
                      type="button"
                      onClick={() => setActiveImage(imgUrl)}
                      className={`pd-thumb-btn ${isSelected ? 'active' : ''}`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={getSafeImageUrl(imgUrl)}
                        alt={`${product.name} ${idx + 1}`}
                        onError={handleImageError}
                        className="pd-thumb-img"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Editorial Purchase Column */}
          <div className="pd-info-col">
            <div>
              <span className="pd-category-tag">{categoryLabel}</span>
              <h1 className="pd-title">{product.name}</h1>

              <div className="pd-rating-row">
                <div className="pd-rating-pill">
                  <Star size={14} fill="#f59e0b" color="#f59e0b" />
                  <span>{Number(averageRating).toFixed(1)}</span>
                </div>
                <span className="pd-review-count">
                  {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </span>
                <span className="pd-dot-sep">·</span>
                <span
                  className="pd-stock-badge"
                  style={{ color: product.stock > 0 ? '#10b981' : '#ef4444' }}
                >
                  <span
                    className="pd-stock-dot"
                    style={{ background: product.stock > 0 ? '#10b981' : '#ef4444' }}
                  />
                  {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of stock'}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="pd-price-box">
              <span className="pd-price-label">Price</span>
              <div className="pd-price-values">
                <span className="pd-price-current">{formatVND(product.price)}</span>
                {hasDiscount && (
                  <span className="pd-price-original">{formatVND(product.originalPrice)}</span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="pd-section-label">Product Overview</h2>
              <p className="pd-description">
                {product.description ||
                  'Premium product exquisitely designed to meet the highest quality standards, providing a complete and satisfying user experience.'}
              </p>
            </div>

            {/* Variant Selectors */}
            {product.options && (
              <div className="pd-variants">
                {product.options.colors?.length > 0 && (
                  <div>
                    <h3 className="pd-section-label">
                      Color: <span className="pd-variant-selected">{selectedColor}</span>
                    </h3>
                    <div className="pd-variant-list">
                      {product.options.colors.map((color) => {
                        const isSelected = selectedColor === color;
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className={`pd-variant-btn ${isSelected ? 'active' : ''}`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {product.options.sizes?.length > 0 && (
                  <div>
                    <h3 className="pd-section-label">
                      Size: <span className="pd-variant-selected">{selectedSize}</span>
                    </h3>
                    <div className="pd-variant-list">
                      {product.options.sizes.map((size) => {
                        const isSelected = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`pd-variant-btn ${isSelected ? 'active' : ''}`}
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

            {/* Quantity & Purchase Actions */}
            {product.stock > 0 ? (
              <div className="pd-actions-block">
                <div className="pd-actions-row">
                  <div className="pd-qty-box">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('dec')}
                      disabled={quantity <= 1}
                      className="pd-qty-btn"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="pd-qty-val">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange('inc')}
                      disabled={quantity >= product.stock}
                      className="pd-qty-btn"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`pd-add-btn ${addedToCart ? 'added' : ''}`}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={18} strokeWidth={2.5} />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="pd-buy-btn"
                  >
                    <span>Buy Now</span>
                    <ArrowRight size={17} />
                  </button>
                </div>

                {cartFeedback && (
                  <div role="alert" className="pd-inline-error">
                    <AlertCircle size={15} />
                    <span>{cartFeedback}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="pd-out-of-stock-box">
                Product temporarily out of stock
              </div>
            )}

            {/* Numbered Commitments 01-03 */}
            <div className="pd-commitments">
              {COMMITMENTS.map((item) => (
                <div key={item.num} className="pd-commitment-item">
                  <span className="pd-commitment-num">{item.num}</span>
                  <span className="pd-commitment-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabbed Section: Reviews & Details */}
        <section className="pd-tabs-section">
          <div className="pd-tabs-header">
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`pd-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              <MessageSquare size={16} />
              <span>Customer Reviews ({totalReviews})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`pd-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            >
              <span>Details</span>
            </button>
          </div>

          <div className="pd-tab-panel">
            {activeTab === 'reviews' ? (
              <div className="pd-reviews-wrap">
                {/* Write Review Form */}
                <div className="pd-review-form-box">
                  <h3 className="pd-review-form-title">Write a Customer Review</h3>

                  {reviewFeedback && (
                    <div
                      role="status"
                      className={`pd-feedback-banner ${reviewFeedback.type === 'success' ? 'success' : 'error'}`}
                    >
                      {reviewFeedback.type === 'success' ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                      <span>{reviewFeedback.message}</span>
                    </div>
                  )}

                  {user ? (
                    <form onSubmit={handleSubmitReview} className="pd-review-form">
                      <div>
                        <label className="pd-form-label">Your Rating</label>
                        <div className="pd-star-picker">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setReviewRating(star)}
                              className="pd-star-btn"
                              aria-label={`Rate ${star} stars`}
                            >
                              <Star
                                size={22}
                                fill={star <= reviewRating ? '#f59e0b' : 'none'}
                                color={star <= reviewRating ? '#f59e0b' : 'var(--text-muted)'}
                              />
                            </button>
                          ))}
                          <span className="pd-star-label">{reviewRating} / 5 Stars</span>
                        </div>
                      </div>

                      <div>
                        <label className="pd-form-label">Your Feedback</label>
                        <textarea
                          rows={3}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your detailed thoughts, packaging quality, product finish..."
                          className="pd-textarea"
                        />
                      </div>

                      <div className="pd-form-submit-row">
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="pd-submit-review-btn"
                        >
                          <Send size={15} />
                          <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="pd-signin-prompt">
                      <span>
                        Please sign in to your account to submit a review and rating for this product.
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="pd-signin-btn"
                      >
                        Sign In Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                  <div className="pd-empty-reviews">
                    <MessageSquare size={36} style={{ margin: '0 auto 12px auto', opacity: 0.45 }} />
                    <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      No reviews yet for this product.
                    </p>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>
                      Be the first customer to share your thoughts!
                    </p>
                  </div>
                ) : (
                  <div className="pd-review-list">
                    {reviews.map((rev) => {
                      const revId = rev.id || rev._id;
                      const isAuthorOrAdmin =
                        user &&
                        (user.id === rev.userId ||
                          user._id === rev.userId ||
                          user.id === rev.user?._id ||
                          user.role === 'admin');
                      const isConfirming = confirmDeleteId === revId;

                      return (
                        <div key={revId} className="pd-review-item">
                          <div className="pd-review-top">
                            <div className="pd-review-author">
                              <div className="pd-author-avatar">
                                {(rev.user?.name || 'C').charAt(0).toUpperCase()}
                              </div>
                              <span className="pd-author-name">
                                {rev.user?.name || 'Verified Customer'}
                              </span>
                            </div>

                            <div className="pd-review-meta">
                              <span className="pd-review-date">
                                {rev.createdAt
                                  ? new Date(rev.createdAt).toLocaleDateString('vi-VN')
                                  : 'Recently'}
                              </span>

                              {isAuthorOrAdmin && (
                                isConfirming ? (
                                  <div className="pd-inline-confirm">
                                    <button
                                      type="button"
                                      disabled={deletingReviewId === revId}
                                      onClick={() => handleConfirmDeleteReview(revId)}
                                      className="pd-confirm-del-btn"
                                    >
                                      {deletingReviewId === revId ? 'Deleting...' : 'Confirm'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="pd-cancel-del-btn"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(revId)}
                                    title="Delete review"
                                    className="pd-trash-btn"
                                    aria-label="Delete review"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )
                              )}
                            </div>
                          </div>

                          <div className="pd-review-stars">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={13}
                                fill={i < rev.rating ? '#f59e0b' : 'none'}
                                color={i < rev.rating ? '#f59e0b' : 'var(--text-muted)'}
                              />
                            ))}
                          </div>

                          <p className="pd-review-comment">{rev.comment}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="pd-details-heading">Technical Specifications & Care</h3>
                <ul className="pd-details-list">
                  <li>Brand: UCONEXT Official</li>
                  <li>Origin: Vietnam / Genuine imported materials</li>
                  <li>Storage: Store in a cool, dry place, avoid direct sunlight</li>
                  <li>Warranty / Expiry: Refer to product packaging</li>
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="pd-related-section">
            <div className="pd-related-header">
              <div>
                <span className="pd-related-eyebrow">Curated For You</span>
                <h2 className="pd-related-title">Related Products</h2>
              </div>
              <Link
                to={categoryId ? `/products?categoryId=${categoryId}` : '/products'}
                className="pd-related-view-all"
              >
                <span>View All</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="pd-related-grid">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel._id || rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className="pd-related-section">
            <div className="pd-related-header">
              <div>
                <span className="pd-related-eyebrow">Your History</span>
                <h2 className="pd-related-title">Recently Viewed</h2>
              </div>
            </div>

            <div className="pd-related-grid">
              {recentlyViewed.map((item) => (
                <ProductCard key={item._id || item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{pageStyles}</style>
    </div>
  );
};

const pageStyles = `
  .pd-page {
    width: 100%;
    min-height: 85vh;
    background: var(--bg-primary);
  }

  .pd-container {
    width: 100%;
    max-width: 1560px;
    margin: 0 auto;
    padding: 28px 48px 88px 48px;
  }

  .pd-breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 28px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .pd-breadcrumb-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.15s ease;
  }

  .pd-breadcrumb-link:hover {
    color: var(--text-primary);
  }

  .pd-breadcrumb-sep {
    opacity: 0.55;
    flex-shrink: 0;
  }

  .pd-breadcrumb-current {
    color: var(--text-primary);
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 340px;
  }

  .pd-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 56px;
    align-items: flex-start;
  }

  /* Gallery */
  .pd-gallery {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .pd-main-image-wrap {
    position: relative;
    padding-top: 100%;
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
  }

  .pd-main-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .pd-thumb-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .pd-thumb-btn {
    position: relative;
    padding-top: 100%;
    border-radius: 10px;
    overflow: hidden;
    cursor: pointer;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 0;
    transition: border-color 0.2s ease;
  }

  .pd-thumb-btn.active {
    border: 2px solid #2454F4;
  }

  .pd-thumb-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Info Column */
  .pd-info-col {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .pd-category-tag {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #2454F4;
    background: rgba(36, 84, 244, 0.1);
    border: 1px solid rgba(36, 84, 244, 0.22);
    padding: 4px 10px;
    border-radius: 6px;
    margin-bottom: 12px;
  }

  .pd-title {
    font-size: clamp(26px, 3vw, 36px);
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.15;
    color: var(--text-primary);
    margin: 0 0 14px 0;
  }

  .pd-rating-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 13px;
  }

  .pd-rating-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.25);
    color: #f59e0b;
    font-weight: 700;
  }

  .pd-review-count {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .pd-dot-sep {
    color: var(--text-muted);
  }

  .pd-stock-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
  }

  .pd-stock-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    display: inline-block;
  }

  .pd-price-box {
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 16px 20px;
  }

  .pd-price-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin-bottom: 4px;
  }

  .pd-price-values {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  .pd-price-current {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-primary);
  }

  .pd-price-original {
    font-size: 15px;
    color: var(--text-muted);
    text-decoration: line-through;
  }

  .pd-section-label {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin: 0 0 8px 0;
  }

  .pd-variant-selected {
    color: var(--text-primary);
    text-transform: none;
    letter-spacing: normal;
  }

  .pd-description {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.65;
    white-space: pre-line;
    margin: 0;
  }

  .pd-variants {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .pd-variant-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pd-variant-btn {
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: var(--bg-secondary);
    color: var(--text-secondary);
    border: 1px solid var(--glass-border);
    transition: all 0.15s ease;
  }

  .pd-variant-btn:hover {
    border-color: #2454F4;
    color: var(--text-primary);
  }

  .pd-variant-btn.active {
    background: #2454F4;
    border-color: #2454F4;
    color: #ffffff;
  }

  /* Actions */
  .pd-actions-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
  }

  .pd-actions-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .pd-qty-box {
    display: inline-flex;
    align-items: center;
    height: 48px;
    padding: 0 4px;
    border-radius: 10px;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
  }

  .pd-qty-btn {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    border-radius: 6px;
  }

  .pd-qty-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .pd-qty-val {
    min-width: 36px;
    text-align: center;
    font-weight: 700;
    font-size: 15px;
    color: var(--text-primary);
  }

  .pd-add-btn {
    flex: 1;
    min-width: 160px;
    height: 48px;
    padding: 0 22px;
    border-radius: 10px;
    border: 1px solid #2454F4;
    background: #2454F4;
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  .pd-add-btn:hover {
    background: #1b3ec8;
    border-color: #1b3ec8;
  }

  .pd-add-btn.added {
    background: #10b981;
    border-color: #10b981;
  }

  .pd-buy-btn {
    height: 48px;
    padding: 0 22px;
    border-radius: 10px;
    border: 1px solid var(--glass-border);
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }

  .pd-buy-btn:hover {
    border-color: #2454F4;
    color: #2454F4;
  }

  .pd-inline-error {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    color: #ef4444;
  }

  .pd-out-of-stock-box {
    padding: 16px;
    border-radius: 10px;
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    text-align: center;
    color: var(--text-muted);
    font-weight: 600;
    font-size: 14px;
  }

  /* Commitments */
  .pd-commitments {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid var(--glass-border);
  }

  .pd-commitment-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pd-commitment-num {
    font-size: 11px;
    font-weight: 800;
    color: #2454F4;
    letter-spacing: 0.04em;
  }

  .pd-commitment-text {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
  }

  /* Tabs */
  .pd-tabs-section {
    margin-top: 64px;
  }

  .pd-tabs-header {
    display: flex;
    gap: 32px;
    border-bottom: 1px solid var(--glass-border);
    margin-bottom: 24px;
  }

  .pd-tab-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-weight: 700;
    font-size: 15px;
    padding: 0 0 14px 0;
    cursor: pointer;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: color 0.15s ease;
  }

  .pd-tab-btn.active {
    color: var(--text-primary);
  }

  .pd-tab-btn.active::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: #2454F4;
  }

  .pd-tab-panel {
    background: var(--bg-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 16px;
    padding: 28px;
  }

  .pd-reviews-wrap {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .pd-review-form-box {
    background: var(--bg-primary);
    border: 1px solid var(--glass-border);
    border-radius: 12px;
    padding: 22px;
  }

  .pd-review-form-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 14px 0;
  }

  .pd-feedback-banner {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 14px;
    font-size: 13px;
    font-weight: 600;
  }

  .pd-feedback-banner.success {
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.3);
    color: #10b981;
  }

  .pd-feedback-banner.error {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .pd-review-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .pd-form-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .pd-star-picker {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .pd-star-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: inline-flex;
    align-items: center;
  }

  .pd-star-label {
    font-size: 13px;
    font-weight: 600;
    color: #f59e0b;
    margin-left: 6px;
  }

  .pd-textarea {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid var(--glass-border);
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 14px;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;
  }

  .pd-textarea:focus {
    border-color: #2454F4;
  }

  .pd-form-submit-row {
    display: flex;
    justify-content: flex-end;
  }

  .pd-submit-review-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    background: #2454F4;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .pd-submit-review-btn:hover:not(:disabled) {
    background: #1b3ec8;
  }

  .pd-submit-review-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .pd-signin-prompt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .pd-signin-btn {
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    background: #2454F4;
    color: #ffffff;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  .pd-empty-reviews {
    text-align: center;
    padding: 36px 20px;
    color: var(--text-muted);
  }

  .pd-review-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .pd-review-item {
    border-bottom: 1px solid var(--glass-border);
    padding-bottom: 18px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .pd-review-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .pd-review-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pd-review-author {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pd-author-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #2454F4;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
  }

  .pd-author-name {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 14px;
  }

  .pd-review-meta {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pd-review-date {
    font-size: 12px;
    color: var(--text-muted);
  }

  .pd-trash-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 4px;
    display: inline-flex;
    align-items: center;
    border-radius: 6px;
  }

  .pd-trash-btn:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .pd-inline-confirm {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .pd-confirm-del-btn {
    padding: 4px 10px;
    border-radius: 6px;
    border: none;
    background: #ef4444;
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .pd-cancel-del-btn {
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--glass-border);
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .pd-review-stars {
    display: flex;
    gap: 2px;
  }

  .pd-review-comment {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.6;
    margin: 2px 0 0 0;
  }

  .pd-details-heading {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0 0 14px 0;
  }

  .pd-details-list {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.8;
    padding-left: 20px;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* Related Products */
  .pd-related-section {
    margin-top: 72px;
  }

  .pd-related-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }

  .pd-related-eyebrow {
    display: block;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #2454F4;
    margin-bottom: 4px;
  }

  .pd-related-title {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0;
  }

  .pd-related-view-all {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 700;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .pd-related-view-all:hover {
    color: #2454F4;
  }

  .pd-related-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 20px;
  }

  @media (max-width: 1024px) {
    .pd-container {
      padding: 24px 28px 64px 28px;
    }

    .pd-split {
      gap: 36px;
    }

    .pd-related-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 820px) {
    .pd-split {
      grid-template-columns: 1fr;
      gap: 28px;
    }

    .pd-commitments {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }

  @media (max-width: 640px) {
    .pd-container {
      padding: 20px 16px 56px 16px;
    }

    .pd-tab-panel {
      padding: 18px;
    }

    .pd-related-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default ProductDetail;
