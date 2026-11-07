import React from 'react';
import { Link } from 'react-router-dom';

export const GlowLogoIcon = ({ size = 32, color, style }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="glow-logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3a61f6" />
          <stop offset="100%" stopColor="#7b46f3" />
        </linearGradient>
      </defs>
      
      {/* Left bracket (G shape) */}
      <path 
        d="M 42 20 L 12 50 L 42 80" 
        stroke={color || "url(#glow-logo-grad)"} 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Right diamond with subtracted 4-point star (evenodd fill rule) */}
      <path 
        d="M 58 20 L 88 50 L 58 80 L 38 50 Z M 63 38 Q 63 50 75 50 Q 63 50 63 62 Q 63 50 51 50 Q 63 50 63 38 Z" 
        fill={color || "url(#glow-logo-grad)"} 
        fillRule="evenodd"
      />
    </svg>
  );
};

export const GlowLogo = ({ 
  size = 32, 
  fontSize = '22px', 
  showText = true, 
  color, 
  style, 
  textStyle,
  to = '/',
  ...props
}) => {
  const content = (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', ...style }}>
      <GlowLogoIcon size={size} color={color} />
      {showText && (
        <span style={{
          fontSize,
          fontWeight: '900',
          fontFamily: 'var(--font-display)',
          letterSpacing: '0.08em',
          background: color ? 'none' : 'var(--logo-gradient)',
          color: color || 'var(--text-primary)',
          WebkitBackgroundClip: color ? 'none' : 'text',
          WebkitTextFillColor: color ? 'none' : 'transparent',
          lineHeight: '1',
          ...textStyle
        }}>
          GLOWSTORE
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-block' }} {...props}>
        {content}
      </Link>
    );
  }

  return content;
};

export default GlowLogo;
