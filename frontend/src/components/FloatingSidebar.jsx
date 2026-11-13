import React, { useState } from 'react';
import { Menu, X, Compass, Zap, Star, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FloatingSidebar = ({ onOpenChat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const quickLinks = [
    { 
      icon: <Compass size={20} />, 
      color: '#2454F4', 
      label: 'Explore Store', 
      action: () => { navigate('/products'); setIsOpen(false); } 
    },
    { 
      icon: <Zap size={20} />, 
      color: '#f59e0b', 
      label: 'Trending Deals', 
      action: () => { 
        setIsOpen(false);
        const el = document.getElementById('trending');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else navigate('/products');
      } 
    },
    { 
      icon: <Star size={20} />, 
      color: '#10b981', 
      label: 'Best Sellers', 
      action: () => { navigate('/products?sort=popular'); setIsOpen(false); } 
    },
    { 
      icon: <MessageSquare size={20} />, 
      color: '#2454F4', 
      label: 'AI Shopping Assistant', 
      action: () => { 
        setIsOpen(false);
        if (onOpenChat) onOpenChat();
      } 
    },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button 
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.05, x: 3 }}
        title="Quick Access"
        style={{
          position: 'fixed',
          left: '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 998,
          width: '42px',
          height: '54px',
          borderTopRightRadius: '14px',
          borderBottomRightRadius: '14px',
          borderTopLeftRadius: '0',
          borderBottomLeftRadius: '0',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--glass-border)',
          borderLeft: 'none',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        }}
      >
        <Menu size={18} />
      </motion.button>

      {/* Drawer Overlay & Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Blur Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(6px)',
                zIndex: 9998,
              }}
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '300px',
                height: '100vh',
                background: 'var(--bg-primary)',
                borderRight: '1px solid var(--glass-border)',
                zIndex: 9999,
                padding: '28px 20px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '16px 0 40px rgba(0,0,0,0.3)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.06em', color: 'var(--text-primary)' }}>
                  QUICK ACCESS
                </span>
                <button 
                  onClick={() => setIsOpen(false)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quickLinks.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={item.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#2454F4';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--glass-border)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ color: item.color }}>{item.icon}</div>
                    {item.label}
                  </button>
                ))}
              </div>

              <div style={{ 
                marginTop: 'auto', 
                padding: '16px', 
                background: 'rgba(36, 84, 244, 0.06)', 
                borderRadius: '14px', 
                border: '1px solid rgba(36, 84, 244, 0.15)' 
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#2454F4', marginBottom: '6px' }}>UCONEXT</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Utilities • Connect • Trends. Modern lifestyle ecosystem &copy; 2026.
                </p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingSidebar;
