import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { ProductListSkeleton } from '../components/SkeletonLoader';
import {
  Search,
  X,
  SlidersHorizontal,
  ShoppingCart,
  Check,
  Star,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import {
  formatVND,
  translateCategoryName,
  getSafeImageUrl,
  handleImageError,
} from '../utils/formatters';

const CATEGORY_TITLE_MAP = {
  'Smart Tech, Audio': 'Smart Technology',
  'Fashion, Apparel': 'Fashion',
  'Watches, Accessories': 'Watches',
  'Home Living': 'Home Living',
  'Beauty, Skincare': 'Beauty',
};

const NAVBAR_CATEGORY_ALIASES = {
  tech: 'Electronics',
  fashion: 'Fashion',
  beauty: 'Cosmetics',
  accessories: 'Accessories',
  living: 'Home & Living',
};

const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-500k', label: 'Under 500,000₫', min: 0, max: 500000 },
  { id: '500k-2m', label: '500,000₫ – 2,000,000₫', min: 500000, max: 2000000 },
  { id: '2m-10m', label: '2,000,000₫ – 10,000,000₫', min: 2000000, max: 10000000 },
  { id: 'over-10m', label: 'Over 10,000,000₫', min: 10000000, max: Infinity },
];

const RATING_OPTIONS = [
  { value: 0, label: 'All Ratings' },
  { value: 4.5, label: '4.5★+' },
  { value: 4.0, label: '4.0★+' },
];

const PAGE_SIZE = 12;

const getDisplayCategoryName = (rawName = '') => {
  const translated = translateCategoryName(rawName);
  return CATEGORY_TITLE_MAP[translated] || translated || 'Collection';
};

