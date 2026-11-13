import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const HERO_CAMPAIGN_IMAGE =
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=85&w=1920';

const HeroGuest = () => {
  const scrollToCollection = (e) => {
    e.preventDefault();
    const el = document.getElementById('curated-collection');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#070b18',
      }}
    >
      <style>{`
        .editorial-hero-canvas {
          position: relative;
          width: 100%;
          min-height: clamp(520px, 78vh, 740px);
          display: flex;
          align-items: flex-end;
        }
        .editorial-hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 0;
        }
        .editorial-hero-scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(6, 10, 24, 0.92) 0%, rgba(6, 10, 24, 0.56) 44%, rgba(6, 10, 24, 0.22) 100%),
            linear-gradient(to right, rgba(6, 10, 24, 0.72) 0%, rgba(6, 10, 24, 0.28) 52%, transparent 100%);
          z-index: 1;
        }
        .editorial-hero-inner {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
          padding: 72px 32px 64px 32px;
        }
        .editorial-hero-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .editorial-hero-canvas {
            min-height: 480px;
          }
          .editorial-hero-inner {
            padding: 48px 20px 44px 20px;
          }
        }
        @media (max-width: 480px) {
          .editorial-hero-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .editorial-hero-actions a {
            justify-content: center;
          }
        }
      `}</style>

      <div className="editorial-hero-canvas">
        <img
          src={HERO_CAMPAIGN_IMAGE}
          alt="UCONEXT Editorial Campaign"
          className="editorial-hero-bg"
        />
        <div className="editorial-hero-scrim" aria-hidden="true" />

        <div className="editorial-hero-inner">
          <div style={{ maxWidth: '640px' }}>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'block',
                fontSize: '11.5px',
                fontWeight: '700',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#93c5fd',
                marginBottom: '16px',
              }}
            >
              UCONEXT — 2026 Editorial Campaign
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(38px, 5vw, 66px)',
                fontWeight: '800',
                lineHeight: '1.05',
                letterSpacing: '-0.035em',
                color: '#ffffff',
                margin: '0 0 20px 0',
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              }}
            >
              Connected living, designed for{' '}
              <span style={{ color: '#60a5fa' }}>next trends.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: 'rgba(226, 232, 240, 0.88)',
                margin: '0 0 32px 0',
                maxWidth: '500px',
              }}
            >
              A curated world of acoustic engineering, tailored apparel, horology, and clean skincare — authenticated for modern living.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="editorial-hero-actions"
            >
              <Link
                to="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  height: '50px',
                  padding: '0 30px',
                  borderRadius: '10px',
                  fontSize: '14.5px',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: '#2454F4',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1b3ec8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2454F4';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Explore Collection</span>
                <ArrowRight size={16} />
              </Link>

              <a
                href="#curated-collection"
                onClick={scrollToCollection}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  height: '50px',
                  padding: '0 26px',
                  borderRadius: '10px',
                  fontSize: '14.5px',
                  fontWeight: '600',
                  color: '#ffffff',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.24)',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.24)';
                }}
              >
                <span>Discover More</span>
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroGuest;
