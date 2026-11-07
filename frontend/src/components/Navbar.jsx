import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShoppingBag, User, LogOut, LayoutDashboard, Sun, Moon, Home, ShoppingCart, 
  ClipboardList, Tag, Zap, Crown, BookOpen, Gift, Search, Mic, 
  Camera, Bell, Heart, Menu, X, ChevronRight, CheckCircle, PackageOpen, CreditCard, 
  Settings, HelpCircle, Star, Shirt, Laptop, Gamepad2, Sparkles, Sofa, Dumbbell, 
  Watch, Book, Dog, Clock, Trash2, Shield, Plus, Minus, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import GlowLogo from './GlowLogo';

const categoriesData = [
  { icon: <Shirt size={18} color="#3a61f6"/>, title: 'Fashion', desc: 'Trending apparel' },
  { icon: <Laptop size={18} color="#34d399"/>, title: 'Electronics', desc: 'Smart tech' },
  { icon: <Gamepad2 size={18} color="#fbbf24"/>, title: 'Gaming', desc: 'Pro setups' },
  { icon: <Sparkles size={18} color="#f472b6"/>, title: 'Beauty', desc: 'Cosmetics' },
  { icon: <Sofa size={18} color="#a78bfa"/>, title: 'Home Living', desc: 'Smart living' },
  { icon: <Dumbbell size={18} color="#f87171"/>, title: 'Sports', desc: 'Activewear' },
  { icon: <Crown size={18} color="#38bdf8"/>, title: 'Luxury', desc: 'Premium items' },
  { icon: <Watch size={18} color="#fb923c"/>, title: 'Accessories', desc: 'Watches & jewelry' },
  { icon: <Book size={18} color="#818cf8"/>, title: 'Books', desc: 'Bestsellers' },
  { icon: <Dog size={18} color="#34d399"/>, title: 'Pets', desc: 'Pet supplies' }
];

const brandsData = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Logitech', 'Dell', 'Canon', 'ASUS', "L'Oréal", 'Microsoft'];

const dealsData = [
  { title: "Today's Deals", icon: <Tag size={16}/> },
  { title: "Flash Sale", icon: <Zap size={16}/> },
  { title: "Limited Time Offers", icon: <Clock size={16}/> },
  { title: "Student Discount", icon: <BookOpen size={16}/> },
  { title: "Bundle Offers", icon: <PackageOpen size={16}/> },
  { title: "Coupons", icon: <Gift size={16}/> }
];

const membershipData = [
  { title: "Free Shipping", icon: <PackageOpen size={16}/> },
  { title: "Early Access", icon: <Clock size={16}/> },
  { title: "VIP Discounts", icon: <Crown size={16}/> },
  { title: "Reward Points", icon: <Gift size={16}/> },
  { title: "Exclusive Products", icon: <Star size={16}/> }
];

const blogData = ["Buying Guides", "Tech News", "Fashion Trends", "Beauty Tips", "Product Reviews", "Lifestyle"];

