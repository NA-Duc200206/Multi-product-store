import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import GlowLogo from './GlowLogo';

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer style={{
      borderTop: `1px solid ${isDark ? 'var(--glass-border)' : 'rgba(36, 84, 244, 0.08)'}`,
      background: 'var(--footer-bg)',
      padding: '48px 48px 24px 48px',
      marginTop: 'auto',
      color: isDark ? 'var(--text-secondary)' : 'rgba(255,255,255,0.7)',
      fontSize: '14px'
    }}>
      <div style={{
        maxWidth: '1560px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        <div>
          <div style={{ marginBottom: '16px' }}>
            <GlowLogo size={32} fontSize="24px" color={isDark ? 'var(--text-primary)' : '#ffffff'} />
          </div>
          <p style={{ lineHeight: '1.7', color: isDark ? 'var(--text-secondary)' : 'rgba(255,255,255,0.7)', maxWidth: '320px' }}>
            Curated multi-category shopping ecosystem. Connecting modern lifestyles with premium fashion, tech, accessories, and authentic cosmetics.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>
            Explore
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link></li>
            <li><Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>All Products</Link></li>
            <li><Link to="/cart" style={{ color: 'inherit', textDecoration: 'none' }}>Shopping Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>
            Customer Policies
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>Privacy, Data Security Policy</li>
            <li>Nationwide Shipping Policy</li>
            <li>30-Day Transparent Returns</li>
            <li>Secure VNPAY Payment Gateway</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', marginBottom: '16px', fontSize: '15px', fontWeight: '700' }}>
            Customer Support
          </h4>
          <p style={{ lineHeight: '1.6', marginBottom: '8px' }}>Email: support@uconext.vn</p>
          <p style={{ lineHeight: '1.6', marginBottom: '8px' }}>Support Hotline: 1900 6868</p>
          <p style={{ lineHeight: '1.6' }}>Hours: 08:00 – 21:00 (Mon – Sun)</p>
        </div>
      </div>

      <div style={{
        maxWidth: '1560px',
        margin: '0 auto',
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid var(--footer-border)',
        fontSize: '12px',
        color: isDark ? 'var(--text-muted)' : 'rgba(255,255,255,0.45)'
      }}>
        © 2026 UCONEXT • UTILITIES • CONNECT • TRENDS. All rights reserved. Secure checkout integrated with VNPAY Sandbox.
      </div>
    </footer>
  );
};

export default Footer;
