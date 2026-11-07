import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { useTheme } from '../context/ThemeContext';

const HeroLoggedIn = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    {
      title: "SARTORIAL ELEGANCE",
      subtitle: "Curated minimalist apparel and seasonal wardrobe staples from prestige designers.",
      tag: "Summer Collection 2026",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1400",
      buttonText: "Shop Fashion",
      link: "/products?categoryId=fashion"
    },
    {
      title: "ACOUSTIC PRECISION",
      subtitle: "Experience absolute audio clarity with industry-leading active noise cancellation.",
      tag: "High-Fidelity Tech",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=1400",
      buttonText: "Explore Audio",
      link: "/products?categoryId=electronics"
    },
    {
      title: "TIMELESS AESTHETICS",
      subtitle: "Nourish your skin and reveal natural radiance with our luxury beauty curations.",
      tag: "Prestige Cosmetics",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1400",
      buttonText: "Discover Beauty",
      link: "/products?categoryId=cosmetics"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6500);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  return (
    <section style={{
      padding: '48px 5% 40px 5%',
      position: 'relative',
      zIndex: 2,
      background: isDark ? 'linear-gradient(180deg, rgba(14, 21, 45, 1) 0%, var(--bg-primary) 100%)' : 'linear-gradient(180deg, rgba(238, 242, 250, 1) 0%, var(--bg-primary) 100%)'
    }}>
      <style>{`
        .cinema-slider-container {
          position: relative;
          width: 100%;
          height: 480px;
          border-radius: 20px;
          overflow: hidden;
          background: #090d16;
          border: 1px solid var(--glass-border);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.4);
        }
        .slide-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 7s ease, opacity 0.8s ease-in-out;
          opacity: 0;
          transform: scale(1.05);
        }
        .slide-bg.active {
          opacity: 0.65;
          transform: scale(1);
        }
        .slide-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(3, 7, 18, 0.95) 0%, rgba(3, 7, 18, 0.65) 45%, rgba(3, 7, 18, 0.2) 100%);
          z-index: 1;
        }
        .slide-content-box {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 8%;
          max-width: 650px;
        }
        .slide-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          opacity: 0;
        }
        .cinema-slider-container:hover .slide-nav-btn {
          opacity: 1;
        }
        .slide-nav-btn:hover {
          background: white;
          color: #030712;
          border-color: white;
          transform: translateY(-50%) scale(1.05);
        }
        .slide-dots-container {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex;
          gap: 10px;
        }
        .slide-dot {
          width: 24px;
          height: 3px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .slide-dot.active {
          background: white;
          width: 40px;
        }
        .slider-welcome-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--color-accent);
          margin-bottom: 16px;
        }
        .slider-h1 {
          font-size: 44px;
          font-weight: 900;
          color: white;
          line-height: 1.1;
          margin: 0 0 16px 0;
          letter-spacing: -0.03em;
        }
        .slider-desc {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin: 0 0 32px 0;
        }
        @media (max-width: 768px) {
          .cinema-slider-container {
            height: 400px;
          }
          .slider-h1 {
            font-size: 32px;
          }
          .slider-desc {
            font-size: 13px;
            margin-bottom: 24px;
          }
          .slide-content-box {
            padding: 0 5%;
          }
        }
      `}</style>

      <ScrollReveal direction="up" duration={600}>
        <div className="cinema-slider-container">
          {/* Slides background images */}
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`slide-bg ${currentSlide === idx ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}

          {/* Text and dark overlay */}
          <div className="slide-overlay" />

          {/* Slide Text Content */}
          <div className="slide-content-box">
            <span className="slider-welcome-badge">
              Hello, {user?.name || 'Shopper'} • {slides[currentSlide].tag}
            </span>
            <h1 className="slider-h1">
              {slides[currentSlide].title}
            </h1>
            <p className="slider-desc">
              {slides[currentSlide].subtitle}
            </p>
            <div>
              <Link
                to={slides[currentSlide].link}
                className="btn btn-accent"
                style={{
                  padding: '14px 28px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#030712',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  boxShadow: '0 8px 24px rgba(255,255,255,0.1)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {slides[currentSlide].buttonText} <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Navigation Controls */}
          <button className="slide-nav-btn" style={{ left: '20px' }} onClick={handlePrev}>
            <ChevronLeft size={20} />
          </button>
          <button className="slide-nav-btn" style={{ right: '20px' }} onClick={handleNext}>
            <ChevronRight size={20} />
          </button>

          {/* Slide indicators */}
          <div className="slide-dots-container">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`slide-dot ${currentSlide === idx ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default HeroLoggedIn;
