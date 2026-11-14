import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * Oversized sculptural UCONEXT stylized 'U' mark
 */
const SculpturalUMark = ({ size = 156 }) => (
  <svg
    width={size}
    height={size}
    viewBox="10 10 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      filter:
        'drop-shadow(0 24px 48px rgba(10, 22, 70, 0.55)) drop-shadow(0 4px 16px rgba(59, 130, 246, 0.35))',
      overflow: 'visible',
    }}
  >
    <defs>
      <linearGradient id="uconextArtFill" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="38%" stopColor="#dbeafe" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
      <linearGradient id="uconextArtStroke" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
        <stop offset="100%" stopColor="rgba(147, 197, 253, 0.35)" />
      </linearGradient>
    </defs>
    <path
      d="
        M 10 10
        H 30.5
        V 58
        C 30.5 66.8, 37.2 71.5, 50 71.5
        C 62.8 71.5, 69.5 66.8, 69.5 58
        V 46.5
        L 81.5 33
        L 69.5 19.5
        V 10
        H 90
        V 57
        C 90 77.5, 74.5 90, 50 90
        C 25.5 90, 10 77.5, 10 57
        Z
      "
      fill="url(#uconextArtFill)"
      stroke="url(#uconextArtStroke)"
      strokeWidth="1"
    />
  </svg>
);

/**
 * Signature Stylized 'X' Glyph from the UCONEXT wordmark
 */
const WordmarkXGlyph = ({ size = 32, color = '#60a5fa' }) => (
  <svg
    viewBox="0 0 100 110"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      height: `${size * 0.74}px`,
      width: 'auto',
      display: 'inline-block',
      verticalAlign: 'baseline',
      margin: '0 1.5px',
      transform: 'translateY(1px)',
    }}
  >
    <path
      d="
        M 3 0
        H 30
        L 51 35
        L 72 0
        H 98
        L 66 55
        L 98 110
        H 72
        L 51 75
        L 30 110
        H 3
        L 23 78
        V 69
        L 29.5 79
        L 44.5 55
        L 29.5 31
        L 23 41
        V 32
        Z
      "
      fill={color}
    />
  </svg>
);

