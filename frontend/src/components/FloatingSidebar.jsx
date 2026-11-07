import React, { useState } from 'react';
import { Menu, X, Compass, Zap, Star, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const FloatingSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const quickLinks = [
    { icon: <Compass size={20} />, color: '#3a61f6', label: 'Explore Shop', action: () => { navigate('/products'); setIsOpen(false); } },
    { icon: <Zap size={20} />, color: '#fbbf24', label: 'Flash Deals', action: () => { window.scrollTo({ top: 800, behavior: 'smooth' }); setIsOpen(false); } },
    { icon: <Star size={20} />, color: '#f472b6', label: 'Best Sellers', action: () => { navigate('/products?sort=popular'); setIsOpen(false); } },
    { icon: <MessageSquare size={20} />, color: '#34d399', label: 'Live Chat', action: () => { alert('Chat interface would open here!'); setIsOpen(false); } },
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button 
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.1, x: 5 }}
        style={{
          position: 'fixed',
          left: '0px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 998,
          width: '46px',
          height: '60px',
          borderTopRightRadius: '16px',
          borderBottomRightRadius: '16px',
          borderTopLeftRadius: '0',
          borderBottomLeftRadius: '0',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderLeft: 'none',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '10px 0 30px rgba(0,0,0,0.3)',
        }}
      >
        <Menu size={20} />
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
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                zIndex: 9998,
              }}
            />

            {/* Sliding Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '320px',
                height: '100vh',
                background: 'var(--bg-primary)',
                borderRight: '1px solid var(--glass-border)',
                zIndex: 9999,
                padding: '30px 24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '20px 0 50px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <span style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '0.08em', background: 'var(--logo-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  QUICK ACTIONS
                </span>
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {quickLinks.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={item.action}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '16px',
                      color: 'var(--text-primary)',
                      fontSize: '15px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.color;
                      e.currentTarget.style.transform = 'translateX(5px)';
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

              <div style={{ marginTop: 'auto', padding: '20px', background: 'linear-gradient(135deg, rgba(58, 97, 246, 0.1), rgba(123, 70, 243, 0.1))', borderRadius: '16px', border: '1px solid rgba(123, 70, 243, 0.2)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>GlowStore Premium</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Experience luxury e-commerce. All rights reserved &copy; 2026.</p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingSidebar;
