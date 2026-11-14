import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { 
  ShoppingBag, User, LogOut, LayoutDashboard, Sun, Moon, 
  Search, Bell, Heart, Menu, X, ChevronRight, ChevronDown, ArrowUpRight, PackageOpen, 
  Settings, Trash2, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowLogo from './GlowLogo';
import {
  formatVND,
  translateCategoryName,
  getCategoryEditorialImage,
  handleImageError,
} from '../utils/formatters';

const CATEGORY_META = {
  Electronics: {
    title: 'Smart Technology',
    fallbackPath: '/products?search=tech',
  },
  Fashion: {
    title: 'Fashion',
    fallbackPath: '/products?search=fashion',
  },
  Cosmetics: {
    title: 'Beauty',
    fallbackPath: '/products?search=beauty',
  },
  Accessories: {
    title: 'Watches',
    fallbackPath: '/products?search=accessories',
  },
  'Home & Living': {
    title: 'Home Living',
    fallbackPath: '/products?search=living',
  },
};

const DEFAULT_CATEGORY_LIST = Object.entries(CATEGORY_META).map(([rawName, meta]) => ({
  rawName,
  image: getCategoryEditorialImage(rawName),
  ...meta,
  path: meta.fallbackPath,
}));

const TABS = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'Shop' },
  { label: 'Categories', mega: 'categories' }
];

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cart, getCartItemsCount, getCartTotal, removeFromCart } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartBump, setCartBump] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const megaMenuTimeout = useRef(null);
  const desktopNavRef = useRef(null);

  const cartCount = getCartItemsCount();
  const prevCartCountRef = useRef(cartCount);
  const hasCategoryParam = useMemo(
    () => new URLSearchParams(location.search).has('categoryId'),
    [location.search]
  );

  useEffect(() => {
    let isMounted = true;
    const loadNavCategories = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.categories.getAll(),
          api.products.getAll({ limit: 100 }),
        ]);
        if (!isMounted) return;
        const cats = catRes.categories || [];
        const prods = prodRes.products || [];
        const counts = {};
        prods.forEach((p) => {
          const cid = String(p.category?._id || p.categoryId?._id || p.categoryId || '');
          if (cid) counts[cid] = (counts[cid] || 0) + 1;
        });
        setCategories(cats);
        setCategoryCounts(counts);
      } catch (err) {
        console.error('Failed to load nav categories:', err.message);
      }
    };
    loadNavCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const navCategories = useMemo(() => {
    if (!categories.length) return DEFAULT_CATEGORY_LIST;
    return categories.map((cat) => {
      const id = String(cat._id || cat.id);
      const meta = CATEGORY_META[cat.name] || {
        title: translateCategoryName(cat.name),
      };
      return {
        id,
        rawName: cat.name,
        image: getCategoryEditorialImage(cat.name),
        title: meta.title,
        path: `/products?categoryId=${id}`,
        count: categoryCounts[id] ?? null,
      };
    });
  }, [categories, categoryCounts]);

  // Close mega menu on navigation or outside click
  useEffect(() => {
    setActiveMega(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (desktopNavRef.current && !desktopNavRef.current.contains(e.target)) {
        setActiveMega(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    if (cartCount > prevCartCountRef.current) {
      setCartBump(true);
      const timer = setTimeout(() => setCartBump(false), 600);
      prevCartCountRef.current = cartCount;
      return () => clearTimeout(timer);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (tab) => {
    if (tab.mega === 'categories') {
      return activeMega === 'categories' || (location.pathname.startsWith('/products') && hasCategoryParam);
    }
    if (tab.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(tab.path) && !hasCategoryParam;
  };

  const handleMegaEnter = (mega) => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setActiveMega(mega);
  };

  const handleMegaLeave = () => {
    megaMenuTimeout.current = setTimeout(() => {
      setActiveMega(null);
    }, 180);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  const renderMegaMenu = () => {
    if (!activeMega) return null;
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onMouseEnter={() => handleMegaEnter(activeMega)}
          onMouseLeave={handleMegaLeave}
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '840px',
            background: isDark ? 'rgba(18, 20, 29, 0.96)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(30px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            padding: '24px',
            marginTop: '10px',
            boxShadow: isDark ? '0 24px 50px rgba(0,0,0,0.5)' : '0 20px 40px rgba(15,23,42,0.1)',
            zIndex: 1000
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Math.max(navCategories.length, 1), 5)}, 1fr)`, gap: '12px' }}>
            {navCategories.map((cat, i) => (
              <Link
                key={cat.id || i}
                to={cat.path}
                onClick={() => setActiveMega(null)}
                className="mega-editorial-card"
                style={{
                  padding: '8px',
                  background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  textAlign: 'left',
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'border-color 0.2s ease, transform 0.2s ease, background-color 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(36, 84, 244, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  const img = e.currentTarget.querySelector('img');
                  if (img) img.style.transform = 'scale(1)';
                }}
              >
                <div style={{
                  width: '100%',
                  aspectRatio: '16 / 10',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                  background: isDark ? '#121624' : '#e2e8f0',
                }}>
                  <img
                    src={cat.image}
                    alt={cat.title}
                    onError={handleImageError}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', padding: '0 2px 2px 2px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.25' }}>
                    {cat.title}
                  </h4>
                  <ArrowUpRight size={13} color="#2454F4" style={{ flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderDropdown = (type) => {
    if (activeDropdown !== type) return null;
    
    let content = null;
    if (type === 'cart') {
      content = (
        <div style={{ width: '340px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Shopping Cart ({getCartItemsCount()})
            </h3>
          </div>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
              Your shopping cart is empty.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto' }}>
              {cart.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#2454F4', fontWeight: '700' }}>
                      {formatVND(item.price)} × {item.quantity}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId, item.color, item.size)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontWeight: '700', color: 'var(--text-primary)', fontSize: '14px' }}>
                <span>Subtotal:</span>
                <span style={{ color: '#2454F4', fontWeight: '800' }}>{formatVND(getCartTotal())}</span>
              </div>
              <Link 
                to="/cart" 
                onClick={() => setActiveDropdown(null)}
                style={{ 
                  display: 'block', 
                  textAlign: 'center', 
                  padding: '11px', 
                  background: '#2454F4', 
                  color: 'white', 
                  borderRadius: '10px', 
                  fontWeight: '700', 
                  fontSize: '13px',
                  textDecoration: 'none' 
                }}
              >
                View Cart
              </Link>
            </div>
          )}
        </div>
      );
    } else if (type === 'user') {
      content = (
        <div style={{ width: '230px', padding: '10px' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--glass-border)', marginBottom: '6px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>{user.name}</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, wordBreak: 'break-all' }}>{user.email}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Link to="/settings" onClick={() => setActiveDropdown(null)} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '8px', fontSize: '13px' }}>
              <Settings size={15}/> Account Settings
            </Link>
            <Link to="/orders" onClick={() => setActiveDropdown(null)} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '8px', fontSize: '13px' }}>
              <PackageOpen size={15}/> My Orders
            </Link>
            {isAdmin && (
              <Link to="/admin" onClick={() => setActiveDropdown(null)} className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', color: '#2454F4', textDecoration: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px' }}>
                <Shield size={15}/> Admin Dashboard
              </Link>
            )}
            <button 
              onClick={() => { setActiveDropdown(null); handleLogout(); }} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '9px 10px', 
                color: 'var(--color-error)', 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                borderRadius: '8px', 
                width: '100%', 
                textAlign: 'left', 
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <LogOut size={15}/> Sign Out
            </button>
          </div>
        </div>
      );
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          onMouseEnter={() => setActiveDropdown(type)}
          onMouseLeave={() => setActiveDropdown(null)}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            background: isDark ? 'rgba(18, 20, 29, 0.96)' : '#ffffff',
            backdropFilter: 'blur(25px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            marginTop: '8px',
            boxShadow: isDark ? '0 16px 36px rgba(0,0,0,0.45)' : '0 14px 32px rgba(15,23,42,0.1)',
            zIndex: 1000
          }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
      <style>{`
        .nav-tab {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          padding: 10px 18px;
          border-radius: 10px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          white-space: nowrap;
          position: relative;
        }
        .nav-tab.nav-tab-active {
          color: var(--text-primary);
        }
        .nav-tab:hover {
          color: var(--text-primary);
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
        }
        .dropdown-item:hover {
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'};
          color: var(--text-primary) !important;
        }
        @media (max-width: 992px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: flex !important; }
        }
        .mobile-toggle { display: none; }
      `}</style>

      <nav 
        className={`glass-nav ${scrolled ? 'scrolled' : ''}`} 
        style={{ 
          height: '66px',
          padding: '0 48px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          background: isDark ? 'rgba(10, 11, 16, 0.84)' : 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          position: 'sticky', 
          top: 0, 
          zIndex: 999, 
          transition: 'background 0.3s ease, border-color 0.3s ease'
        }}
      >
        <div style={{ width: '100%', maxWidth: '1560px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand Logo & Wordmark */}
        <GlowLogo size={34} fontSize="25px" />

        {/* Desktop Tabs */}
        <div
          ref={desktopNavRef}
          className="desktop-nav"
          style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}
        >
          {TABS.map((tab, idx) => {
            const tabActive = isActive(tab);
            const isMegaOpen = tab.mega && activeMega === tab.mega;
            return (
              <div
                key={idx}
                onMouseEnter={() => (tab.mega ? handleMegaEnter(tab.mega) : handleMegaLeave())}
                onMouseLeave={() => (tab.mega ? handleMegaLeave() : null)}
                style={{ position: 'relative' }}
              >
                {tab.mega ? (
                  <button
                    type="button"
                    aria-expanded={Boolean(isMegaOpen)}
                    aria-haspopup="true"
                    onClick={() => setActiveMega((prev) => (prev === tab.mega ? null : tab.mega))}
                    className={`nav-tab ${tabActive ? 'nav-tab-active' : ''}`}
                    style={{
                      background: isMegaOpen
                        ? isDark
                          ? 'rgba(36, 84, 244, 0.14)'
                          : 'rgba(36, 84, 244, 0.08)'
                        : undefined,
                      color: isMegaOpen ? '#2454F4' : undefined,
                    }}
                  >
                    <span>{tab.label}</span>
                    <ChevronDown
                      size={15}
                      style={{
                        transform: isMegaOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                    {tabActive && !isMegaOpen && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          left: '18px',
                          right: '18px',
                          height: '2px',
                          background: '#2454F4',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                  </button>
                ) : (
                  <Link to={tab.path} className={`nav-tab ${tabActive ? 'nav-tab-active' : ''}`}>
                    {tab.label}
                    {tabActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        style={{
                          position: 'absolute',
                          bottom: '-2px',
                          left: '18px',
                          right: '18px',
                          height: '2px',
                          background: '#2454F4',
                          borderRadius: '2px',
                        }}
                      />
                    )}
                  </Link>
                )}
              </div>
            );
          })}
          {renderMegaMenu()}
        </div>

        {/* Right Actions & Utilities */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search Toggle / Form */}
          <div style={{ position: 'relative' }}>
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  autoFocus
                  style={{
                    width: '220px',
                    padding: '8px 32px 8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #2454F4',
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  onBlur={() => {
                    if (!searchQuery) setSearchOpen(false);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <X size={15} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Search"
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Search size={17} />
              </button>
            )}
          </div>

          {/* Theme Toggle (Sun / Moon) */}
          <button
            onClick={toggleTheme}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'transparent',
              border: '1px solid transparent',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Cart Icon & Dropdown */}
          <div style={{ position: 'relative' }} onMouseEnter={() => setActiveDropdown('cart')} onMouseLeave={() => setActiveDropdown(null)}>
            <Link
              to="/cart"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: cartBump ? 'rgba(36, 84, 244, 0.14)' : 'transparent',
                border: cartBump ? '1px solid rgba(36, 84, 244, 0.45)' : '1px solid transparent',
                color: cartBump ? '#2454F4' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                position: 'relative',
                transform: cartBump ? 'scale(1.14)' : 'scale(1)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              title="Shopping Cart"
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = cartBump ? '#2454F4' : 'var(--text-secondary)';
                e.currentTarget.style.background = cartBump ? 'rgba(36, 84, 244, 0.14)' : 'transparent';
              }}
            >
              <ShoppingBag size={17} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '1px',
                  right: '1px',
                  background: cartBump ? '#10b981' : '#2454F4',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '800',
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: cartBump ? 'scale(1.22)' : 'scale(1)',
                  transition: 'all 0.25s ease'
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
            {renderDropdown('cart')}
          </div>

          {/* User Auth Info / Buttons */}
          {user ? (
            <div style={{ position: 'relative', marginLeft: '4px' }} onMouseEnter={() => setActiveDropdown('user')} onMouseLeave={() => setActiveDropdown(null)}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '3px 10px 3px 4px',
                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.04)',
                border: '1px solid var(--glass-border)',
                borderRadius: '999px',
                cursor: 'pointer'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#2454F4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '12px'
                }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="desktop-nav" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
              </div>
              {renderDropdown('user')}
            </div>
          ) : (
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              <Link 
                to="/login" 
                style={{ 
                  padding: '8px 14px', 
                  fontSize: '13.5px', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  textDecoration: 'none', 
                  borderRadius: '10px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                style={{ 
                  padding: '8px 18px', 
                  fontSize: '13.5px', 
                  fontWeight: '600', 
                  background: '#2454F4', 
                  color: 'white', 
                  textDecoration: 'none', 
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(36, 84, 244, 0.25)',
                  transition: 'background 0.2s ease, transform 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#1b3ec8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#2454F4';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Drawer Toggle */}
          <button 
            className="mobile-toggle" 
            onClick={() => setMobileOpen(true)} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-primary)', 
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Mobile Fullscreen Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '85vw',
                maxWidth: '380px',
                height: '100vh',
                background: isDark ? '#0a0b10' : '#ffffff',
                borderLeft: '1px solid var(--glass-border)',
                zIndex: 9999,
                overflowY: 'auto',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <GlowLogo size={32} fontSize="22px" onClick={() => setMobileOpen(false)} />
                <button 
                  onClick={() => setMobileOpen(false)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                {TABS.filter((tab) => tab.path).map((tab, i) => (
                  <Link 
                    key={i} 
                    to={tab.path} 
                    onClick={() => setMobileOpen(false)} 
                    style={{ 
                      fontSize: '17px', 
                      fontWeight: '700', 
                      color: 'var(--text-primary)', 
                      textDecoration: 'none',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--glass-border)'
                    }}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#2454F4', letterSpacing: '0.08em', marginBottom: '12px' }}>
                  Product Categories
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {navCategories.map((cat, i) => (
                    <Link
                      key={cat.id || i}
                      to={cat.path}
                      onClick={() => setMobileOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        padding: '6px 0'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={cat.image}
                          alt={cat.title}
                          onError={handleImageError}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                            flexShrink: 0,
                            background: isDark ? '#141a2e' : '#e2e8f0',
                          }}
                        />
                        <span>{cat.title}</span>
                      </span>
                      {cat.count !== null && (
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {cat.count}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                {!user ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Link 
                      to="/login" 
                      onClick={() => setMobileOpen(false)} 
                      style={{ 
                        padding: '12px', 
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', 
                        borderRadius: '10px', 
                        textAlign: 'center', 
                        fontWeight: '700', 
                        color: 'var(--text-primary)', 
                        textDecoration: 'none' 
                      }}
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setMobileOpen(false)} 
                      style={{ 
                        padding: '12px', 
                        background: '#2454F4', 
                        borderRadius: '10px', 
                        textAlign: 'center', 
                        fontWeight: '700', 
                        color: 'white', 
                        textDecoration: 'none' 
                      }}
                    >
                      Create Account
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '10px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: '10px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>{user.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
                    </div>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} style={{ padding: '10px', color: '#2454F4', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={() => { handleLogout(); setMobileOpen(false); }} 
                      style={{ 
                        padding: '12px', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        color: '#ef4444', 
                        border: 'none', 
                        borderRadius: '10px', 
                        fontSize: '14px', 
                        fontWeight: '700', 
                        cursor: 'pointer' 
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
