import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Star, ShoppingBag, ArrowRight, Percent, Award, Sparkles } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount);
};

const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const discount = 15;
  const oldPrice = product.price * 1.15;
  const rating = 4.8;

  const handleCardClick = (e) => {
    // If clicked on wishlist or quick add buttons, do not trigger card-wide navigation
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
      className="editorial-pcard"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="epc-image-wrapper">
        <img 
          src={product.image || product.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'} 
          alt={product.name} 
          className="epc-img"
        />
        
        {/* Wishlist Button slides down on hover */}
        <button className={`epc-wishlist-btn ${isHovered ? 'visible' : ''}`}>
          <Heart size={16} strokeWidth={1.5} />
        </button>

        {/* Quick Add Button fades in on hover */}
        <div className={`epc-quick-add ${isHovered ? 'visible' : ''}`}>
          <button className="epc-add-btn">
            <ShoppingBag size={14} style={{ marginRight: 6 }} /> Quick Add
          </button>
        </div>
      </div>

      <div className="epc-info">
        <div className="epc-brand">ESSENTIALS</div>
        <Link to={`/product/${product.id}`} className="epc-title">{product.name}</Link>
        <div className="epc-meta-row">
          <div className="epc-prices">
            <span className="epc-price">{formatCurrency(product.price)}</span>
            <span className="epc-old-price">{formatCurrency(oldPrice)}</span>
          </div>
          <div className="epc-rating">
            <Star size={11} fill="#f59e0b" color="#f59e0b" />
            <span style={{ color: '#f59e0b', marginLeft: '4px' }}>{rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('categoryId') ? searchParams.get('categoryId').split(',').filter(Boolean) : []
  );
  const [maxPrice, setMaxPrice] = useState(parseInt(searchParams.get('maxPrice') || '50000000'));
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active filter chip helper
  const [activeChip, setActiveChip] = useState('All');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.categories.getAll();
        setCategories(res.categories || []);
      } catch (err) {
        console.error('Failed to load categories:', err.message);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoryIdParam = selectedCategories.join(',');
        const res = await api.products.getAll({
          search,
          categoryId: categoryIdParam,
          maxPrice: maxPrice.toString(),
          sort,
          page,
          limit: 16
        });
        setProducts(res.products || []);
      } catch (err) {
        console.error('Failed to fetch products:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, selectedCategories, maxPrice, sort, page]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    const current = new URLSearchParams(searchParams);
    if (val) current.set('search', val);
    else current.delete('search');
    setSearchParams(current);
  };

  const handleChipClick = (chipName, categoryId = null, maxPriceVal = null) => {
    setActiveChip(chipName);
    const current = new URLSearchParams(searchParams);
    
    // Handle category filter
    if (categoryId) {
      setSelectedCategories([categoryId.toString()]);
      current.set('categoryId', categoryId.toString());
    } else {
      setSelectedCategories([]);
      current.delete('categoryId');
    }

    // Handle price filter
    if (maxPriceVal) {
      setMaxPrice(maxPriceVal);
      current.set('maxPrice', maxPriceVal.toString());
    } else {
      setMaxPrice(50000000);
      current.delete('maxPrice');
    }

    current.set('page', '1');
    setSearchParams(current);
  };

  const collections = [
    { title: 'New Arrivals', desc: 'The latest objects of desire', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200' },
    { title: 'Luxury Fashion', desc: 'Impeccable tailoring & premium fabrics', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200' },
    { title: 'Beauty Essentials', desc: 'Formulated for clean elegance', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200' },
    { title: 'Minimalist Living', desc: 'Design details for your home', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200' }
  ];

  // Derived best sellers (top 4 rated/priced items for premium catalog representation)
  const bestSellers = products.slice(0, 4);

  return (
    <div className="editorial-shop-page">
      <style>{`
        .editorial-shop-page {
          --c-bg: var(--bg-primary);
          --c-bg-rgb: var(--bg-rgb);
          --c-card: var(--glass-bg);
          --c-text: var(--text-primary);
          --c-secondary: var(--text-secondary);
          --c-accent: var(--color-accent);
          --c-border: var(--glass-border);
          --font-sans: var(--font-sans);
          --font-display: var(--font-display);

          --c-section-alt: var(--bg-secondary);
          --c-card-hover: var(--bg-elevated);

          position: relative;
          background-color: var(--c-bg);
          color: var(--c-text);
          font-family: var(--font-sans);
          min-height: 100vh;
          overflow-x: hidden;
          padding-bottom: 120px;
        }

        /* Subtle grid dot pattern backdrop */
        .editorial-shop-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(var(--grid-dot-color) 1px, transparent 1px);
          background-size: 32px 32px;
          opacity: 0.85;
          pointer-events: none;
          z-index: 0;
        }

        /* Ambient floating light spheres */
        .shop-ambient-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.15;
          pointer-events: none;
          z-index: 0;
        }
        .glow-1 {
          width: 500px;
          height: 500px;
          background: var(--color-accent);
          top: 15%;
          left: -100px;
          animation: floatOrb 22s infinite alternate ease-in-out;
        }
        .glow-2 {
          width: 600px;
          height: 600px;
          background: #7b46f3;
          top: 50%;
          right: -150px;
          animation: floatOrb 28s infinite alternate ease-in-out;
          animation-delay: -6s;
        }
        .glow-3 {
          width: 500px;
          height: 500px;
          background: var(--color-accent);
          bottom: 15%;
          left: 10%;
          animation: floatOrb 24s infinite alternate ease-in-out;
          animation-delay: -12s;
        }

        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(70px, 50px) scale(1.15); }
        }

        /* Distinct Dark Theme specific overrides for Shop page */
        [data-theme="dark"] .editorial-shop-page {
          --c-bg: #030407;                      /* Deeper luxury void black */
          --c-card: rgba(255, 255, 255, 0.03);  /* Elegant white glass */
          --c-card-hover: rgba(255, 255, 255, 0.07);/* Light glass hover */
          --c-border: rgba(255, 255, 255, 0.06);/* Clean micro glass border */
          --c-section-alt: rgba(13, 15, 23, 0.45);/* Translucent dark slate section */
          --c-secondary: #94a3b8;               /* High contrast secondary */
        }

        /* Distinct Light Theme specific overrides for Shop page */
        [data-theme="light"] .editorial-shop-page {
          --c-bg: #f8fafc;                      /* Pure light slate background */
          --c-card: rgba(255, 255, 255, 0.7);   /* Translucent light glass */
          --c-card-hover: rgba(255, 255, 255, 0.95);
          --c-border: rgba(16, 39, 111, 0.06);  /* Clean blue border */
          --c-section-alt: rgba(241, 245, 249, 0.55);/* Translucent light grey section */
          --c-secondary: #475569;
        }

        /* 1. LARGE EDITORIAL HERO */
        .editorial-hero {
          position: relative;
          width: 100%;
          height: 75vh;
          min-height: 550px;
          overflow: hidden;
        }
        .eh-bg {
          position: absolute;
          inset: 0;
          background: url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80') center/cover;
          transform: scale(1.02);
        }
        .eh-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(var(--c-bg-rgb), 0.1) 0%, rgba(var(--c-bg-rgb), 0.85) 100%);
        }
        .eh-content {
          position: absolute;
          bottom: 10%;
          left: 5%;
          right: 5%;
          max-width: 800px;
          color: var(--text-primary);
          z-index: 10;
        }
        .eh-subtitle {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin-bottom: 16px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
        }
        .eh-title {
          font-family: var(--font-display);
          font-size: clamp(36px, 6vw, 68px);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
        .eh-title span.text-gradient {
          background: var(--btn-accent-bg);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .eh-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--btn-accent-bg);
          color: var(--btn-accent-text);
          box-shadow: 0 4px 15px var(--btn-accent-glow);
          padding: 16px 36px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .eh-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--btn-accent-glow);
        }

        /* NEW: HIGH-END PROMO BANNER (đang có sale gì) */
        .section-exclusive-deals {
          padding: 80px 5% 40px;
        }
        .editorial-promo-banner {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          background: var(--c-card);
          border: 1px solid var(--c-border);
          border-radius: 32px;
          overflow: hidden;
          box-shadow: var(--shadow-glass);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        @media (max-width: 768px) {
          .editorial-promo-banner { grid-template-columns: 1fr; }
        }
        .epb-image {
          background: url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=1200') center/cover;
          min-height: 320px;
        }
        .epb-content {
          padding: 60px 8%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
        }
        .epb-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-accent);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
        }
        .epb-title {
          font-family: var(--font-display);
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }
        .epb-desc {
          color: var(--c-secondary);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .epb-code {
          background: var(--input-bg);
          border: 1px dashed var(--c-border);
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.05em;
          color: var(--c-text);
        }

        .section-collections {
          padding: 80px 5%;
          background-color: var(--c-section-alt);
          border-top: 1px solid var(--c-border);
          border-bottom: 1px solid var(--c-border);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          position: relative;
          z-index: 2;
        }
        .sec-header {
          margin-bottom: 50px;
          max-width: 600px;
        }
        .sec-subtitle {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--c-secondary);
          margin-bottom: 12px;
          font-weight: 600;
        }
        .sec-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 800;
          color: var(--c-text);
          margin: 0;
        }
        
        .collections-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .collections-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .collections-grid { grid-template-columns: 1fr; }
        }

        .coll-card {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: 24px;
          overflow: hidden;
          background: var(--c-card);
          border: 1px solid var(--c-border);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          cursor: pointer;
          box-shadow: var(--shadow-glass);
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .coll-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 15px rgba(99, 102, 241, 0.15);
          border-color: var(--c-accent);
        }
        .coll-img-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .coll-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .coll-card:hover .coll-img {
          transform: scale(1.08);
        }
        
        /* Light shine reflection effect on hover */
        .coll-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0) 100%);
          transform: translateX(-100%);
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .coll-card:hover::after {
          transform: translateX(100%);
        }

        .coll-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(var(--c-bg-rgb), 0) 50%, rgba(var(--c-bg-rgb), 0.7) 100%);
        }
        .coll-info {
          position: absolute;
          bottom: 30px;
          left: 30px;
          right: 30px;
          color: #ffffff;
        }
        .coll-title {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 6px;
        }
        .coll-desc {
          font-size: 13px;
          opacity: 0.8;
          line-height: 1.4;
        }

        .section-best-sellers {
          padding: 80px 5%;
          position: relative;
          z-index: 2;
        }
        .sbs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .sbs-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .sbs-grid { grid-template-columns: 1fr; }
        }

        .editorial-catalog-wrapper {
          background-color: var(--c-section-alt);
          border-top: 1px solid var(--c-border);
          padding: 80px 0 100px;
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          position: relative;
          z-index: 2;
        }

        /* 3. SEARCH & FILTERS */
        .search-filter-section {
          padding: 0 5% 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }
        
        /* Centered Floating Search Bar */
        .editorial-search-bar {
          width: 100%;
          max-width: 600px;
          position: relative;
        }
        .es-wrapper {
          display: flex;
          align-items: center;
          background: var(--c-card);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--c-border);
          border-radius: 100px;
          padding: 4px 8px;
          box-shadow: var(--shadow-glass);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .es-wrapper:focus-within {
          border-color: var(--c-accent);
          box-shadow: 0 0 15px var(--btn-accent-glow);
          background: var(--input-focus-bg);
        }
        .es-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 14px 20px;
          font-size: 15px;
          color: var(--c-text);
          outline: none;
        }
        .es-input::placeholder {
          color: var(--c-secondary);
        }
        .es-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--btn-accent-bg);
          color: var(--btn-accent-text);
          box-shadow: 0 4px 10px var(--btn-accent-glow);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .es-btn:hover {
          transform: scale(1.05);
        }

        /* Filter Chips */
        .editorial-chips {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          max-width: 800px;
        }
        .filter-chip {
          padding: 10px 24px;
          border-radius: 100px;
          background: var(--c-card);
          border: 1px solid var(--c-border);
          color: var(--c-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--shadow-glass);
        }
        .filter-chip:hover {
          color: var(--c-text);
          border-color: var(--c-text);
          transform: translateY(-1px);
        }
        .filter-chip.active {
          background: var(--btn-accent-bg);
          border-color: var(--color-accent);
          color: var(--btn-accent-text);
          box-shadow: 0 4px 15px var(--btn-accent-glow);
        }

        /* 4. REASONABLE & BALANCED PRODUCT SHOWCASE GRID */
        .showcase-section {
          padding: 20px 5% 0;
        }
        
        .symmetric-showcase-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        @media (max-width: 1200px) {
          .symmetric-showcase-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .symmetric-showcase-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .symmetric-showcase-grid { grid-template-columns: 1fr; }
        }

        /* EDITORIAL PRODUCT CARD */
        .editorial-pcard {
          background: var(--c-card);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--c-border);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          box-shadow: var(--shadow-glass);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease;
        }
        .editorial-pcard:hover {
          transform: translateY(-8px);
          background-color: var(--c-card-hover);
          border-color: var(--c-accent);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 15px rgba(99, 102, 241, 0.15);
        }

        .epc-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1/1; /* Reasonable aspect ratio to look aligned & consistent */
          overflow: hidden;
          background: var(--input-bg);
        }

        .epc-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .editorial-pcard:hover .epc-img {
          transform: scale(1.05);
        }

        /* Wishlist slides down from top */
        .epc-wishlist-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: var(--c-card);
          backdrop-filter: blur(8px);
          border: 1px solid var(--c-border);
          color: var(--c-text);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-10px);
          box-shadow: var(--shadow-glass);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .epc-wishlist-btn.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .epc-wishlist-btn:hover {
          color: var(--color-accent);
          transform: scale(1.08);
        }

        /* Quick Add fades in at bottom */
        .epc-quick-add {
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          opacity: 0;
          transform: translateY(5px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .epc-quick-add.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .epc-add-btn {
          width: 100%;
          padding: 12px 0;
          background: var(--btn-accent-bg);
          color: var(--btn-accent-text);
          box-shadow: 0 4px 10px var(--btn-accent-glow);
          border: none;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .epc-add-btn:hover {
          background: var(--c-text);
        }

        .epc-info {
          padding: 24px;
          border-top: 1px solid var(--c-border);
        }
        .epc-brand {
          font-size: 10px;
          font-weight: 600;
          color: var(--c-secondary);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin-bottom: 6px;
        }
        .epc-title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: var(--c-text);
          text-decoration: none;
          display: block;
          margin-bottom: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .epc-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .epc-prices {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .epc-price {
          font-size: 16px;
          font-weight: 700;
        }
        .epc-old-price {
          font-size: 13px;
          color: var(--c-secondary);
          text-decoration: line-through;
        }
        .epc-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--c-text);
          font-weight: 600;
        }
      `}</style>

      {/* Background ambient light spheres */}
      <div className="shop-ambient-glow glow-1"></div>
      <div className="shop-ambient-glow glow-2"></div>
      <div className="shop-ambient-glow glow-3"></div>

      {/* 1. EDITORIAL HERO SECTION */}
      <section className="editorial-hero">
        <div className="eh-bg" />
        <div className="eh-overlay" />
        <div className="eh-content">
          <span className="eh-subtitle">Volume IV / New Collection</span>
          <h1 className="eh-title">
            Objects Crafted for the <span className="text-gradient">Modern Lifestyle</span>
          </h1>
          <button className="eh-btn">
            Explore Collection <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* NEW: HIGH-END PROMO BANNER (đang có sale gì) */}
      <section className="section-exclusive-deals">
        <div className="editorial-promo-banner">
          <div className="epb-image" />
          <div className="epb-content">
            <span className="epb-tag"><Percent size={14}/> Exclusive Offer</span>
            <h2 className="epb-title">Private Sale: Up to 30% Off Essentials</h2>
            <p className="epb-desc">
              Experience the curation of timeless garments and accessories. High-end materials made with local sustainability. Applied automatically at checkout.
            </p>
            <span className="epb-code">CODE: GLOWAUTUMN</span>
          </div>
        </div>
      </section>

      {/* 2. CURATED COLLECTIONS */}
      <section className="section-collections">
        <div className="sec-header">
          <span className="sec-subtitle">Curated</span>
          <h2 className="sec-title">Shop by Collection</h2>
        </div>
        
        <div className="collections-grid">
          {collections.map((coll, idx) => (
            <div key={idx} className="coll-card">
              <div className="coll-img-wrap">
                <img src={coll.image} alt={coll.title} className="coll-img" />
              </div>
              <div className="coll-overlay" />
              <div className="coll-info">
                <h3 className="coll-title">{coll.title}</h3>
                <p className="coll-desc">{coll.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: BEST SELLERS SECTION (top sản phẩm bán chạy) */}
      {bestSellers.length > 0 && (
        <section className="section-best-sellers">
          <div className="sec-header">
            <span className="sec-subtitle">Trending</span>
            <h2 className="sec-title">Best Sellers</h2>
          </div>
          <div className="sbs-grid">
            {bestSellers.map((p, idx) => (
              <ProductCard key={`best-${p.id}`} product={p} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* 3. SEARCH & CATALOG SHOWCASE WRAPPER */}
      <section className="editorial-catalog-wrapper">
        <div className="search-filter-section">
          <div className="sec-header" style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span className="sec-subtitle">Explore Catalog</span>
            <h2 className="sec-title">All Products</h2>
          </div>

          {/* Centered Floating Search Bar */}
          <div className="editorial-search-bar">
            <div className="es-wrapper">
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={handleSearchChange}
                className="es-input"
              />
              <button className="es-btn">
                <Search size={16} />
              </button>
            </div>
          </div>

          {/* Floating Filter Chips */}
          <div className="editorial-chips">
            <button 
              onClick={() => handleChipClick('All')}
              className={`filter-chip ${activeChip === 'All' ? 'active' : ''}`}
            >
              All Collections
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleChipClick(cat.name, cat.id)}
                className={`filter-chip ${activeChip === cat.name ? 'active' : ''}`}
              >
                {cat.name}
              </button>
            ))}

            <button 
              onClick={() => handleChipClick('Under $100', null, 2500000)}
              className={`filter-chip ${activeChip === 'Under $100' ? 'active' : ''}`}
            >
              Under $100
            </button>

            <button 
              onClick={() => handleChipClick('Exclusive', null, null)}
              className={`filter-chip ${activeChip === 'Exclusive' ? 'active' : ''}`}
            >
              Luxury
            </button>
          </div>
        </div>

        <div className="showcase-section">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--c-secondary)' }}>
              Loading curated items...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--c-secondary)' }}>
              No products found matching the criteria.
            </div>
          ) : (
            <div className="symmetric-showcase-grid">
              {products.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Shop;
