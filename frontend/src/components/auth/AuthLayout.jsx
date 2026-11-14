import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const AuthLayout = ({
  children,
  brandPanel,
  backTo = '/',
  backLabel = 'Back to UCONEXT',
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: isDark ? '#060913' : '#f4f7fb',
        color: 'var(--text-primary)',
        position: 'relative',
        overflowX: 'hidden',
        transition: 'background-color 0.3s ease',
      }}
    >
      {/* Subtle Ambient Light Background (Minimal & Restrained) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: 'absolute',
            top: '-14%',
            left: '10%',
            width: '620px',
            height: '620px',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(36, 84, 244, 0.16) 0%, rgba(36, 84, 244, 0.03) 50%, transparent 72%)'
              : 'radial-gradient(circle, rgba(36, 84, 244, 0.08) 0%, rgba(147, 197, 253, 0.05) 50%, transparent 72%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-16%',
            right: '8%',
            width: '580px',
            height: '580px',
            borderRadius: '50%',
            background: isDark
              ? 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(56, 189, 248, 0.09) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />
      </div>

      <style>{`
        .auth-header {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          padding: 24px 32px 0 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        .auth-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 1120px;
          margin: auto;
          padding: 24px 32px 32px 32px;
          flex: 1;
          position: relative;
          z-index: 2;
        }

        .auth-master-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 100%;
          padding: 12px;
          gap: 12px;
          border-radius: 30px;
          overflow: hidden;
          background-color: ${isDark ? '#0e1322' : '#ffffff'};
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)'};
          box-shadow: ${
            isDark
              ? '0 32px 80px -20px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.04)'
              : '0 32px 80px -24px rgba(15, 23, 42, 0.1), 0 12px 28px -12px rgba(36, 84, 244, 0.06)'
          };
          position: relative;
        }

        .auth-brand-side {
          display: flex;
          width: 100%;
          height: 100%;
        }

        .auth-form-side {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 52px;
          width: 100%;
          background-color: ${isDark ? '#0e1322' : '#ffffff'};
        }

        .auth-footer {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 32px 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: ${isDark ? 'rgba(255, 255, 255, 0.45)' : '#64748b'};
          position: relative;
          z-index: 10;
        }

        @media (max-width: 960px) {
          .auth-header {
            padding: 20px 24px 0 24px;
          }
          .auth-wrapper {
            max-width: 560px;
            padding: 20px 24px 28px 24px;
          }
          .auth-master-card {
            grid-template-columns: 1fr;
            padding: 10px;
            gap: 8px;
            border-radius: 24px;
          }
          .auth-form-side {
            padding: 32px 28px 34px 28px;
          }
          .auth-footer {
            max-width: 560px;
            padding: 0 24px 20px 24px;
          }
        }

        @media (max-width: 520px) {
          .auth-header {
            padding: 16px 16px 0 16px;
          }
          .auth-wrapper {
            padding: 14px 16px 24px 16px;
          }
          .auth-master-card {
            padding: 8px;
            border-radius: 20px;
          }
          .auth-form-side {
            padding: 24px 18px 26px 18px;
          }
          .auth-footer {
            padding: 0 16px 18px 16px;
          }
        }
      `}</style>

      {/* Top Utility Bar */}
      <header className="auth-header">
        <Link
          to={backTo}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: isDark ? 'var(--text-secondary)' : '#334155',
            textDecoration: 'none',
            padding: '8px 16px',
            borderRadius: '100px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(15, 23, 42, 0.03)',
            transition: 'color 0.2s ease, background-color 0.2s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isDark ? 'var(--text-primary)' : '#0f172a';
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDark ? 'var(--text-secondary)' : '#334155';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <ArrowLeft size={15} />
          <span>{backLabel}</span>
        </Link>

        <button
          onClick={toggleTheme}
          type="button"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '100px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}`,
            boxShadow: isDark ? 'none' : '0 2px 8px rgba(15, 23, 42, 0.03)',
            color: isDark ? 'var(--text-secondary)' : '#334155',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = isDark ? 'var(--text-primary)' : '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isDark ? 'var(--text-secondary)' : '#334155';
          }}
        >
          {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#64748b" />}
          <span>{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </header>

      {/* Main Centered Container */}
      <main className="auth-wrapper">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="auth-master-card"
        >
          {/* Left / Top: Brand Identity Panel */}
          <section className="auth-brand-side" aria-label="UCONEXT Brand Identity">
            {brandPanel}
          </section>

          {/* Right / Bottom: Clean Authentication Form */}
          <section className="auth-form-side" aria-label="Authentication Form">
            {children}
          </section>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="auth-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Encrypted & secure</span>
        </div>
        <div>
          <span>© 2026 UCONEXT</span>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