const ShopProductCard = ({ product }) => {
  const { isDark } = useTheme();
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const hasRating = typeof product.rating === 'number' && product.rating > 0;
  const categoryName = getDisplayCategoryName(
    product.category?.name || product.categoryId?.name || product.category || ''
  );

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    const defaultColor = product.options?.colors?.length > 0 ? product.options.colors[0] : null;
    const defaultSize = product.options?.sizes?.length > 0 ? product.options.sizes[0] : null;
    addToCart(product, 1, defaultColor, defaultSize);
    setIsAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsAdded(false), 1400);
  };

  return (
    <Link
      to={`/product/${product._id || product.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        borderRadius: '14px',
        padding: '12px',
        background: isDark ? 'rgba(18, 22, 36, 0.72)' : '#ffffff',
        border: '1px solid',
        borderColor: isHovered ? 'rgba(36, 84, 244, 0.45)' : 'var(--glass-border)',
        transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered
          ? isDark
            ? '0 14px 28px rgba(0, 0, 0, 0.4)'
            : '0 14px 28px rgba(15, 23, 42, 0.08)'
          : 'none',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: isDark ? '#0e1320' : '#f1f5f9',
          marginBottom: '12px',
        }}
      >
        <img
          src={getSafeImageUrl(product.image)}
          alt={product.name}
          loading="lazy"
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        {hasDiscount && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              background: '#0f172a',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700',
              padding: '3px 7px',
              borderRadius: '5px',
            }}
          >
            -{discountPercent}%
          </span>
        )}
        {product.stock === 0 && (
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.94)',
              color: 'var(--text-secondary)',
              fontSize: '10px',
              fontWeight: '700',
              padding: '3px 7px',
              borderRadius: '5px',
              border: '1px solid var(--glass-border)',
              letterSpacing: '0.04em',
            }}
          >
            OUT OF STOCK
          </span>
        )}
      </div>

      <span
        style={{
          fontSize: '11px',
          fontWeight: '700',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#2454F4',
          marginBottom: '4px',
        }}
      >
        {categoryName}
      </span>

      <h3
        style={{
          fontSize: '14.5px',
          fontWeight: '600',
          color: isDark ? '#f8fafc' : '#0b132b',
          lineHeight: '1.35',
          margin: '0 0 8px 0',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {product.name}
      </h3>

      {hasRating && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
          <Star size={12} fill="#f59e0b" color="#f59e0b" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
            {product.rating.toFixed(1)}
            {product.reviewCount ? ` (${product.reviewCount})` : ''}
          </span>
        </div>
      )}

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          paddingTop: '10px',
          borderTop: '1px solid var(--glass-border)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {hasDiscount && (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                textDecoration: 'line-through',
              }}
            >
              {formatVND(product.originalPrice)}
            </span>
          )}
          <span
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: isDark ? '#f8fafc' : '#0b132b',
            }}
          >
            {formatVND(product.price)}
          </span>
        </div>

        {product.stock !== 0 && (
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={isAdded ? `Added ${product.name} to cart` : `Add ${product.name} to cart`}
            title={isAdded ? 'Added to cart' : 'Add to cart'}
            style={{
              width: isAdded ? 'auto' : '34px',
              minWidth: '34px',
              height: '34px',
              padding: isAdded ? '0 10px' : '0',
              borderRadius: '9px',
              background: isAdded
                ? '#10b981'
                : isHovered
                ? '#2454F4'
                : isDark
                ? 'rgba(255, 255, 255, 0.05)'
                : '#f8fafc',
              color: isAdded || isHovered ? '#ffffff' : 'var(--text-primary)',
              border: '1px solid',
              borderColor: isAdded || isHovered ? 'transparent' : 'var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              transform: isAdded ? 'scale(1.06)' : 'scale(1)',
              flexShrink: 0,
            }}
          >
            {isAdded ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span>Added</span>
              </>
            ) : (
              <ShoppingCart size={14} />
            )}
          </button>
        )}
      </div>
    </Link>
  );
};

const Shop = () => {
  const { isDark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(() => {
    const q = searchParams.get('search') || '';
    return NAVBAR_CATEGORY_ALIASES[q.toLowerCase()] ? '' : q;
  });
  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get('categoryId') || 'all'
  );
  const [priceRangeId, setPriceRangeId] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync URL query params into local filter state when navigating from Navbar or Home
  useEffect(() => {
    const paramCat = searchParams.get('categoryId');
    const paramSearch = searchParams.get('search') || '';

    if (paramCat) {
      setActiveCategory(paramCat);
      setSearchTerm(paramSearch);
    } else if (paramSearch && NAVBAR_CATEGORY_ALIASES[paramSearch.toLowerCase()]) {
      const targetRawName = NAVBAR_CATEGORY_ALIASES[paramSearch.toLowerCase()];
      const matchedCat = categories.find(
        (c) => (c.name || '').toLowerCase() === targetRawName.toLowerCase()
      );
      if (matchedCat) {
        setActiveCategory(String(matchedCat._id || matchedCat.id));
        setSearchTerm('');
      } else {
        setSearchTerm(paramSearch);
      }
    } else {
      if (!paramCat) setActiveCategory('all');
      setSearchTerm(paramSearch);
    }
    setVisibleCount(PAGE_SIZE);
  }, [searchParams, categories]);

  useEffect(() => {
    let isMounted = true;
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.products.getAll({ limit: 1200 }),
          api.categories.getAll(),
        ]);
        if (!isMounted) return;
        setAllProducts(prodRes.products || []);
        setCategories(catRes.categories || []);
      } catch (err) {
        console.error('Failed to load catalog:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {};
    allProducts.forEach((p) => {
      const catId = String(p.category?._id || p.categoryId?._id || p.categoryId || '');
      if (catId) {
        counts[catId] = (counts[catId] || 0) + 1;
      }
    });
    return counts;
  }, [allProducts]);

  const activeCategoryObj = useMemo(
    () => categories.find((c) => String(c._id || c.id) === String(activeCategory)),
    [categories, activeCategory]
  );

  const selectedPriceRange = useMemo(
    () => PRICE_RANGES.find((r) => r.id === priceRangeId) || PRICE_RANGES[0],
    [priceRangeId]
  );

  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    if (activeCategory !== 'all') {
      list = list.filter((p) => {
        const catId = String(p.category?._id || p.categoryId?._id || p.categoryId || '');
        return catId === String(activeCategory);
      });
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = getDisplayCategoryName(
          p.category?.name || p.categoryId?.name || ''
        ).toLowerCase();
        return name.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }

    if (selectedPriceRange.id !== 'all') {
      list = list.filter(
        (p) => p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max
      );
    }

    if (inStockOnly) {
      list = list.filter((p) => (p.stock ?? 0) > 0);
    }

    if (onSaleOnly) {
      list = list.filter((p) => Boolean(p.originalPrice && p.originalPrice > p.price));
    }

    if (minRating > 0) {
      list = list.filter((p) => (p.rating || 0) >= minRating);
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'rating-desc') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'discount-desc') {
      const calcDisc = (p) =>
        p.originalPrice && p.originalPrice > p.price
          ? (p.originalPrice - p.price) / p.originalPrice
          : 0;
      list.sort((a, b) => calcDisc(b) - calcDisc(a));
    } else {
      list.sort((a, b) => {
        const scoreA = (a.rating || 0) + (a.originalPrice > a.price ? 0.4 : 0);
        const scoreB = (b.rating || 0) + (b.originalPrice > b.price ? 0.4 : 0);
        return scoreB - scoreA;
      });
    }

    return list;
  }, [
    allProducts,
    activeCategory,
    searchTerm,
    selectedPriceRange,
    inStockOnly,
    onSaleOnly,
    minRating,
    sortBy,
  ]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const updateUrlParams = (nextCat, nextSearch) => {
    const next = new URLSearchParams();
    if (nextCat && nextCat !== 'all') next.set('categoryId', nextCat);
    if (nextSearch && nextSearch.trim()) next.set('search', nextSearch.trim());
    setSearchParams(next, { replace: true });
  };

  const handleSelectCategory = (catId) => {
    setActiveCategory(catId);
    setVisibleCount(PAGE_SIZE);
    updateUrlParams(catId, searchTerm);
  };

  const handleSearchInput = (val) => {
    setSearchTerm(val);
    setVisibleCount(PAGE_SIZE);
    updateUrlParams(activeCategory, val);
  };

  const handleResetFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
    setPriceRangeId('all');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setMinRating(0);
    setSortBy('featured');
    setVisibleCount(PAGE_SIZE);
    setSearchParams({}, { replace: true });
  };

  const activeFilterChips = [];
  if (activeCategoryObj) {
    activeFilterChips.push({
      key: 'category',
      label: getDisplayCategoryName(activeCategoryObj.name),
      onRemove: () => handleSelectCategory('all'),
    });
  }
  if (searchTerm.trim()) {
    activeFilterChips.push({
      key: 'search',
      label: `Search: "${searchTerm.trim()}"`,
      onRemove: () => handleSearchInput(''),
    });
  }
  if (selectedPriceRange.id !== 'all') {
    activeFilterChips.push({
      key: 'price',
      label: selectedPriceRange.label,
      onRemove: () => setPriceRangeId('all'),
    });
  }
  if (inStockOnly) {
    activeFilterChips.push({
      key: 'stock',
      label: 'In Stock Only',
      onRemove: () => setInStockOnly(false),
    });
  }
  if (onSaleOnly) {
    activeFilterChips.push({
      key: 'sale',
      label: 'On Sale',
      onRemove: () => setOnSaleOnly(false),
    });
  }
  if (minRating > 0) {
    activeFilterChips.push({
      key: 'rating',
      label: `${minRating}★+`,
      onRemove: () => setMinRating(0),
    });
  }

  const pageTitle = activeCategoryObj
    ? getDisplayCategoryName(activeCategoryObj.name)
    : searchTerm.trim()
    ? `Results for "${searchTerm.trim()}"`
    : 'All Products';

  return (
    <div style={{ width: '100%', minHeight: '85vh', paddingBottom: '88px' }}>
      <style>{`
        .shop-container {
          width: 100%;
          max-width: 1560px;
          margin: 0 auto;
          padding: 28px 48px 0 48px;
        }
        .shop-layout {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr);
          gap: 32px;
          align-items: start;
        }
        .shop-sidebar {
          position: sticky;
          top: 90px;
          max-height: calc(100vh - 110px);
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          border-radius: 16px;
          padding: 20px;
          background: ${isDark ? 'rgba(18, 22, 36, 0.72)' : '#ffffff'};
          border: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .shop-sidebar::-webkit-scrollbar {
          display: none;
        }
        .shop-products-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
        }
        .shop-mobile-filter-btn {
          display: none;
        }
        .shop-header-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: nowrap;
        }
        .shop-search-wrap {
          position: relative;
          width: 280px;
          flex-shrink: 0;
        }
        .shop-sort-select {
          height: 42px;
          padding: 0 14px;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: ${isDark ? '#121624' : '#ffffff'};
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          outline: none;
          flex-shrink: 0;
        }
        @media (max-width: 1280px) {
          .shop-products-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 980px) {
          .shop-container {
            padding: 24px 28px 0 28px;
          }
          .shop-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .shop-sidebar {
            position: static;
            max-height: none;
            overflow-y: visible;
            display: ${mobileFiltersOpen ? 'flex' : 'none'};
          }
          .shop-mobile-filter-btn {
            display: inline-flex;
          }
        }
        @media (max-width: 680px) {
          .shop-container {
            padding: 20px 16px 0 16px;
          }
          .shop-header-controls {
            width: 100%;
            flex-wrap: wrap;
          }
          .shop-search-wrap {
            width: 100%;
            flex: 1 1 100%;
          }
          .shop-products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }
        }
      `}</style>

      <div className="shop-container">
        {/* Compact Breadcrumb & Catalog Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            paddingBottom: '22px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--glass-border)',
          }}
        >
          <div>
            <nav
              aria-label="Breadcrumb"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12.5px',
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '600' }}>
                Home
              </Link>
              <ChevronRight size={13} />
              <Link
                to="/products"
                onClick={handleResetFilters}
                style={{
                  color: activeCategoryObj ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}
              >
                Shop
              </Link>
              {activeCategoryObj && (
                <>
                  <ChevronRight size={13} />
                  <span style={{ color: '#2454F4', fontWeight: '700' }}>
                    {getDisplayCategoryName(activeCategoryObj.name)}
                  </span>
                </>
              )}
            </nav>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: 'clamp(24px, 2.5vw, 32px)',
                  fontWeight: '800',
                  color: isDark ? '#f8fafc' : '#0b132b',
                  letterSpacing: '-0.025em',
                  margin: 0,
                  fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                }}
              >
                {pageTitle}
              </h1>
              <span style={{ fontSize: '13.5px', color: 'var(--text-muted)', fontWeight: '600' }}>
                {loading ? 'Loading...' : `${filteredProducts.length} items`}
              </span>
            </div>
          </div>

          {/* Search, Mobile Filters Toggle & Sort */}
          <div className="shop-header-controls">
            <div className="shop-search-wrap">
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search catalog..."
                aria-label="Search catalog"
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 34px 0 36px',
                  borderRadius: '10px',
                  border: '1px solid var(--glass-border)',
                  background: isDark ? 'rgba(18, 22, 36, 0.75)' : '#ffffff',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchInput('')}
                  aria-label="Clear search"
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="button"
              className="shop-mobile-filter-btn"
              onClick={() => setMobileFiltersOpen((prev) => !prev)}
              style={{
                height: '40px',
                padding: '0 14px',
                borderRadius: '10px',
                border: `1px solid ${mobileFiltersOpen ? '#2454F4' : 'var(--glass-border)'}`,
                background: mobileFiltersOpen
                  ? 'rgba(36, 84, 244, 0.12)'
                  : isDark
                  ? 'rgba(18, 22, 36, 0.75)'
                  : '#ffffff',
                color: mobileFiltersOpen ? '#2454F4' : 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: '600',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {activeFilterChips.length > 0 && (
                <span
                  style={{
                    background: '#2454F4',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    borderRadius: '999px',
                    padding: '1px 6px',
                  }}
                >
                  {activeFilterChips.length}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="shop-sort-select"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="discount-desc">Biggest Discount</option>
            </select>
          </div>
        </div>

        {/* Main 2-Column Catalog Body */}
        <div className="shop-layout">
          {/* Left Filter Sidebar */}
          <aside className="shop-sidebar" aria-label="Catalog Filters">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                }}
              >
                Filters
              </span>
              {activeFilterChips.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: '#2454F4',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h3
                style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  margin: '0 0 10px 0',
                }}
              >
                Category
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background:
                      activeCategory === 'all'
                        ? isDark
                          ? 'rgba(36, 84, 244, 0.2)'
                          : 'rgba(36, 84, 244, 0.08)'
                        : 'transparent',
                    color: activeCategory === 'all' ? '#2454F4' : 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: activeCategory === 'all' ? '700' : '500',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>All Categories</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {allProducts.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const id = String(cat._id || cat.id);
                  const isActive = activeCategory === id;
                  const label = getDisplayCategoryName(cat.name);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSelectCategory(id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive
                          ? isDark
                            ? 'rgba(36, 84, 244, 0.2)'
                            : 'rgba(36, 84, 244, 0.08)'
                          : 'transparent',
                        color: isActive ? '#2454F4' : 'var(--text-primary)',
                        fontSize: '14px',
                        fontWeight: isActive ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {categoryCounts[id] || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--glass-border)' }} />

            {/* Price Range */}
            <div>
              <h3
                style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  margin: '0 0 10px 0',
                }}
              >
                Price Range
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {PRICE_RANGES.map((range) => {
                  const isActive = priceRangeId === range.id;
                  return (
                    <button
                      key={range.id}
                      type="button"
                      onClick={() => {
                        setPriceRangeId(range.id);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive
                          ? isDark
                            ? 'rgba(36, 84, 244, 0.2)'
                            : 'rgba(36, 84, 244, 0.08)'
                          : 'transparent',
                        color: isActive ? '#2454F4' : 'var(--text-primary)',
                        fontSize: '14px',
                        fontWeight: isActive ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>{range.label}</span>
                      {isActive && <Check size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--glass-border)' }} />

            {/* Availability */}
            <div>
              <h3
                style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  margin: '0 0 10px 0',
                }}
              >
                Availability
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => {
                      setInStockOnly(e.target.checked);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    style={{ accentColor: '#2454F4', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>In Stock Only</span>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={onSaleOnly}
                    onChange={(e) => {
                      setOnSaleOnly(e.target.checked);
                      setVisibleCount(PAGE_SIZE);
                    }}
                    style={{ accentColor: '#2454F4', width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>On Sale</span>
                </label>
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--glass-border)' }} />

            {/* Minimum Customer Rating */}
            <div>
              <h3
                style={{
                  fontSize: '13.5px',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  margin: '0 0 10px 0',
                }}
              >
                Customer Rating
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {RATING_OPTIONS.map((opt) => {
                  const isActive = minRating === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setMinRating(opt.value);
                        setVisibleCount(PAGE_SIZE);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive
                          ? isDark
                            ? 'rgba(36, 84, 244, 0.2)'
                            : 'rgba(36, 84, 244, 0.08)'
                          : 'transparent',
                        color: isActive ? '#2454F4' : 'var(--text-primary)',
                        fontSize: '14px',
                        fontWeight: isActive ? '700' : '500',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>{opt.label}</span>
                      {isActive && <Check size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Product Grid Column */}
          <div>
            {/* Active Filter Chips */}
            {activeFilterChips.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '18px',
                }}
              >
                {activeFilterChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 11px',
                      borderRadius: '999px',
                      border: '1px solid rgba(36, 84, 244, 0.35)',
                      background: isDark ? 'rgba(36, 84, 244, 0.16)' : 'rgba(36, 84, 244, 0.08)',
                      color: isDark ? '#93c5fd' : '#2454F4',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{chip.label}</span>
                    <X size={12} />
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <ProductListSkeleton count={8} />
            ) : filteredProducts.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '64px 24px',
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border)',
                  background: isDark ? 'rgba(18, 22, 36, 0.5)' : '#ffffff',
                }}
              >
                <p
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    margin: '0 0 8px 0',
                  }}
                >
                  No products match your filters
                </p>
                <p
                  style={{
                    fontSize: '13.5px',
                    color: 'var(--text-muted)',
                    margin: '0 0 20px 0',
                  }}
                >
                  Try clearing some filters or searching with a broader keyword.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    height: '40px',
                    padding: '0 20px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#2454F4',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="shop-products-grid">
                  {visibleProducts.map((product) => (
                    <ShopProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>

                {hasMore && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                      style={{
                        height: '44px',
                        padding: '0 28px',
                        borderRadius: '10px',
                        border: '1px solid var(--glass-border)',
                        background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                        color: 'var(--text-primary)',
                        fontSize: '13.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      Load More Products ({filteredProducts.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
