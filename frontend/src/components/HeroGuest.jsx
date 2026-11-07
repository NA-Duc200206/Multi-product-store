import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Zap, Sparkles, Globe, Users, Package, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollReveal from './ScrollReveal';
import { useTheme } from '../context/ThemeContext';

const AnimatedCounter = ({ end, duration = 2000, suffix = '', prefix = '', active }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [active, end, duration]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const HeroGuest = () => {
  const { isDark } = useTheme();
  const [statsVisible, setStatsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const statsRef = useRef(null);
  const heroRef = useRef(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Mouse parallax tracking
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const handleMouseMove = (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMouse({ x, y });
    };
    hero.addEventListener('mousemove', handleMouseMove);
    return () => hero.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const categories = [
    { name: 'Fashion', desc: 'Curated Designer Apparel', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=700&q=70' },
    { name: 'Electronics', desc: 'Next-Gen Smart Tech', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=70' },
    { name: 'Beauty', desc: 'Premium Cosmetics & Beauty', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=70' },
    { name: 'Gaming', desc: 'Ultimate Pro Setup Gears', img: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&w=700&q=70' },
    { name: 'Luxury Watches', desc: 'Timeless Premium Horology', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=70' },
    { name: 'Sneakers', desc: 'Streetwear & Hype Sneakers', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=70' },
    { name: 'Sports', desc: 'Activewear & Fitness Gear', img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=700&q=70' },
    { name: 'Home Appliances', desc: 'Smart Luxury Living Spaces', img: 'https://images.unsplash.com/photo-1585533844026-ac62764e5d6e?auto=format&fit=crop&w=700&q=70' }
  ];

  // Preload all slider images and category preview grid images on mount for instant rendering
  useEffect(() => {
    categories.forEach(cat => {
      const img = new Image();
      img.src = cat.img;
    });

    const gridImages = [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=75',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=75',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=500&q=75',
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=500&q=75',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=500&q=75'
    ];
    gridImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  // Category transition: cycle every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCategory(prev => (prev + 1) % categories.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [categories.length]);



  const headlineWords = "Authentic Products".split(" ");

  return (
    <>
      <style>{`
        .hero-guest-section {
          position: relative;
          overflow: hidden;
          padding: 40px 0 0 0;
          z-index: 2;
          background: ${isDark ? 'linear-gradient(180deg, rgba(14, 21, 45, 1) 0%, var(--bg-primary) 100%)' : 'linear-gradient(180deg, rgba(238, 242, 250, 1) 0%, var(--bg-primary) 100%)'};
        }
        .hero-guest-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          min-height: 95vh;
          position: relative;
          z-index: 2;
        }
        .hero-guest-left {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 6% 80px 12%;
          position: relative;
          z-index: 3;
        }
        .hero-guest-right {
          position: relative;
          overflow: visible; /* Allow card overflow to blend */
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          perspective: 1000px;
        }
        .hero-guest-right-card {
          width: 100%;
          height: 85%;
          max-height: 560px;
          position: relative;
          overflow: visible;
          transform-style: preserve-3d;
        }
        @keyframes heroImageZoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.12); }
        }
        .hero-color-fade-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(to right, rgba(58, 97, 246, 0.38) 0%, rgba(123, 70, 243, 0.18) 35%, rgba(92, 85, 214, 0.05) 60%, transparent 85%);
          z-index: 1;
          pointer-events: none;
        }
        [data-theme="light"] .hero-color-fade-overlay {
          background: linear-gradient(to right, rgba(58, 97, 246, 0.06) 0%, rgba(123, 70, 243, 0.08) 35%, rgba(92, 85, 214, 0.02) 60%, transparent 85%);
        }
        .blend-glow-sphere {
          position: absolute;
          top: 45%;
          left: 45%;
          transform: translate(-50%, -50%);
          width: 750px;
          height: 750px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(123, 70, 243, 0.6) 0%, rgba(58, 97, 246, 0.4) 40%, rgba(54, 211, 153, 0.2) 70%, transparent 100%);
          filter: blur(100px);
          opacity: 0.35;
          z-index: 1;
          pointer-events: none;
          animation: floatGlow 15s infinite alternate ease-in-out;
        }
        @media (min-width: 1025px) {
          .hero-guest-right-card {
            margin-left: -220px !important;
            z-index: 5;
          }
          .hero-guest-left {
            padding-right: 80px !important;
          }
        }

        /* Ambient Aurora Background */
        .aurora-container {
          position: absolute;
          top: -20%; left: -20%; right: -20%; bottom: -20%;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .aurora-bg {
          position: absolute;
          width: 140%;
          height: 140%;
          background: 
            radial-gradient(circle at 10% 20%, rgba(58, 97, 246, 0.35) 0%, transparent 45%),
            radial-gradient(circle at 90% 80%, rgba(123, 70, 243, 0.35) 0%, transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(92, 85, 214, 0.2) 0%, transparent 60%);
          filter: blur(80px);
          animation: auroraRotate 30s infinite alternate linear;
        }
        @keyframes auroraRotate {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.08) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        
        .noise-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.02;
          z-index: 1;
          pointer-events: none;
        }

        .hero-grid-floor {
          position: absolute;
          bottom: -20%; left: -50%; right: -50%; height: 70%;
          background-image: 
            linear-gradient(rgba(123, 70, 243, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(58, 97, 246, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          transform-origin: bottom center;
          animation: gridMove 15s linear infinite;
          z-index: 0;
          pointer-events: none;
          mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%);
          -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%);
        }
        @keyframes gridMove {
          0% { transform: perspective(800px) rotateX(75deg) translateY(0); }
          100% { transform: perspective(800px) rotateX(75deg) translateY(60px); }
        }

        /* Fluid Gradient Blobs */
        .gradient-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
          mix-blend-mode: screen;
        }
        [data-theme="light"] .gradient-blob {
          mix-blend-mode: multiply;
          opacity: 0.2;
        }
        
        .blob-1 { width: 45vw; height: 45vw; background: var(--color-primary); top: -15%; left: -10%; animation: floatBlob 25s infinite alternate ease-in-out; }
        .blob-2 { width: 55vw; height: 55vw; background: var(--color-accent); bottom: -20%; right: -15%; animation: floatBlob 28s infinite alternate-reverse ease-in-out; }
        .blob-3 { width: 35vw; height: 35vw; background: #34d399; top: 20%; left: 40%; animation: floatBlob 20s infinite alternate ease-in-out; }
        .blob-4 { width: 40vw; height: 40vw; background: #3b82f6; top: 50%; left: 5%; animation: floatBlob 30s infinite alternate-reverse ease-in-out; }
        .blob-5 { width: 30vw; height: 30vw; background: #f43f5e; top: 10%; right: 15%; animation: floatBlob 22s infinite alternate ease-in-out; }

        @keyframes floatBlob {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50% { transform: translate(8vw, -8vh) scale(1.15) rotate(180deg); }
          100% { transform: translate(-5vw, 10vh) scale(0.9) rotate(360deg); }
        }

        /* Text Shimmer Effect */
        .shimmer-text-glow {
          background-size: 200% auto;
          animation: textShimmer 6s linear infinite;
        }
        @keyframes textShimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        /* Abstract orbiting decoration */
        .abstract-orbit-ring {
          position: absolute;
          top: 15%;
          left: -150px;
          width: 450px;
          height: 450px;
          border: 1px dashed rgba(58, 97, 246, 0.12);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          animation: orbitRotate 60s linear infinite;
        }
        .abstract-orbit-ring::after {
          content: '';
          position: absolute;
          top: 20px;
          left: 20px;
          width: 408px;
          height: 408px;
          border: 1px solid rgba(123, 70, 243, 0.06);
          border-radius: 50%;
        }
        @keyframes orbitRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Pulsing badge dot */
        .badge-pulse-dot {
          width: 6px;
          height: 6px;
          background-color: var(--color-accent);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--color-accent);
          animation: pulseGlow 1.8s infinite ease-in-out;
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.5); opacity: 1; box-shadow: 0 0 14px var(--color-accent); }
        }

        /* Magnetic button enhancements */
        .cta-primary-glow {
          position: relative;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cta-primary-glow:hover {
          transform: scale(1.03);
          box-shadow: 0 15px 35px -5px rgba(58, 97, 246, 0.5), 0 0 20px rgba(123, 70, 243, 0.3);
        }
        .cta-secondary-glass {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cta-secondary-glass:hover {
          background: rgba(255,255,255,0.05);
          border-color: var(--color-accent);
          transform: scale(1.02);
        }

        @media (max-width: 968px) {
          .hero-guest-grid {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .hero-guest-left {
            padding: 60px 5% 40px 5%;
            text-align: center;
            align-items: center;
          }
          .hero-guest-right {
            height: 420px;
            padding: 20px;
          }
          .hero-guest-right::before {
            background: linear-gradient(to bottom, var(--bg-primary) 0%, transparent 20%);
          }
          .hero-guest-cta { flex-direction: column; width: 100%; }
          .hero-guest-cta a { width: 100%; justify-content: center; }
        }

        .floating-spark-symbol {
          position: absolute;
          font-size: 16px;
          color: rgba(58, 97, 246, 0.16);
          pointer-events: none;
          user-select: none;
          animation: spinFloat 10s infinite ease-in-out;
        }
        @keyframes spinFloat {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0.15; }
          50% { transform: translateY(-25px) rotate(180deg) scale(1.35); opacity: 0.55; }
        }
      `}</style>

      <section className="hero-guest-section" ref={heroRef}>
        {/* Animated Aurora & Noise Background */}
        <div className="aurora-container">
          <div className="gradient-blob blob-1" />
          <div className="gradient-blob blob-2" />
          <div className="gradient-blob blob-3" />
          <div className="gradient-blob blob-4" />
          <div className="gradient-blob blob-5" />
          <div className="aurora-bg" />
          <div className="hero-grid-floor" />
          <div className="noise-overlay" />
          <div className="blend-glow-sphere" />
          <div className="hero-color-fade-overlay" />
        </div>

        {/* Cinematic Mouse Spotlight Glow */}
        <div style={{
          position: 'absolute',
          left: `${(mouse.x + 0.5) * 100}%`,
          top: `${(mouse.y + 0.5) * 100}%`,
          width: '900px', height: '900px',
          borderRadius: '50%',
          background: isDark
            ? 'radial-gradient(circle, rgba(123,70,243,0.06) 0%, transparent 60%)'
            : 'radial-gradient(circle, rgba(58,97,246,0.05) 0%, transparent 60%)',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 1,
          willChange: 'left, top'
        }} />


        <div className="hero-guest-grid">
          {/* Left: Content */}
          <div className="hero-guest-left" style={{ overflow: 'visible' }}>
            <div className="abstract-orbit-ring" />
            <ScrollReveal direction="left" duration={800}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '8px 20px',
                  background: isDark ? 'rgba(58, 97, 246, 0.12)' : 'rgba(58, 97, 246, 0.08)',
                  border: '1px solid rgba(58, 97, 246, 0.25)',
                  boxShadow: '0 4px 20px rgba(58, 97, 246, 0.15)',
                  borderRadius: '100px', fontSize: '11px', fontWeight: '800',
                  color: 'var(--color-accent)', marginBottom: '32px',
                  textTransform: 'uppercase', letterSpacing: '0.2em'
                }}
              >
                Vietnam's Premium Multi-Brand Mall
              </motion.div>

              {/* Headline */}
              <h1 style={{
                fontSize: 'clamp(38px, 5vw, 64px)',
                fontWeight: '950', lineHeight: '1.05',
                color: 'var(--text-primary)',
                marginBottom: '20px', letterSpacing: '-0.04em'
              }}>
                {headlineWords.map((word, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    style={{ display: 'inline-block', marginRight: '14px' }}
                  >
                    {word}
                  </motion.span>
                ))}
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="shimmer-text-glow"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, #7b46f3 50%, var(--color-accent) 100%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                    paddingRight: '8px'
                  }}
                >
                  Premium Experience
                </motion.span>
              </h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: 'clamp(15px, 1.6vw, 17px)',
                  color: 'var(--text-secondary)', lineHeight: '1.75',
                  marginBottom: '40px', maxWidth: '540px'
                }}
              >
                Discover a multi-category shopping ecosystem — from premium fashion, cutting-edge electronics to certified imported cosmetics. Everything authenticated and fully warranted.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="hero-guest-cta"
                style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px' }}
              >
                <Link to="/register" className="shining-btn cta-primary-glow" style={{
                  background: 'var(--color-accent)', color: '#ffffff', border: 'none',
                  padding: '18px 40px', fontSize: '15px', fontWeight: '800',
                  borderRadius: '14px', display: 'inline-flex', alignItems: 'center',
                  gap: '10px', textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 25px rgba(58, 97, 246, 0.4)'
                }}>
                  Sign Up Free <ArrowRight size={17} />
                </Link>
                <Link to="/login" className="cta-secondary-glass" style={{
                  background: 'var(--glass-bg)', color: 'var(--text-primary)',
                  border: '1px solid var(--glass-border)',
                  padding: '18px 36px', fontSize: '15px', fontWeight: '700',
                  borderRadius: '14px', display: 'inline-flex', alignItems: 'center',
                  textDecoration: 'none', transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Sign In
                </Link>
              </motion.div>




            </ScrollReveal>
          </div>

          {/* Right: Immersive Living Hero Showcase */}
          <div className="hero-guest-right">
            <div
              className="hero-guest-right-card"
              style={{
                transform: `perspective(1000px) rotateY(${mouse.x * 4}deg) rotateX(${-mouse.y * 4}deg) translateZ(0)`,
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >


              {/* Floating 3D Product Ecosystem */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                {[
                  { img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=400', top: '-2%', left: '52%', width: '240px', parallax: 80, delay: 0, duration: 6, rot: 5 }, // Headphones
                  { img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400', top: '30%', left: '60%', width: '280px', parallax: 120, delay: 1, duration: 8, rot: -8 }, // Watch
                  { img: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&q=80&w=400', top: '42%', left: '4%', width: '220px', parallax: 60, delay: 0.5, duration: 7, rot: 12 }, // Controller
                  { img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=400', top: '4%', left: '8%', width: '200px', parallax: 40, delay: 1.5, duration: 6.5, rot: -5 }, // Sneakers
                  { img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=400', top: '72%', left: '38%', width: '190px', parallax: 90, delay: 2, duration: 7.5, rot: 8 }, // Cosmetics
                ].map((prod, idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      y: [0, -20, 0],
                      rotate: [prod.rot, prod.rot + 5, prod.rot]
                    }}
                    transition={{
                      duration: prod.duration,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: prod.delay
                    }}
                    style={{
                      position: 'absolute',
                      top: prod.top,
                      left: prod.left,
                      width: prod.width,
                      height: prod.width,
                      borderRadius: '16px',
                      backgroundImage: `url(${prod.img})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      transform: `translate(${mouse.x * prod.parallax}px, ${mouse.y * prod.parallax}px)`,
                      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      zIndex: 10 + idx
                    }}
                  >
                  </motion.div>
                ))}
              </div>



              {/* Dynamic light reflection sweeping overlay */}
              <motion.div
                animate={{
                  left: ['-100%', '200%']
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  width: '50%',
                  height: '100%',
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)',
                  transform: 'skewX(-25deg)',
                  zIndex: 2,
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div ref={statsRef} style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px', background: 'var(--glass-border)',
          borderTop: '1px solid var(--glass-border)',
          borderBottom: '1px solid var(--glass-border)',
          position: 'relative', zIndex: 3
        }}>
          {[
            { icon: <Users size={22} color="#3a61f6" />, value: 120000, suffix: '+', label: 'Trusted Customers' },
            { icon: <Package size={22} color="#34d399" />, value: 50000, suffix: '+', label: 'Authentic Products' },
            { icon: <Globe size={22} color="#7b46f3" />, value: 200, suffix: '+', label: 'Global Brands' },
            { icon: <Zap size={22} color="#fbbf24" />, value: 99, suffix: '%', label: 'Satisfaction Rate' }
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--bg-primary)',
              padding: '28px 24px', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
            }}>
              <div style={{
                fontSize: 'clamp(22px, 2.5vw, 30px)', fontWeight: '900',
                color: 'var(--text-primary)', letterSpacing: '-0.02em'
              }}>
                <AnimatedCounter end={s.value} suffix={s.suffix} active={statsVisible} duration={1800} />
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Category Preview Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          padding: '50px 5%',
          position: 'relative',
          zIndex: 3
        }}>
          {[
            { title: 'Fashion', desc: 'Latest collections from top designers', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600', color: '#fbbf24', link: '/products?categoryId=fashion' },
            { title: 'Electronics', desc: 'Cutting-edge tech & premium audio', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600', color: '#3a61f6', link: '/products?categoryId=electronics' },
            { title: 'Cosmetics', desc: 'Authentic beauty from Paris & Seoul', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600', color: '#a699da', link: '/products?categoryId=cosmetics' },
            { title: 'Accessories', desc: 'Elegant watches, jewelry & sunglasses', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600', color: '#7b46f3', link: '/products?categoryId=accessories' },
            { title: 'Home & Living', desc: 'Premium items for a luxury home space', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600', color: '#34d399', link: '/products?categoryId=home-living' }
          ].map((cat, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 100}>
              <Link to={cat.link} style={{
                display: 'block', position: 'relative', height: '280px',
                borderRadius: '20px', overflow: 'hidden', textDecoration: 'none',
                border: '1px solid var(--glass-border)',
                transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'; e.currentTarget.style.borderColor = cat.color + '70'; e.currentTarget.style.boxShadow = `0 15px 30px ${cat.color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: `url(${cat.img})`, backgroundSize: 'cover',
                  backgroundPosition: 'center', transition: 'transform 0.6s ease'
                }} />
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'linear-gradient(to top, rgba(3,7,18,0.95) 10%, rgba(3,7,18,0.4) 60%, transparent 100%)'
                }} />
                <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', zIndex: 2 }}>
                  <div style={{ fontSize: '10px', fontWeight: '800', color: cat.color, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '6px' }}>
                    Explore
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', margin: '0 0 6px 0' }}>{cat.title}</h3>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: '1.4' }}>{cat.desc}</p>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
};

export default HeroGuest;
