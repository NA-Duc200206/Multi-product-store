import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * GlowLogoIcon — Custom royal blue (#2454F4) U-mark with a 45° triangular cut on the right arm
 * Engineered 1:1 matching frontend/public/asset/image.png
 * ViewBox 10 10 80 80 removes extra whitespace so the U naturally leads into CONEXT.
 */
export const GlowLogoIcon = ({ size, color = '#2454F4', style }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="10 10 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        flexShrink: 0,
        height: size ? size : '0.84em',
        width: size ? size : '0.84em',
        display: 'inline-block',
        verticalAlign: 'middle',
        ...style,
      }}
    >
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
        fill={color}
      />
    </svg>
  );
};

/**
 * UconextStylizedX — Stylized royal blue (#2454F4) X glyph with dual left-side prongs
 * Precision engineered from the logo sample at frontend/public/asset/image.png
 */
export const UconextStylizedX = ({ color = '#2454F4', style }) => {
  return (
    <svg
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        height: '0.74em',
        width: 'auto',
        display: 'inline-block',
        verticalAlign: 'baseline',
        marginLeft: '0.01em',
        marginRight: '0.01em',
        transform: 'translateY(0.015em)',
        ...style,
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
};

export const GlowLogo = ({
  size,
  fontSize = '26px',
  showText = true,
  color,
  iconColor = '#2454F4',
  style,
  textStyle,
  to = '/',
  ...props
}) => {
  const { isDark } = useTheme();
  const baseTextColor = color || (isDark ? '#FFFFFF' : '#0E1329');

  const content = (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        userSelect: 'none',
        ...style,
      }}
    >
      <GlowLogoIcon size={size} color={iconColor} style={{ marginRight: '1px' }} />
      {showText && (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'baseline',
            fontSize,
            fontWeight: '800',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            letterSpacing: '-0.02em',
            color: baseTextColor,
            lineHeight: '1',
            ...textStyle,
          }}
        >
          <span>CONE</span>
          <UconextStylizedX color={iconColor} />
          <span>T</span>
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link
        to={to}
        style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
        {...props}
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default GlowLogo;
