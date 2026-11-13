import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import {
  formatVND,
  translateCategoryName,
  getSafeImageUrl,
  handleImageError,
} from '../utils/formatters';

const TrendingSpotlight = ({ products = [] }) => {
  const { isDark } = useTheme();
  const { addToCart } = useCart();
  const trackRef = useRef(null);
  const timerRef = useRef(null);

  const [addedId, setAddedId] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const updateScrollButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [products.length]);

  if (!products || products.length === 0) return null;

  const items = products.slice(0, 8);

  const scrollByCards = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const step = Math.max(el.clientWidth * 0.75, 300);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const handleQuickAdd = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultColor = product.options?.colors?.length > 0 ? product.options.colors[0] : null;
    const defaultSize = product.options?.sizes?.length > 0 ? product.options.sizes[0] : null;
    addToCart(product, 1, defaultColor, defaultSize);
    const pid = product._id || product.id;
    setAddedId(pid);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="ts-strip-wrap">
      {/* Subtle floating nav arrows aligned to top-right */}
      <div className="ts-controls">
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          disabled={!canScrollLeft}
          className="ts-nav-btn"
          aria-label="Previous trending products"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCards(1)}
          disabled={!canScrollRight}
          className="ts-nav-btn"
          aria-label="Next trending products"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={trackRef}
        onScroll={updateScrollButtons}
        className="ts-track"
      >
        {items.map((prod, idx) => {
          const pid = prod._id || prod.id;
          const isAdded = addedId === pid;
          const rankLabel = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={pid}
              className="ts-card"
              style={{
                backgroundColor: isDark ? '#111626' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
              }}
            >
              <Link to={`/product/${pid}`} className="ts-card-media">
                <img
                  src={getSafeImageUrl(prod.image)}
                  alt={prod.name}
                  loading="lazy"
                  onError={handleImageError}
                  className="ts-card-img"
                />
                <span className="ts-rank-pill">{rankLabel}</span>
              </Link>

              <div className="ts-card-body">
                <span className="ts-card-cat">
                  {translateCategoryName(prod.category?.name || 'Product')}
                </span>

                <Link to={`/product/${pid}`} className="ts-card-title">
                  {prod.name}
                </Link>

                <div className="ts-card-footer">
                  <span className="ts-card-price">{formatVND(prod.price)}</span>
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, prod)}
                    className={`ts-card-add ${isAdded ? 'added' : ''}`}
                    aria-label={`Add ${prod.name} to cart`}
                  >
                    {isAdded ? <Check size={15} strokeWidth={2.5} /> : <ShoppingCart size={15} />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .ts-strip-wrap {
          position: relative;
        }

        .ts-controls {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-bottom: 14px;
        }

        .ts-nav-btn {
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid var(--glass-border);
          background: var(--bg-secondary);
          color: var(--text-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;
        }

        .ts-nav-btn:hover:not(:disabled) {
          border-color: #2454F4;
          color: #2454F4;
        }

        .ts-nav-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .ts-track {
          display: grid;
          grid-auto-flow: column;
          grid-auto-columns: calc((100% - 60px) / 4);
          gap: 20px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 4px;
        }

        .ts-track::-webkit-scrollbar {
          display: none;
        }

        .ts-card {
          scroll-snap-align: start;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
        }

        .ts-card:hover {
          transform: translateY(-3px);
          border-color: rgba(36, 84, 244, 0.4) !important;
        }

        .ts-card-media {
          position: relative;
          display: block;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: var(--bg-secondary);
        }

        .ts-card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ts-card:hover .ts-card-img {
          transform: scale(1.04);
        }

        .ts-rank-pill {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #ffffff;
          background: rgba(11, 19, 43, 0.78);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 6px;
          padding: 3px 8px;
        }

        .ts-card-body {
          padding: 14px 16px 16px 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .ts-card-cat {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #2454F4;
          margin-bottom: 5px;
        }

        .ts-card-title {
          font-size: 14.5px;
          font-weight: 600;
          line-height: 1.38;
          color: var(--text-primary);
          text-decoration: none;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ts-card-title:hover {
          color: #2454F4;
        }

        .ts-card-footer {
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .ts-card-price {
          font-size: 15.5px;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.015em;
        }

        .ts-card-add {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: transparent;
          color: var(--text-primary);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          flex-shrink: 0;
        }

        .ts-card-add:hover {
          background: #2454F4;
          border-color: #2454F4;
          color: #ffffff;
        }

        .ts-card-add.added {
          background: #10b981;
          border-color: #10b981;
          color: #ffffff;
        }

        @media (max-width: 1120px) {
          .ts-track {
            grid-auto-columns: calc((100% - 20px) / 2.2);
          }
        }

        @media (max-width: 640px) {
          .ts-track {
            grid-auto-columns: 78%;
            gap: 14px;
          }
        }
      `}</style>
    </div>
  );
};

export default TrendingSpotlight;