const AuthBrandPanel = () => {
  const { isDark } = useTheme();

  return (
    <div className="brand-panel-root">
      <style>{`
        .brand-panel-root {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 600px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 42px 40px;
          border-radius: 22px;
          background: ${
            isDark
              ? 'linear-gradient(155deg, #060b1d 0%, #0b1840 48%, #14328c 100%)'
              : 'linear-gradient(155deg, #07102a 0%, #0f2259 50%, #1d47bd 100%)'
          };
          color: #ffffff;
          user-select: none;
          overflow: hidden;
        }

        .brand-art-stage {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 28px 0;
        }

        .brand-sculptural-frame {
          position: relative;
          width: 244px;
          height: 244px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .brand-wordmark-block {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        @media (max-width: 960px) {
          .brand-panel-root {
            min-height: auto;
            padding: 26px 26px;
            border-radius: 16px;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }
          .brand-top-meta {
            display: none !important;
          }
          .brand-art-stage {
            flex: 0 0 auto;
            padding: 0;
            order: 2;
          }
          .brand-sculptural-frame {
            width: 108px;
            height: 108px;
          }
          .brand-sculptural-frame svg {
            width: 62px !important;
            height: 62px !important;
          }
          .brand-wordmark-block {
            order: 1;
            gap: 6px;
          }
          .brand-slogan-text {
            font-size: 16px !important;
          }
        }

        @media (max-width: 520px) {
          .brand-panel-root {
            padding: 20px 18px;
          }
          .brand-sculptural-frame {
            width: 82px;
            height: 82px;
          }
          .brand-sculptural-frame svg {
            width: 48px !important;
            height: 48px !important;
          }
          .brand-slogan-text {
            font-size: 14px !important;
          }
        }
      `}</style>

      {/* Subtle Soft Lighting & Abstract Brand Geometry */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
        aria-hidden="true"
      >
        {/* Primary Luminous Blue Glow */}
        <div
          style={{
            position: 'absolute',
            top: '36%',
            left: '50%',
            width: '440px',
            height: '440px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.36) 0%, rgba(36, 84, 244, 0.14) 45%, transparent 72%)',
            filter: 'blur(56px)',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Secondary Upper Highlight */}
        <div
          style={{
            position: 'absolute',
            top: '-18%',
            right: '-14%',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(147, 197, 253, 0.22) 0%, transparent 70%)',
            filter: 'blur(48px)',
          }}
        />

        {/* Minimal Geometric Rings & 45° Architectural Accent Echoing the U-Cut */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="ringStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
              <stop offset="100%" stopColor="rgba(96, 165, 250, 0.04)" />
            </linearGradient>
            <linearGradient id="diagBeam" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(96, 165, 250, 0)" />
              <stop offset="50%" stopColor="rgba(191, 219, 254, 0.18)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>
          </defs>

          {/* Concentric Minimal Circles */}
          <circle
            cx="50%"
            cy="46%"
            r="155"
            fill="none"
            stroke="url(#ringStroke)"
            strokeWidth="1"
          />
          <circle
            cx="50%"
            cy="46%"
            r="230"
            fill="none"
            stroke="rgba(255, 255, 255, 0.07)"
            strokeWidth="0.75"
          />

          {/* Subtle 45-degree Geometric Line Echoing the U Notch */}
          <line
            x1="15%"
            y1="82%"
            x2="92%"
            y2="5%"
            stroke="url(#diagBeam)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Top Editorial Header */}
      <div
        className="brand-top-meta"
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: 'rgba(219, 234, 254, 0.72)',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          UCONEXT IDENTITY
        </span>
        <span
          style={{
            width: '28px',
            height: '2px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(96,165,250,0.2))',
          }}
        />
      </div>

      {/* Center: Oversized Sculptural U-Mark Art Composition */}
      <div className="brand-art-stage">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="brand-sculptural-frame"
        >
          {/* Back Translucent Rounded Plane */}
          <div
            style={{
              position: 'absolute',
              inset: '12px',
              borderRadius: '38px',
              background:
                'linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow:
                'inset 0 1px 1px rgba(255, 255, 255, 0.25), 0 28px 60px rgba(4, 9, 28, 0.45)',
              transform: 'rotate(6deg)',
            }}
          />

          {/* Inner Counter-Rotated Frosted Surface */}
          <div
            style={{
              position: 'absolute',
              inset: '20px',
              borderRadius: '30px',
              background:
                'linear-gradient(145deg, rgba(12, 26, 68, 0.55) 0%, rgba(23, 61, 166, 0.35) 100%)',
              border: '1px solid rgba(147, 197, 253, 0.22)',
              transform: 'rotate(-3deg)',
            }}
          />

          {/* Central Oversized UCONEXT U-Mark */}
          <div style={{ position: 'relative', zIndex: 3 }}>
            <SculpturalUMark size={126} />
          </div>
        </motion.div>
      </div>

      {/* Bottom: Large Brand Typography & Short Slogan */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="brand-wordmark-block"
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            fontSize: '32px',
            fontWeight: '800',
            letterSpacing: '-0.03em',
            color: '#ffffff',
            lineHeight: '1',
          }}
        >
          <span>UCONE</span>
          <WordmarkXGlyph size={32} color="#93c5fd" />
          <span>T</span>
        </div>

        <p
          className="brand-slogan-text"
          style={{
            fontSize: '18px',
            fontWeight: '500',
            letterSpacing: '-0.015em',
            lineHeight: '1.35',
            color: 'rgba(226, 232, 240, 0.88)',
            margin: 0,
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          }}
        >
          Connected living. Smarter choices.
        </p>
      </motion.div>
    </div>
  );
};

export default AuthBrandPanel;