const TABS = [
  { path: '/', label: 'Home' },
  { path: '/products', label: 'Shop' },
  { path: '#categories', label: 'Categories', mega: 'categories' },
  { path: '/about', label: 'About' },
];

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cart, getCartItemsCount, getCartTotal, removeFromCart } = useCart();
  const { showToast } = useToast();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const navRef = useRef(null);
  const megaMenuTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully.', 'info');
    navigate('/');
  };

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleMegaEnter = (mega) => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setActiveMega(mega);
  };
  const handleMegaLeave = () => {
    megaMenuTimeout.current = setTimeout(() => {
      setActiveMega(null);
    }, 150);
  };

  const renderMegaMenu = () => {
    if (!activeMega) return null;
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onMouseEnter={() => handleMegaEnter(activeMega)}
          onMouseLeave={handleMegaLeave}
          style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: activeMega === 'categories' ? '900px' : '700px',
            background: 'var(--glass-bg)', backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)', border: '1px solid var(--glass-border)',
            borderRadius: '24px', padding: '30px', marginTop: '10px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
            zIndex: 1000
          }}
        >
          {activeMega === 'categories' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}>
              {categoriesData.map((cat, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05, y: -4 }} style={{
                  padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>{cat.icon}</div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{cat.title}</h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{cat.desc}</p>
                </motion.div>
              ))}
            </div>
          )}
          {activeMega === 'brands' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {brandsData.map((brand, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05, y: -4 }} style={{
                  padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'center',
                  fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.05em'
                }}>
                  {brand}
                </motion.div>
              ))}
            </div>
          )}
          {activeMega === 'deals' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {dealsData.map((deal, i) => (
                <motion.div key={i} whileHover={{ x: 5 }} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                  background: 'rgba(255,255,255,0.02)', borderRadius: '16px', cursor: 'pointer',
                  border: '1px solid transparent', transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ color: 'var(--color-accent)' }}>{deal.icon}</div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{deal.title}</span>
                </motion.div>
              ))}
              <div style={{ gridColumn: '1 / -1', marginTop: '20px', padding: '20px', background: 'linear-gradient(135deg, var(--color-accent), #7b46f3)', borderRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>Flash Sale Ends In</h3>
                  <p style={{ opacity: 0.8, fontSize: '13px' }}>Grab premium deals before they are gone!</p>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '0.1em' }}>04:12:59</div>
              </div>
            </div>
          )}
          {activeMega === 'membership' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
               {membershipData.map((item, i) => (
                 <motion.div key={i} whileHover={{ y: -4 }} style={{
                   display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px',
                   background: 'rgba(255,255,255,0.02)', borderRadius: '16px', cursor: 'pointer',
                   border: '1px solid rgba(255,255,255,0.05)'
                 }}>
                   <div style={{ color: '#fbbf24' }}>{item.icon}</div>
                   <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{item.title}</span>
                 </motion.div>
               ))}
               <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <Crown size={32} color="#fbbf24" style={{ marginBottom: '12px' }}/>
                 <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>Join VIP Today</h3>
                 <button style={{ marginTop: '12px', padding: '8px 24px', borderRadius: '100px', background: '#fbbf24', color: '#000', fontWeight: '800', border: 'none', cursor: 'pointer' }}>Upgrade</button>
               </div>
            </div>
          )}
          {activeMega === 'blog' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
               {blogData.map((item, i) => (
                 <motion.div key={i} whileHover={{ scale: 1.02 }} style={{
                   padding: '24px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', cursor: 'pointer',
                   border: '1px solid rgba(255,255,255,0.05)', fontWeight: '700', color: 'var(--text-primary)'
                 }}>
                   {item}
                 </motion.div>
               ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderDropdown = (type) => {
    if (activeDropdown !== type) return null;
    
    let content = null;
    if (type === 'cart') {
      content = (
        <div style={{ width: '350px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>Shopping Cart ({getCartItemsCount()})</h3>
          </div>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>Your cart is empty.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {cart.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{item.name}</h4>
                    <div style={{ fontSize: '12px', color: 'var(--color-accent)', fontWeight: '700' }}>${item.price} x {item.quantity}</div>
                  </div>
                  <button onClick={() => removeFromCart(item.productId, item.color, item.size)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {cart.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontWeight: '800', color: 'var(--text-primary)' }}>
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <Link to="/cart" style={{ display: 'block', textAlign: 'center', padding: '12px', background: 'var(--color-accent)', color: 'white', borderRadius: '12px', fontWeight: '800', textDecoration: 'none' }}>Checkout</Link>
            </div>
          )}
        </div>
      );
    } else if (type === 'wishlist') {
      content = (
        <div style={{ width: '320px', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>My Wishlist</h3>
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Your wishlist is empty. Explore premium items!</div>
        </div>
      );
    } else if (type === 'user') {
      content = (
        <div style={{ width: '250px', padding: '12px' }}>
          <div style={{ padding: '12px', borderBottom: '1px solid var(--glass-border)', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>{user.name}</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Link to="/profile" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '8px' }}><User size={16}/> My Profile</Link>
            <Link to="/orders" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '8px' }}><PackageOpen size={16}/> Orders</Link>
            {isAdmin && <Link to="/admin" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', color: 'var(--color-accent)', textDecoration: 'none', borderRadius: '8px', fontWeight: '700' }}><Shield size={16}/> Admin Panel</Link>}
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', color: 'var(--color-error)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '8px', width: '100%', textAlign: 'left', fontSize: '14px' }}><LogOut size={16}/> Logout</button>
          </div>
        </div>
      );
    } else if (type === 'notifications') {
      content = (
        <div style={{ width: '320px', padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>Notifications</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><Zap size={20}/></div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>Flash Sale Alert</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tech accessories up to 50% off!</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          onMouseEnter={() => setActiveDropdown(type)}
          onMouseLeave={() => setActiveDropdown(null)}
          style={{
            position: 'absolute', top: '100%', right: 0,
            background: 'var(--glass-bg)', backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)',
            borderRadius: '20px', marginTop: '10px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 1000
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
      .nav-tab { color: var(--text-secondary); text-decoration: none; font-size: 13px; font-weight: 600; padding: 8px 12px; border-radius: 8px; transition: all 0.2s; white-space: nowrap; }
      .nav-tab:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
      .dropdown-item:hover { background: rgba(255,255,255,0.05); color: var(--text-primary) !important; }
      .search-bar-expanded { width: 300px !important; background: rgba(255,255,255,0.08) !important; border-color: var(--color-accent) !important; }
      .search-input::placeholder { color: var(--text-muted); }
      
      @media (max-width: 1200px) {
        .desktop-nav { display: none !important; }
        .mobile-toggle { display: flex !important; }
      }
      .mobile-toggle { display: none; }
    `}</style>

    <nav 
      ref={navRef}
      className={`glass-nav ${scrolled ? 'scrolled' : ''}`} 
      style={{ 
        padding: scrolled ? '8px 4%' : '16px 4%', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: scrolled ? 'rgba(var(--bg-rgb), 0.85)' : 'var(--nav-bg)',
        borderBottom: scrolled ? '1px solid var(--nav-border)' : '1px solid transparent',
        boxShadow: scrolled ? 'var(--shadow-glass)' : 'none',
        backdropFilter: scrolled ? 'blur(40px)' : 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 999, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      
      {/* Brand Name */}
      <GlowLogo size={28} fontSize="20px" />

      {/* Desktop Tabs */}
      <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
        {TABS.map((tab, idx) => (
          <div key={idx} 
            onMouseEnter={() => tab.mega ? handleMegaEnter(tab.mega) : handleMegaLeave()}
            onMouseLeave={() => tab.mega ? handleMegaLeave() : null}
            style={{ position: 'relative' }}
          >
            <Link to={tab.path} className="nav-tab">
              {tab.label}
              {isActive(tab.path) && !tab.mega && (
                <motion.div layoutId="activeTab" style={{ position: 'absolute', bottom: '-2px', left: '10px', right: '10px', height: '2px', background: 'var(--color-accent)', borderRadius: '2px', boxShadow: '0 0 10px var(--color-accent)' }} />
              )}
            </Link>
          </div>
        ))}
        {renderMegaMenu()}
      </div>

      {/* Right Actions */}
      <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Icons Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          <motion.div whileHover={{ scale: 1.1 }}>
            <Link to="/settings" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
              <Settings size={16} />
            </Link>
          </motion.div>

          <div style={{ position: 'relative' }} onMouseEnter={() => setActiveDropdown('notifications')} onMouseLeave={() => setActiveDropdown(null)}>
            <motion.button whileHover={{ scale: 1.1 }} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Bell size={16} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: 'var(--color-error)', borderRadius: '50%', boxShadow: '0 0 10px var(--color-error)' }} />
            </motion.button>
            {renderDropdown('notifications')}
          </div>

          <div style={{ position: 'relative' }} onMouseEnter={() => setActiveDropdown('wishlist')} onMouseLeave={() => setActiveDropdown(null)}>
            <motion.button whileHover={{ scale: 1.1 }} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Heart size={16} />
            </motion.button>
            {renderDropdown('wishlist')}
          </div>

          <div style={{ position: 'relative' }} onMouseEnter={() => setActiveDropdown('cart')} onMouseLeave={() => setActiveDropdown(null)}>
            <motion.div whileHover={{ scale: 1.1 }}>
              <Link to="/cart" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', position: 'relative' }}>
                <ShoppingBag size={16} />
                {getCartItemsCount() > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--color-accent)', color: 'white', fontSize: '10px', fontWeight: '800', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getCartItemsCount()}
                  </span>
                )}
              </Link>
            </motion.div>
            {renderDropdown('cart')}
          </div>

          {user ? (
            <div style={{ position: 'relative', marginLeft: '8px' }} onMouseEnter={() => setActiveDropdown('user')} onMouseLeave={() => setActiveDropdown(null)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px 4px 4px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '100px', cursor: 'pointer' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #7b46f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '12px' }}>
                  {user.name.charAt(0)}
                </div>
              </div>
              {renderDropdown('user')}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
              <Link to="/login" style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: '100px' }}>Sign In</Link>
              <Link to="/register" style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '800', background: 'linear-gradient(135deg, var(--color-accent), #7b46f3)', color: 'white', textDecoration: 'none', borderRadius: '100px', boxShadow: '0 4px 15px rgba(123,70,243,0.3)' }}>Join Now</Link>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Toggle */}
      <button className="mobile-toggle" onClick={() => setMobileOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
        <Menu size={24} />
      </button>

      {/* Fullscreen Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'var(--bg-primary)', zIndex: 9999, overflowY: 'auto' }}
          >
            <div style={{ padding: '20px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)' }}>
              <GlowLogo size={28} fontSize="20px" onClick={() => setMobileOpen(false)} />
              <button onClick={() => setMobileOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><X size={28}/></button>
            </div>
            <div style={{ padding: '40px 5%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {TABS.map((tab, i) => (
                <Link key={i} to={tab.path} onClick={() => setMobileOpen(false)} style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', textDecoration: 'none' }}>
                  {tab.label}
                </Link>
              ))}
              
              {!user ? (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                    <Link to="/login" onClick={() => setMobileOpen(false)} style={{ padding: '16px', background: 'var(--input-bg)', borderRadius: '16px', textAlign: 'center', fontWeight: '700', color: 'var(--text-primary)', textDecoration: 'none' }}>Sign In</Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)} style={{ padding: '16px', background: 'linear-gradient(135deg, var(--color-accent), #7b46f3)', borderRadius: '16px', textAlign: 'center', fontWeight: '800', color: 'white', textDecoration: 'none' }}>Join Now</Link>
                 </div>
              ) : (
                 <button onClick={() => { handleLogout(); setMobileOpen(false); }} style={{ padding: '16px', background: 'rgba(248, 113, 113, 0.1)', color: 'var(--color-error)', border: 'none', borderRadius: '16px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>Logout</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
    </>
  );
};

export default Navbar;
