import React from 'react';
import { useTheme } from '../context/ThemeContext';
import GlowLogo from './GlowLogo';

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer style={{
      borderTop: `1px solid ${isDark ? 'var(--glass-border)' : 'rgba(124, 58, 237, 0.08)'}`,
      background: 'var(--footer-bg)',
      padding: '40px 5% 20px 5%',
      marginTop: 'auto',
      color: isDark ? 'var(--text-secondary)' : 'rgba(255,255,255,0.7)',
      fontSize: '14px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '40px',
        marginBottom: '40px'
      }}>
        <div>
          <div style={{ marginBottom: '16px' }}>
            <GlowLogo size={28} fontSize="20px" color={isDark ? 'var(--text-primary)' : '#ffffff'} />
          </div>
          <p style={{ lineHeight: '1.6' }}>
            Premium shopping experience with genuine cosmetics, fashion, and designer accessories.
          </p>
        </div>
        <div>
          <h4 style={{ color: isDark ? 'var(--text-primary)' : '#ffffff', marginBottom: '16px' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</a></li>
            <li><a href="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Products</a></li>
            <li><a href="/cart" style={{ color: 'inherit', textDecoration: 'none' }}>Cart</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: isDark ? 'var(--text-primary)' : '#ffffff', marginBottom: '16px' }}>Policies</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>Privacy Policy</li>
            <li>Shipping Policy</li>
            <li>VNPAY Payment Policy</li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: isDark ? 'var(--text-primary)' : '#ffffff', marginBottom: '16px' }}>Customer Support</h4>
          <p style={{ lineHeight: '1.6', marginBottom: '8px' }}>Email: support@glowstore.com</p>
          <p style={{ lineHeight: '1.6' }}>Hotline: 1900 6868</p>
        </div>
      </div>
      <div style={{
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: '1px solid var(--footer-border)',
        fontSize: '12px',
        color: isDark ? 'var(--text-muted)' : 'rgba(255,255,255,0.4)'
      }}>
        © 2026 GlowStore. All rights reserved. VNPAY Sandbox payment integrated.
      </div>
    </footer>
  );
};

export default Footer;
