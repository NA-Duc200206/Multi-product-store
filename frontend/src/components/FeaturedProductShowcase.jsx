import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { formatVND, translateCategoryName, getSafeImageUrl, handleImageError } from '../utils/formatters';

const PROMO_LABELS = ['FEATURED', 'BEST SELLER', 'TRENDING', 'NEW ARRIVAL', 'EDITOR PICK'];

const getCategoryAuraColor = (categoryName = '') => {
  const name = categoryName.toLowerCase();
  if (name.includes('cosmetic') || name.includes('beauty')) return 'rgba(236, 72, 153, 0.28)';
  if (name.includes('fashion')) return 'rgba(99, 102, 241, 0.28)';
  if (name.includes('accessor') || name.includes('watch')) return 'rgba(245, 158, 11, 0.25)';
  if (name.includes('home')) return 'rgba(16, 185, 129, 0.25)';
  return 'rgba(36, 84, 244, 0.30)';
};

const FeaturedProductShowcase = ({ products = [], loading = false }) => {
  const { isDark } = useTheme();
  const { addToCart } = useCart();
  const shouldReduceMotion = useReducedMotion();

  const featuredItems = products.slice(0, 12);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const addedTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (featuredItems.length > 0 && activeIndex >= featuredItems.length) {
      setActiveIndex(0);
    }
  }, [featuredItems.length, activeIndex]);

  // Preload adjacent product images so horizontal slides never stutter
  useEffect(() => {
    if (featuredItems.length <= 1) return;
    const nextIdx = (activeIndex + 1) % featuredItems.length;
    const prevIdx = activeIndex === 0 ? featuredItems.length - 1 : activeIndex - 1;
    [featuredItems[nextIdx], featuredItems[prevIdx]].forEach((item) => {
      if (item?.image) {
        const img = new Image();
        img.src = getSafeImageUrl(item.image);
      }
    });
  }, [activeIndex, featuredItems]);

  const goToNext = useCallback(() => {
    if (featuredItems.length <= 1) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % featuredItems.length);
  }, [featuredItems.length]);

  const goToPrev = useCallback(() => {
    if (featuredItems.length <= 1) return;
    setDirection(-1);
    setActiveIndex((prev) => (prev === 0 ? featuredItems.length - 1 : prev - 1));
  }, [featuredItems.length]);

  const goToSlide = useCallback(
    (idx) => {
      if (idx === activeIndex || featuredItems.length <= 1) return;
      setDirection(idx > activeIndex ? 1 : -1);
      setActiveIndex(idx);
    },
    [activeIndex, featuredItems.length]
  );

  useEffect(() => {
    if (loading || featuredItems.length <= 1 || isPaused || shouldReduceMotion) {
      return;
    }
    const timer = setInterval(goToNext, 4200);
    return () => clearInterval(timer);
  }, [loading, featuredItems.length, isPaused, shouldReduceMotion, goToNext]);

  const currentProduct = featuredItems[activeIndex];

  const handleAddToCart = () => {
    if (!currentProduct) return;
    const defaultColor = currentProduct.options?.colors?.length > 0 ? currentProduct.options.colors[0] : null;
    const defaultSize = currentProduct.options?.sizes?.length > 0 ? currentProduct.options.sizes[0] : null;
    addToCart(currentProduct, 1, defaultColor, defaultSize);
    const pid = currentProduct._id || currentProduct.id;
    setAddedId(pid);
    if (addedTimerRef.current) clearTimeout(addedTimerRef.current);
    addedTimerRef.current = setTimeout(() => setAddedId(null), 1500);
  };

  const getPromoLabel = (product, idx) => {
    if (product?.originalPrice && product.originalPrice > product.price) return 'BEST SELLER';
    if (product?.rating >= 4.8) return 'TRENDING';
    return PROMO_LABELS[idx % PROMO_LABELS.length];
  };

  const horizontalVariants = shouldReduceMotion
    ? {
        enter: { opacity: 0 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (dir) => ({
          x: dir > 0 ? 64 : -64,
          opacity: 0,
          scale: 0.985,
        }),
        center: {
          x: 0,
          opacity: 1,
          scale: 1,
        },
        exit: (dir) => ({
          x: dir > 0 ? -64 : 64,
          opacity: 0,
          scale: 0.985,
        }),
      };

  const slideTransition = shouldReduceMotion
    ? { duration: 0.2 }
    : {
        x: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 },
        opacity: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <section
      aria-label="Featured Products Showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      style={{
        width: '100%',
        background: isDark
          ? 'linear-gradient(180deg, #0d1222 0%, #090c16 100%)'
          : 'linear-gradient(180deg, #ffffff 0%, #f4f7fb 100%)',
        borderBottom: '1px solid var(--glass-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Dynamic Ambient Backdrop synced to active product */}
      {!loading && currentProduct && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={`bg-${currentProduct._id || currentProduct.id || activeIndex}`}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1.12 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.2 : 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: 'absolute',
                inset: '-10%',
                backgroundImage: `url("${getSafeImageUrl(currentProduct.image)}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(72px) saturate(1.45)',
                opacity: isDark ? 0.28 : 0.16,
              }}
            />
          </AnimatePresence>

          {/* Category-tinted radial aura */}
          <motion.div
            animate={{
              background: `radial-gradient(circle at ${activeIndex % 2 === 0 ? '26% 45%' : '34% 55%'}, ${getCategoryAuraColor(currentProduct.category?.name)}, transparent 62%)`,
            }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isDark ? 0.9 : 0.65,
            }}
          />

          {/* Readability scrim */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: isDark
                ? 'linear-gradient(90deg, rgba(9, 12, 22, 0.35) 0%, rgba(9, 12, 22, 0.68) 55%, rgba(9, 12, 22, 0.82) 100%)'
                : 'linear-gradient(90deg, rgba(255, 255, 255, 0.45) 0%, rgba(248, 250, 252, 0.78) 55%, rgba(244, 247, 251, 0.9) 100%)',
            }}
          />
        </div>
      )}

      <style>{`
        .fps-full-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1560px;
          margin: 0 auto;
          padding: 40px 48px 40px 48px;
        }
        .fps-stage-grid {
          display: grid;
          grid-template-columns: 1.12fr 0.88fr;
          gap: 56px;
          align-items: center;
          min-height: 410px;
        }
        .fps-image-frame {
          position: relative;
          width: 100%;
          height: 410px;
          border-radius: 16px;
          overflow: hidden;
          background: ${isDark ? '#141a2e' : '#e8eef7'};
          border: 1px solid var(--glass-border);
          display: block;
        }
        .fps-image-frame img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fps-image-frame:hover img {
          transform: scale(1.03);
        }
        @media (max-width: 1120px) {
          .fps-full-inner {
            padding: 32px 28px;
          }
          .fps-stage-grid {
            gap: 32px;
            min-height: 340px;
          }
          .fps-image-frame {
            height: 340px;
          }
        }
        @media (max-width: 768px) {
          .fps-full-inner {
            padding: 20px 16px 28px 16px;
          }
          .fps-stage-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            min-height: auto;
          }
          .fps-image-frame {
            height: 260px;
          }
        }
      `}</style>

      <div className="fps-full-inner">
        {loading || !currentProduct ? (
          <div className="fps-stage-grid">
            <div className="fps-image-frame" style={{ background: 'var(--skeleton-base)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '130px', height: '22px', borderRadius: '6px', background: 'var(--skeleton-base)' }} />
              <div style={{ width: '85%', height: '40px', borderRadius: '8px', background: 'var(--skeleton-base)' }} />
              <div style={{ width: '95%', height: '48px', borderRadius: '8px', background: 'var(--skeleton-base)' }} />
              <div style={{ width: '140px', height: '30px', borderRadius: '6px', background: 'var(--skeleton-base)' }} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <div style={{ width: '150px', height: '46px', borderRadius: '10px', background: 'var(--skeleton-base)' }} />
                <div style={{ width: '140px', height: '46px', borderRadius: '10px', background: 'var(--skeleton-base)' }} />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Main Horizontal Showcase Stage */}
            <div style={{ overflow: 'hidden', position: 'relative' }}>
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentProduct._id || currentProduct.id || activeIndex}
                  custom={direction}
                  variants={horizontalVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTransition}
                  style={{ willChange: 'transform, opacity', width: '100%' }}
                  className="fps-stage-grid"
                >
                  {/* Left: Prominent Product Photography */}
                  <Link
                    to={`/product/${currentProduct._id || currentProduct.id}`}
                    className="fps-image-frame"
                  >
                    <img
                      src={getSafeImageUrl(currentProduct.image)}
                      alt={currentProduct.name}
                      onError={handleImageError}
                    />
                  </Link>

                  {/* Right: Product Information & Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        marginBottom: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: isDark ? 'rgba(36, 84, 244, 0.22)' : 'rgba(36, 84, 244, 0.1)',
                            color: isDark ? '#93c5fd' : '#2454F4',
                            fontSize: '11px',
                            fontWeight: '700',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {getPromoLabel(currentProduct, activeIndex)}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {translateCategoryName(
                            currentProduct.category?.name ||
                              currentProduct.categoryId?.name ||
                              currentProduct.category ||
                              'Collection'
                          )}
                        </span>
                      </div>

                      {featuredItems.length > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={goToPrev}
                            aria-label="Previous featured product"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid var(--glass-border)',
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <ChevronLeft size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={goToNext}
                            aria-label="Next featured product"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid var(--glass-border)',
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <ChevronRight size={15} />
                          </button>
                        </div>
                      )}
                    </div>

                    <h1
                      style={{
                        fontSize: 'clamp(26px, 2.8vw, 38px)',
                        fontWeight: '800',
                        color: isDark ? '#f8fafc' : '#0b132b',
                        lineHeight: '1.14',
                        letterSpacing: '-0.025em',
                        margin: '0 0 12px 0',
                        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {currentProduct.name}
                    </h1>

                    <p
                      style={{
                        fontSize: '14.5px',
                        lineHeight: '1.5',
                        color: 'var(--text-secondary)',
                        margin: '0 0 22px 0',
                        maxWidth: '480px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {currentProduct.description ||
                        'Authenticated UCONEXT selection with official warranty.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '26px' }}>
                      <span
                        style={{
                          fontSize: '28px',
                          fontWeight: '800',
                          color: isDark ? '#f8fafc' : '#0b132b',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {formatVND(currentProduct.price)}
                      </span>
                      {currentProduct.originalPrice && currentProduct.originalPrice > currentProduct.price && (
                        <span
                          style={{
                            fontSize: '15px',
                            color: 'var(--text-muted)',
                            textDecoration: 'line-through',
                          }}
                        >
                          {formatVND(currentProduct.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <Link
                        to={`/product/${currentProduct._id || currentProduct.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          height: '46px',
                          padding: '0 26px',
                          borderRadius: '10px',
                          backgroundColor: '#2454F4',
                          color: '#ffffff',
                          fontSize: '14px',
                          fontWeight: '600',
                          textDecoration: 'none',
                          transition: 'background-color 0.2s ease, transform 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1b3ec8';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#2454F4';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span>View Product</span>
                        <ArrowRight size={15} />
                      </Link>

                      {currentProduct.stock !== 0 && (() => {
                        const isAdded = addedId === (currentProduct._id || currentProduct.id);
                        return (
                          <button
                            type="button"
                            onClick={handleAddToCart}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              height: '46px',
                              padding: '0 22px',
                              borderRadius: '10px',
                              backgroundColor: isAdded
                                ? '#10b981'
                                : isDark
                                ? 'rgba(255, 255, 255, 0.05)'
                                : '#ffffff',
                              border: `1px solid ${
                                isAdded
                                  ? '#10b981'
                                  : isDark
                                  ? 'rgba(255, 255, 255, 0.12)'
                                  : 'rgba(15, 23, 42, 0.12)'
                              }`,
                              color: isAdded ? '#ffffff' : isDark ? '#f8fafc' : '#0b132b',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.15s ease',
                              transform: isAdded ? 'scale(1.02)' : 'scale(1)',
                            }}
                            onMouseEnter={(e) => {
                              if (!isAdded) e.currentTarget.style.borderColor = '#2454F4';
                            }}
                            onMouseLeave={(e) => {
                              if (!isAdded) {
                                e.currentTarget.style.borderColor = isDark
                                  ? 'rgba(255, 255, 255, 0.12)'
                                  : 'rgba(15, 23, 42, 0.12)';
                              }
                            }}
                          >
                            {isAdded ? <Check size={16} strokeWidth={2.5} /> : <ShoppingBag size={15} />}
                            <span>{isAdded ? 'Added to Cart' : 'Add to Cart'}</span>
                          </button>
                        );
                      })()}
                    </div>

                    {/* Minimal Inline Carousel Indicator (No Extra Miniature Product Cards) */}
                    {featuredItems.length > 1 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          marginTop: '28px',
                          paddingTop: '18px',
                          borderTop: '1px solid var(--glass-border)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {featuredItems.map((item, idx) => {
                            const isActive = idx === activeIndex;
                            return (
                              <button
                                key={item._id || item.id || idx}
                                type="button"
                                onClick={() => goToSlide(idx)}
                                aria-label={`Show featured product ${idx + 1}: ${item.name}`}
                                style={{
                                  width: isActive ? '24px' : '7px',
                                  height: '7px',
                                  borderRadius: '999px',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  backgroundColor: isActive
                                    ? '#2454F4'
                                    : isDark
                                    ? 'rgba(255, 255, 255, 0.18)'
                                    : 'rgba(15, 23, 42, 0.15)',
                                  transition: 'width 0.25s ease, background-color 0.25s ease',
                                }}
                              />
                            );
                          })}
                        </div>

                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.06em',
                            flexShrink: 0,
                          }}
                        >
                          {String(activeIndex + 1).padStart(2, '0')} / {String(featuredItems.length).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProductShowcase;
