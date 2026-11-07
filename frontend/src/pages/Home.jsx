import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { ProductListSkeleton } from '../components/SkeletonLoader';
import ScrollReveal from '../components/ScrollReveal';
import HeroGuest from '../components/HeroGuest';
import HeroLoggedIn from '../components/HeroLoggedIn';
import GlowLogo from '../components/GlowLogo';
import { Sparkles, Sparkle, ArrowRight, ShieldCheck, Truck, RotateCcw, Star, Quote, ArrowUpRight, Percent, ChevronDown, Users, Package, Globe, Zap, Heart, Eye, MessageSquare, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

const CategoryCard3D = ({ cat, img }) => {
  const { isDark } = useTheme();
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    const rX = -(mouseY / height) * 15;
    const rY = (mouseX / width) * 15;
    setTilt({ rotateX: rX, rotateY: rY, x: mouseX * 0.08, y: mouseY * 0.08 });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        width: '100%',
        height: '300px',
        position: 'relative'
      }}
    >
      <Link
        to={`/products?categoryId=${cat.id}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          width: '100%',
          height: '100%',
          borderRadius: '24px',
          overflow: 'hidden',
          textDecoration: 'none',
          border: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(1.01)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.3s ease',
          boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
          position: 'relative'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(58, 97, 246, 0.4)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(58, 97, 246, 0.15), 0 15px 35px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--glass-border)';
          e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-10%', left: '-10%', right: '-10%', bottom: '-10%',
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `translateX(${tilt.x}px) translateY(${tilt.y}px) scale(1.1)`,
            transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
            zIndex: 0
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to top, rgba(var(--bg-rgb), 0.92) 15%, rgba(var(--bg-rgb), 0.25) 60%, transparent 100%)',
            zIndex: 1
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: `radial-gradient(circle at ${tilt.rotateY * 5 + 50}% ${tilt.rotateX * 5 + 50}%, rgba(58, 97, 246, 0.12) 0%, transparent 60%)`,
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            padding: '24px',
            transform: 'translateZ(30px)',
            transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          <span style={{ fontSize: '9px', fontWeight: '800', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.22em', display: 'block', marginBottom: '6px' }}>
            Explore Department
          </span>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
            {cat.name}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.45' }}>
            {cat.description || 'Premium curated items'}
          </p>
          <div style={{
            position: 'absolute', top: '-10px', right: '24px',
            background: 'var(--glass-bg)', padding: '12px', borderRadius: '50%',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
            transform: `translateZ(40px) scale(${tilt.rotateX || tilt.rotateY ? 1.1 : 1})`,
            transition: 'all 0.3s ease',
            color: 'var(--text-primary)'
          }}>
            <ArrowUpRight size={18} />
          </div>
        </div>
      </Link>
    </div>
  );
};

const AnimatedStatsCounter = ({ end, active, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = end / 100; // 100 frames
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, end]);
  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

const AIShoppingAssistant = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Welcome to GlowStore! I am your AI Shopping Assistant. How can I help you discover something premium today?', time: 'Just now' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    "Suggest a premium speaker",
    "Running activewear recommendations",
    "Luxury watches for gifts",
    "Top imported skincare products"
  ];

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const handleSend = (textToSend) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text, time: 'Just now' }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponse = "I can help with that! We offer certified authentic products in that category. Let me filter our latest stock for you.";
      
      const lower = text.toLowerCase();
      if (lower.includes('speaker') || lower.includes('audio') || lower.includes('sound')) {
        aiResponse = "I highly recommend the Marshall Acton III Speaker in our audio collection. It offers premium room-filling acoustic performance, 30W output power, and a gorgeous vintage cabinet design.";
      } else if (lower.includes('activewear') || lower.includes('running') || lower.includes('sport')) {
        aiResponse = "Check out our Sports & Fitness collection. We feature Nike AeroSwift running apparel and Adidas UltraBoost sneakers for supreme ventilation and bounce.";
      } else if (lower.includes('watch') || lower.includes('luxury') || lower.includes('gift')) {
        aiResponse = "For a timeless gift, explore our Luxury Accessories. The Rolex Submariner or Rolex Oyster Perpetual offer certified authentic heritage craftsmanship with local warranting.";
      } else if (lower.includes('skin') || lower.includes('cosmetic') || lower.includes('beauty') || lower.includes('skincare')) {
        aiResponse = "Our Beauty Department offers premium imported skincare. The L'Oréal Revitalift Laser Serum is one of our top-rated recommendations for cell repair and hydration.";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse, time: 'Just now' }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -40, 0],
            x: [0, (i % 2 === 0 ? 30 : -30), 0],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.5
          }}
          style={{
            position: 'absolute',
            width: `${4 + i}px`,
            height: `${4 + i}px`,
            borderRadius: '50%',
            background: 'var(--color-accent)',
            top: `${20 + i * 15}%`,
            left: `${10 + i * 15}%`,
            filter: 'blur(2px)',
            pointerEvents: 'none'
          }}
        />
      ))}
    <div className="glass-card" style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr', gap: '20px', padding: '24px', maxWidth: '800px', margin: '0 auto', border: '1px solid rgba(92, 85, 214, 0.25)', boxShadow: '0 20px 50px rgba(58, 97, 246, 0.15)', backdropFilter: 'blur(20px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), #7b46f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', position: 'relative' }}>
            <Bot size={20} />
            <span style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-success)', border: '2px solid var(--bg-primary)' }} />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: '800' }}>GlowAI Assistant</h4>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Online & Ready to Help</span>
          </div>
        </div>
        <span className="badge badge-success" style={{ fontSize: '9px', padding: '4px 10px' }}>PRO VERSION</span>
      </div>

      <div style={{ height: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px', scrollbarWidth: 'none' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%',
              padding: '12px 18px',
              borderRadius: msg.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
              background: msg.sender === 'user' ? 'var(--color-accent)' : 'var(--bg-secondary)',
              border: msg.sender === 'user' ? 'none' : '1px solid var(--glass-border)',
              color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
              fontSize: '13px',
              lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ padding: '16px 20px', borderRadius: '18px 18px 18px 2px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} style={{ width: '6px', height: '6px', background: 'var(--color-accent)', borderRadius: '50%' }} />
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} style={{ width: '6px', height: '6px', background: 'var(--color-accent)', borderRadius: '50%' }} />
              <motion.span animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} style={{ width: '6px', height: '6px', background: 'var(--color-accent)', borderRadius: '50%' }} />
            </div>
          </motion.div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(sug)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(58, 97, 246, 0.1)'; e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          >
            {sug}
          </button>
        ))}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask GlowAI to find products, verify brands..."
          style={{
            flex: 1,
            background: 'var(--input-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            padding: '12px 16px',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
        />
        <button
          type="submit"
          style={{
            background: 'var(--color-accent)',
            border: 'none',
            borderRadius: '12px',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(58, 97, 246, 0.3)'
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
    </div>
  );
};

const ReviewSlider = () => {
  const { isDark } = useTheme();
  const reviews = [
    { quote: "Absolutely authentic products. Sourced my premium fashion shoes here. Packaging and invoice receipt were fully authentic.", author: "Elena R.", title: "Verified Fashion Buyer", rating: 5, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150" },
    { quote: "GlowStore's customer service is top tier. They answered all my warranty questions regarding the OLED screen in minutes.", author: "Marcus T.", title: "Elite Tech Member", rating: 5, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
    { quote: "The support team helped me select the right keyboard switch. Extremely fast shipping and robust support.", author: "David P.", title: "Verified Buyer", rating: 5, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" }
  ];

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', padding: '20px 0', maxWidth: '750px', margin: '0 auto' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIdx}
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card"
          style={{
            padding: '40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            border: '1px solid var(--glass-border)',
            boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 10px 30px rgba(16, 39, 111, 0.05)'
          }}
        >
          <div style={{ display: 'flex', gap: '4px', color: '#ffb800' }}>
            {[...Array(reviews[activeIdx].rating)].map((_, i) => (
              <Star key={i} size={18} fill="#ffb800" stroke="none" />
            ))}
          </div>
          <p style={{ fontSize: '16px', lineHeight: '1.7', fontStyle: 'italic', color: 'var(--text-secondary)', position: 'relative', margin: 0 }}>
            <Quote size={32} style={{ position: 'absolute', top: '-20px', left: '-20px', opacity: 0.08, color: 'var(--text-primary)' }} />
            {reviews[activeIdx].quote}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={reviews[activeIdx].avatar}
              alt={reviews[activeIdx].author}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-accent)' }}
            />
            <div style={{ textAlign: 'left' }}>
              <h5 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '15px', fontWeight: '800' }}>{reviews[activeIdx].author}</h5>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{reviews[activeIdx].title}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
        {reviews.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIdx(i)}
            style={{
              width: i === activeIdx ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === activeIdx ? 'var(--color-accent)' : 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>
    </div>
  );
};

const FinalCTA = () => {
  const { isDark } = useTheme();
  return (
    <section style={{
      position: 'relative', padding: '140px 5%', textAlign: 'center', overflow: 'hidden',
      background: 'linear-gradient(to bottom, var(--bg-primary), rgba(var(--bg-secondary-rgb), 1))'
    }}>
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '20%', left: '30%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(58,97,246,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none'
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', bottom: '10%', right: '20%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,70,243,0.2) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none'
        }}
      />
      
      <ScrollReveal direction="up">
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge badge-primary" style={{ marginBottom: '20px', letterSpacing: '0.25em' }}>GET STARTED</span>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '950',
            color: 'var(--text-primary)', lineHeight: '1.05',
            marginBottom: '28px', letterSpacing: '-0.04em'
          }}>
            Ready to elevate your<br />
            <span style={{
              background: 'linear-gradient(135deg, var(--color-accent), #7b46f3)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>shopping experience?</span>
          </h2>
          <p style={{
            fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'var(--text-secondary)',
            maxWidth: '580px', margin: '0 auto 48px auto', lineHeight: '1.7'
          }}>
            Join GlowStore today. Discover authentic, warranty-backed products from global luxury and streetwear brands.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="shining-btn" style={{
              background: 'linear-gradient(135deg, var(--color-accent) 0%, #7b46f3 100%)',
              color: '#ffffff', border: 'none', padding: '20px 48px', fontSize: '16px', fontWeight: '800',
              borderRadius: '16px', textDecoration: 'none',
              boxShadow: '0 12px 35px rgba(123, 70, 243, 0.4), 0 0 60px rgba(58,97,246,0.1)'
            }}>
              Register Now
            </Link>
            <Link to="/products" style={{
              background: 'var(--glass-bg)', color: 'var(--text-primary)',
              border: '1px solid var(--glass-border)', padding: '20px 40px', fontSize: '16px', fontWeight: '700',
              borderRadius: '16px', textDecoration: 'none', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
              backdropFilter: 'blur(12px)'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Explore Shop
            </Link>
            <Link to="/login" style={{
              background: 'transparent', color: 'var(--text-secondary)',
              border: 'none', padding: '20px 32px', fontSize: '15px', fontWeight: '700',
              textDecoration: 'none', transition: 'color 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              Sign In →
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

const Home = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Flash Sale Countdown Logic (Target: 14h 32m 45s)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  // FAQ Accordion state
  const [activeFaq, setActiveFaq] = useState(null);

  // Animated counter for stats
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // Multi-product column accordion hover state
  const [hoveredCol, setHoveredCol] = useState(null);

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.categories.getAll();
        setCategories(catRes.categories || []);

        const prodRes = await api.products.getAll({ limit: 24 });
        setProducts(prodRes.products || []);
      } catch (error) {
        console.error('Error fetching home data:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Flash Sale countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Animated stats counter observer
  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div style={{ padding: '0 0 80px 0', position: 'relative' }}>
      {/* Floating Logo for Home Page (since global Navbar is hidden on Home) */}
      <div style={{
        position: 'absolute',
        top: '36px',
        left: '5%',
        zIndex: 50,
        pointerEvents: 'auto'
      }}>
        <GlowLogo 
          size={36} 
          fontSize="30px" 
          style={{ transition: 'transform 0.3s ease' }}
          textStyle={{ fontWeight: '955', letterSpacing: '0.12em' }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      </div>

      {/* Dynamic Ambient Background Orbs */}
      <div className="floating-orb orb-1"></div>
      <div className="floating-orb orb-2"></div>
      <div className="floating-orb orb-3"></div>

      {/* Custom Styles Injection */}
      <style>{`

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.25;
          z-index: 0;
          pointer-events: none;
        }
        .orb-1 {
          width: 350px;
          height: 350px;
          background: var(--color-accent);
          top: 5%;
          left: 10%;
          animation: floatOrb1 18s infinite alternate ease-in-out;
        }
        .orb-2 {
          width: 450px;
          height: 450px;
          background: #c084fc;
          top: 15%;
          right: 5%;
          animation: floatOrb2 22s infinite alternate ease-in-out;
        }
        .orb-3 {
          width: 300px;
          height: 300px;
          background: var(--color-success);
          bottom: 10%;
          left: 5%;
          animation: floatOrb1 20s infinite alternate ease-in-out;
          animation-delay: -5s;
        }
        @keyframes floatOrb1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(80px, 40px) scale(1.15); }
        }
        @keyframes floatOrb2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-80px, -50px) scale(1.1); }
        }

        .hero-container {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
          padding: 80px 5% 100px 5%;
          position: relative;
          z-index: 1;
        }
        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .hero-showcase {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        .hero-floating-card {
          width: 320px;
          position: relative;
          z-index: 2;
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-glass);
          border-radius: 20px;
          background: var(--glass-bg);
          backdrop-filter: blur(16px);
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        .glow-pulse-circle {
          position: absolute;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, transparent 70%);
          z-index: 1;
          pointer-events: none;
          animation: pulseGlow 4s infinite alternate ease-in-out;
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.4; }
          100% { transform: scale(1.2); opacity: 0.85; }
        }
        @keyframes floatSparkle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.2); }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .shining-btn {
          position: relative;
          overflow: hidden;
        }
        .shining-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -60%;
          width: 30%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          animation: sweep 4.5s infinite ease-in-out;
        }
        @keyframes sweep {
          0% { left: -100%; }
          30%, 100% { left: 130%; }
        }

        /* Scroll indicator */
        .scroll-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          animation: pulseScroll 2s infinite ease-in-out;
          margin-top: 40px;
        }
        @keyframes pulseScroll {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(8px); opacity: 1; }
        }

        /* Infinite Marquee Styles */
        .marquee-wrapper {
          overflow: hidden;
          padding: 24px 0;
          background: var(--input-bg);
          border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 70px;
          display: flex;
          user-select: none;
          z-index: 1;
          position: relative;
        }
        .marquee-track {
          display: flex;
          gap: 80px;
          flex-shrink: 0;
          min-width: 100%;
          justify-content: space-around;
          align-items: center;
          animation: scrollMarquee 26s linear infinite;
        }
        .marquee-item {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.18em;
          color: var(--text-muted);
          opacity: 0.45;
          transition: all 0.3s ease;
          cursor: default;
        }
        .marquee-item:hover {
          opacity: 1;
          color: var(--color-accent);
          text-shadow: 0 0 15px rgba(56, 189, 248, 0.5);
          transform: scale(1.08);
        }
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% - 80px)); }
        }

        @keyframes fadeUpIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeUpIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .category-hover-card {
          overflow: hidden;
          position: relative;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) !important;
          height: 280px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 28px;
          text-decoration: none;
          color: white;
          border: 1px solid var(--glass-border);
          border-radius: 16px;
        }
        .category-hover-card:hover {
          transform: translateY(-8px) scale(1.02);
          border-color: var(--color-accent) !important;
          box-shadow: 0 20px 45px rgba(56, 189, 248, 0.25), var(--shadow-glass);
        }
        .category-bg-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: -2;
        }
        .category-hover-card:hover .category-bg-image {
          transform: scale(1.12);
        }
        .category-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(11, 15, 25, 0.95) 15%, rgba(11, 15, 25, 0.4) 65%, transparent 100%);
          z-index: -1;
          transition: var(--transition-smooth);
        }
        [data-theme="light"] .category-overlay {
          background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 15%, rgba(15, 23, 42, 0.3) 65%, transparent 100%);
        }

        .promo-banner-card {
          position: relative;
          background: linear-gradient(135deg, rgba(18, 24, 38, 0.8), rgba(11, 15, 25, 0.96)) !important;
          border: 1px solid var(--glass-border) !important;
          overflow: hidden;
          padding: 50px 6%;
          border-radius: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 40px;
          box-shadow: var(--shadow-glass);
        }
        [data-theme="light"] .promo-banner-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(241, 245, 249, 0.98)) !important;
        }
        .promo-banner-card::after {
          content: '';
          position: absolute;
          top: -40%;
          right: -10%;
          width: 480px;
          height: 480px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }

        .curation-card {
          width: 100%;
          max-width: 380px;
          height: 250px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid var(--glass-border) !important;
          box-shadow: var(--shadow-glass) !important;
          position: relative;
          display: block;
          text-decoration: none;
          transition: var(--transition-smooth) !important;
        }

        .curation-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: var(--color-accent) !important;
          box-shadow: var(--shadow-neon) !important;
        }

        .curation-image-wrapper {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .curation-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }

        .curation-card:hover .curation-img {
          transform: scale(1.08);
        }

        .curation-link-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .curation-card:hover .curation-link-text {
          color: var(--color-accent) !important;
        }

        /* FAQ Styling */
        .faq-item {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .faq-item:hover {
          border-color: var(--color-accent) !important;
          transform: translateX(6px);
        }

        /* Lookbook Section Styling */
        .lookbook-card {
          position: relative;
          height: 360px;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow-glass);
          transition: var(--transition-smooth);
        }
        .lookbook-img {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lookbook-card:hover .lookbook-img {
          transform: scale(1.08);
        }
        .lookbook-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(11, 15, 25, 0.9) 0%, rgba(11, 15, 25, 0.2) 50%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 24px;
          transition: all 0.4s ease;
          z-index: 1;
        }
        [data-theme="light"] .lookbook-overlay {
          background: linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.15) 50%, transparent 100%);
        }
        .lookbook-card:hover .lookbook-overlay {
          background: linear-gradient(to top, rgba(56, 189, 248, 0.65) 0%, rgba(11, 15, 25, 0.4) 60%, transparent 100%) !important;
        }

        .testimonial-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid var(--glass-border);
          object-fit: cover;
          background: var(--bg-secondary);
        }
        .pulse-badge {
          animation: pulseShadow 2s infinite alternate;
        }
        @keyframes pulseShadow {
          0% { box-shadow: 0 0 0 0px rgba(56, 189, 248, 0.4); }
          100% { box-shadow: 0 0 0 8px rgba(56, 189, 248, 0); }
        }
        @media (max-width: 968px) {
          .hero-container {
            padding: 40px 5% 40px 5% !important;
          }
          .hero-container h1 {
            font-size: 32px !important;
          }
        }
      `}</style>

      {/* Conditional Hero & Page Flow: Guest vs Logged-In */}
      {user ? (
        <>
          <HeroLoggedIn products={products} categories={categories} />

          {/* Quick Category Browser for Members */}
          <section id="categories" style={{ padding: '0 5%', marginBottom: '60px', position: 'relative', zIndex: 1 }}>
            <ScrollReveal direction="up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                  <span className="badge badge-secondary" style={{ marginBottom: '6px' }}>Quick Access</span>
                  <h2 style={{ fontSize: '22px', fontWeight: '850', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Shop Departments</h2>
                </div>
              </div>
            </ScrollReveal>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '18px'
            }}>
              {categories.map((cat, idx) => {
                let catImg = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600';
                if (cat.slug === 'cosmetics' || cat.slug === 'my-pham') catImg = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600';
                else if (cat.slug === 'fashion' || cat.slug === 'thoi-trang') catImg = 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600';
                else if (cat.slug === 'accessories' || cat.slug === 'phu-kien') catImg = 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600';
                else if (cat.slug === 'electronics') catImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600';
                else if (cat.slug === 'home-living') catImg = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600';

                return (
                  <ScrollReveal key={cat.id} direction="up" delay={idx * 60}>
                    <Link to={`/products?categoryId=${cat.id}`} className="category-hover-card" style={{ height: '120px' }}>
                      <div className="category-bg-image" style={{ backgroundImage: `url(${catImg})` }}></div>
                      <div className="category-overlay" style={{
                        background: isDark
                          ? 'linear-gradient(to top, rgba(3, 7, 18, 0.9) 0%, rgba(3, 7, 18, 0.15) 100%)'
                          : 'linear-gradient(to top, rgba(245, 247, 253, 0.9) 0%, rgba(245, 247, 253, 0.15) 100%)'
                      }}></div>
                      <div style={{ zIndex: 1, position: 'relative' }}>
                        <h3 style={{ fontSize: '15px', margin: 0, fontWeight: '800', color: 'var(--text-primary)' }}>{cat.name}</h3>
                        <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: '3px 0 0 0' }}>Explore Collection</p>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </section>

          {/* Member Exclusive Flash Sale */}
          <section style={{ padding: '0 5%', marginBottom: '60px', position: 'relative', zIndex: 1 }}>
            <ScrollReveal direction="up">
              <div className="glass-card" style={{
                padding: '40px 6%',
                borderRadius: '20px',
                border: '1px solid var(--glass-border)',
                background: isDark
                  ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(9, 13, 22, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(241, 245, 249, 0.95) 100%)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '32px',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                <div>
                  <span className="badge badge-error" style={{ background: '#ef4444', color: 'white', border: 'none', marginBottom: '12px', fontWeight: '800' }}>
                    EXCLUSIVE MEMBER FLASH DEAL
                  </span>
                  <h2 style={{ fontSize: '26px', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.2', fontWeight: '800' }}>
                    Marshall Acton III Speaker
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.5', marginBottom: '16px' }}>
                    Claim special pricing on the iconic Marshall sound. Limited time offer only for active registered accounts.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-error)' }}>₫6,990,000</span>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₫8,490,000</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {[
                      { label: 'Hours', val: timeLeft?.hours },
                      { label: 'Min', val: timeLeft?.minutes },
                      { label: 'Sec', val: timeLeft?.seconds }
                    ].map((t, idx) => (
                      <div key={idx} className="glass-card" style={{
                        width: '70px', height: '75px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        border: '1px solid var(--glass-border)', borderRadius: '12px', background: 'var(--bg-secondary)'
                      }}>
                        <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>{String(t.val ?? 0).padStart(2, '0')}</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/products?categoryId=electronics" className="btn btn-danger pulse-badge" style={{ padding: '12px 36px', fontSize: '14px', borderRadius: '10px', width: '100%', textAlign: 'center', textDecoration: 'none' }}>
                    Claim Deal Now
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* Catalog Highlights Section */}
          <section style={{ padding: '0 5%', marginBottom: '60px', position: 'relative', zIndex: 1 }}>
            <ScrollReveal direction="up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Trending Catalog</span>
                  <h2 style={{ fontSize: '22px', fontWeight: '850', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Hot Products</h2>
                </div>
                
                {/* Minimalist Tab Filter Bar */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  maxWidth: '100%',
                  scrollbarWidth: 'none'
                }}>
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      border: '1px solid ' + (selectedCategory === 'all' ? 'var(--text-primary)' : 'var(--glass-border)'),
                      background: selectedCategory === 'all' ? 'var(--text-primary)' : 'transparent',
                      color: selectedCategory === 'all' ? 'var(--bg-primary)' : 'var(--text-primary)',
                      transition: 'all 0.25s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    All Collection
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        border: '1px solid ' + (selectedCategory === cat.id ? 'var(--text-primary)' : 'var(--glass-border)'),
                        background: selectedCategory === cat.id ? 'var(--text-primary)' : 'transparent',
                        color: selectedCategory === cat.id ? 'var(--bg-primary)' : 'var(--text-primary)',
                        transition: 'all 0.25s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--color-accent)', fontSize: '13px', fontWeight: '600' }}>
                  View All <ArrowRight size={14} />
                </Link>
              </div>
            </ScrollReveal>

            {loading ? (
              <ProductListSkeleton count={4} />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px'
              }}>
                {products
                  .filter(prod => {
                    const catId = prod.categoryId?._id || prod.categoryId || prod.category?._id || prod.category?.id;
                    const catSlug = prod.category?.slug || prod.categoryId?.slug;
                    return selectedCategory === 'all' || catId === selectedCategory || catSlug === selectedCategory;
                  })
                  .slice(0, 8)
                  .map((prod, idx) => (
                    <div key={`${selectedCategory}-${prod.id}`} className="animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
                      <ProductCard product={prod} />
                    </div>
                  ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          <HeroGuest />

          {/* Floating scroll indicator */}
          <div className="scroll-indicator" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '40px 0', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '700' }}>
            <span>Scroll to Explore</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </div>

          {/* Scene 2: Infinite Brands Scrolling Marquee */}
          <section className="marquee-wrapper" style={{ margin: '80px 0', overflow: 'hidden' }}>
            <div className="marquee-track">
              {['Apple', 'Samsung', 'Sony', 'ASUS', 'Nike', 'Adidas', 'Logitech', 'Canon', 'L\'Oréal', 'Microsoft', 'Dell', 'Lenovo'].map((brand, idx) => (
                <span key={idx} className="marquee-item" style={{
                  padding: '20px 48px',
                  margin: '0 24px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  fontSize: '18px',
                  fontWeight: '800',
                  letterSpacing: '0.15em',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.color = 'var(--color-accent)'; 
                  e.currentTarget.style.borderColor = 'rgba(58, 97, 246, 0.4)'; 
                  e.currentTarget.style.background = 'rgba(58, 97, 246, 0.05)';
                  e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px -10px rgba(58, 97, 246, 0.3)';
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.color = 'var(--text-secondary)'; 
                  e.currentTarget.style.borderColor = 'var(--glass-border)'; 
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  {brand}
                </span>
              ))}
            </div>
            <div className="marquee-track" aria-hidden="true">
              {['Apple', 'Samsung', 'Sony', 'ASUS', 'Nike', 'Adidas', 'Logitech', 'Canon', 'L\'Oréal', 'Microsoft', 'Dell', 'Lenovo'].map((brand, idx) => (
                <span key={`dup-${idx}`} className="marquee-item" style={{
                  padding: '20px 48px',
                  margin: '0 24px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-secondary)',
                  fontSize: '18px',
                  fontWeight: '800',
                  letterSpacing: '0.15em',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
                onMouseEnter={e => { 
                  e.currentTarget.style.color = 'var(--color-accent)'; 
                  e.currentTarget.style.borderColor = 'rgba(58, 97, 246, 0.4)'; 
                  e.currentTarget.style.background = 'rgba(58, 97, 246, 0.05)';
                  e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px -10px rgba(58, 97, 246, 0.3)';
                }}
                onMouseLeave={e => { 
                  e.currentTarget.style.color = 'var(--text-secondary)'; 
                  e.currentTarget.style.borderColor = 'var(--glass-border)'; 
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  {brand}
                </span>
              ))}
            </div>
          </section>

          {/* Scene 3: Featured Categories (3D Tilt Cards) */}
          <section id="categories" style={{ padding: '80px 5%', position: 'relative', zIndex: 2 }}>
            <ScrollReveal direction="zoom">
              <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <span className="badge badge-secondary" style={{ marginBottom: '10px', letterSpacing: '0.18em' }}>DEPARTMENTS</span>
                <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: '950', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Featured Categories
                </h2>
              </div>
            </ScrollReveal>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '28px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {[
                { id: 'fashion', name: 'Fashion', description: 'Curated apparel & wardrobe collections', img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600' },
                { id: 'gaming', name: 'Gaming Gear', description: 'Premium peripheral controls & displays', img: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&q=80&w=600' },
                { id: 'electronics', name: 'Electronics', description: 'Advanced consumer smart electronics', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600' },
                { id: 'beauty', name: 'Beauty & Skincare', description: 'Imported makeup & skincare products', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600' },
                { id: 'accessories', name: 'Accessories', description: 'Luxury timepieces & fashion jewelry', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600' },
                { id: 'home-living', name: 'Home & Living', description: 'High-end home interior design & comfort', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600' }
              ].map((cat, idx) => (
                <ScrollReveal key={cat.id} direction="up" delay={idx * 80}>
                  <CategoryCard3D cat={cat} img={cat.img} />
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Scene 4: Trending Products */}
          <section id="trending" style={{ padding: '80px 5%', position: 'relative', zIndex: 2 }}>
            <ScrollReveal direction="up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', maxWidth: '1200px', margin: '0 auto 40px auto' }}>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '8px' }}>HOT ARRIVALS</span>
                  <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '950', color: 'var(--text-primary)' }}>Trending Products</h2>
                </div>
                <Link to="/products" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: '800', display: 'flex',  alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                  View All Products <ArrowRight size={16} />
                </Link>
              </div>
            </ScrollReveal>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              {products.length === 0 ? (
                <ProductListSkeleton count={4} />
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '28px'
                }}>
                  {products.slice(0, 8).map((prod, idx) => (
                    <ScrollReveal key={prod._id || prod.id} direction="up" delay={idx * 60}>
                      <ProductCard product={prod} />
                    </ScrollReveal>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Scene 5: Flash Sale Banner */}
          <section style={{ padding: '60px 5%', position: 'relative', zIndex: 2 }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <ScrollReveal direction="zoom">
                <div style={{
                  background: 'linear-gradient(135deg, rgba(var(--bg-rgb), 0.8) 0%, rgba(var(--bg-secondary-rgb), 0.6) 100%)',
                  borderRadius: '30px',
                  border: '1px solid var(--glass-border)',
                  boxShadow: isDark ? '0 30px 60px rgba(0,0,0,0.4)' : '0 15px 40px rgba(16, 39, 111, 0.05)',
                  padding: '60px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 0.8fr',
                  gap: '40px',
                  alignItems: 'center'
                }}>
                  <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(58, 97, 246, 0.2) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }} />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <span className="badge badge-error" style={{ letterSpacing: '0.15em', animation: 'pulseShadow 2s infinite alternate', border: '1px solid rgba(239,68,68,0.3)' }}>
                        LIMITED STOCK DEAL
                      </span>
                    </div>
                    <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '950', color: 'var(--text-primary)', lineHeight: '1.1', marginBottom: '16px' }}>
                      Marshall Acton III Speaker
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px', maxWidth: '500px' }}>
                      Elevate your home acoustics with the iconic vintage brass Marshall speaker. Uncompromising sound, active bluetooth multi-host controller, warrantied authentic.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '36px' }}>
                      {[
                        { val: timeLeft.hours, label: 'Hours' },
                        { val: timeLeft.minutes, label: 'Mins' },
                        { val: timeLeft.seconds, label: 'Secs' }
                      ].map((t, i) => (
                        <div key={i} style={{
                          padding: '0 16px',
                          textAlign: 'center',
                          minWidth: '70px',
                          position: 'relative'
                        }}>
                          {/* Optional: Add a subtle separator between items except the last one */}
                          {i < 2 && <span style={{ position: 'absolute', right: '-8px', top: '50%', transform: 'translateY(-50%)', fontSize: '24px', fontWeight: '900', color: 'var(--text-muted)' }}>:</span>}
                          <span style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-primary)', display: 'block' }}>
                            {t.val.toString().padStart(2, '0')}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            {t.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <span>STOCK CLAIMED</span>
                        <span style={{ color: 'var(--color-error)' }}>ONLY 4 LEFT</span>
                      </div>
                      <div style={{ height: '8px', background: 'var(--glass-border)', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div
                          animate={{ width: '85%' }}
                          transition={{ duration: 2, ease: 'easeOut' }}
                          style={{ height: '100%', background: 'linear-gradient(to right, var(--color-error), var(--color-accent))', borderRadius: '100px' }}
                        />
                      </div>
                    </div>

                    <Link to="/products" className="btn btn-primary" style={{
                      padding: '16px 36px',
                      background: 'linear-gradient(135deg, var(--color-accent) 0%, #7b46f3 100%)',
                      border: 'none',
                      color: 'white',
                      fontWeight: '800',
                      borderRadius: '12px'
                    }}>
                      Claim Deal Now
                    </Link>
                  </div>

                  <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                    <motion.img
                      animate={{ y: [0, -12, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                      src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600"
                      alt="Marshall Acton III"
                      style={{
                        width: '100%',
                        maxWidth: '340px',
                        borderRadius: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* Scene 6: Why GlowStore (Animated Stats Section) */}
          <section style={{ padding: '100px 5%', background: 'var(--bg-secondary)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', position: 'relative', zIndex: 2 }}>
            <ScrollReveal direction="up">
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <span className="badge badge-secondary" style={{ marginBottom: '10px', letterSpacing: '0.2em' }}>WHY GLOWSTORE</span>
                <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: '950', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Trusted by millions worldwide
                </h2>
              </div>
            </ScrollReveal>
            <div ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
              {[
                { end: 1200000, label: 'Happy Customers', prefix: '', suffix: '+', icon: <Users size={28} color="#3a61f6" /> },
                { end: 200, label: 'Premium Brands', prefix: '', suffix: '+', icon: <Globe size={28} color="#7b46f3" /> },
                { end: 50000, label: 'Authentic Products', prefix: '', suffix: '+', icon: <Package size={28} color="#34d399" /> },
                { end: 99, label: 'Reviews Score', prefix: '', suffix: '%', icon: <Star size={28} color="#fbbf24" /> }
              ].map((stat, idx) => (
                <ScrollReveal key={idx} direction="up" delay={idx * 80}>
                  <div style={{
                    textAlign: 'center', padding: '36px 24px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(12px)',
                    transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(58,97,246,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '950', color: 'var(--color-accent)', marginBottom: '8px', letterSpacing: '-0.04em' }}>
                      <AnimatedStatsCounter end={stat.end} active={statsVisible} suffix={stat.suffix} prefix={stat.prefix} />
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                      {stat.label}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* Scene 7: AI Shopping Assistant */}
          <section style={{ padding: '80px 5%', position: 'relative', zIndex: 2 }}>
            <ScrollReveal direction="up">
              <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <span className="badge badge-primary" style={{ marginBottom: '10px', letterSpacing: '0.2em' }}>NEXT-GEN SHOPPING</span>
                <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 42px)', fontWeight: '950', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  GlowAI Shopping Assistant
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '500px', margin: '12px auto 0 auto' }}>
                  Experience real-time interactive product filters, smart shopping recommendations, and catalog browsing guided by AI.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="zoom">
              <AIShoppingAssistant />
            </ScrollReveal>
          </section>

          {/* Scene 8: Customer Reviews Slider */}
          <section style={{ padding: '80px 5%', background: 'var(--bg-secondary)', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)', position: 'relative', zIndex: 2 }}>
            <ScrollReveal direction="up">
              <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <span className="badge badge-secondary" style={{ marginBottom: '10px', letterSpacing: '0.15em' }}>TESTIMONIALS</span>
                <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: '950', color: 'var(--text-primary)' }}>
                  What our members say
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={100}>
              <ReviewSlider />
            </ScrollReveal>
          </section>

          {/* Scene 9: Final Cinematic CTA */}
          <FinalCTA />
        </>
      )}</div>
  );
};

export default Home;
