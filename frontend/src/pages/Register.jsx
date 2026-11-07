import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Loader2, 
  Crown, Sparkles, TrendingUp, ArrowRight,
  Watch, Headphones, Camera, Smartphone
} from 'lucide-react';

import GlowLogo from '../components/GlowLogo';

const FloatingInput = ({ type, label, value, onChange, error, onFocus, onBlur, iconRight, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { isDark } = useTheme();
  const isActive = isFocused || value.length > 0;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <motion.label
        initial={false}
        animate={{
          top: isActive ? '12px' : '50%',
          left: '20px',
          fontSize: isActive ? '11px' : '15px',
          color: error ? '#ef4444' : isActive ? 'var(--color-accent)' : isDark ? 'var(--text-secondary)' : 'rgba(0,0,0,0.4)',
          y: isActive ? 0 : '-50%'
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ position: 'absolute', pointerEvents: 'none', fontWeight: '600', letterSpacing: isActive ? '0.05em' : 'normal', textTransform: isActive ? 'uppercase' : 'none', zIndex: 2 }}
      >
        {label}
      </motion.label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={(e) => { setIsFocused(true); if (onFocus) onFocus(e); }}
        onBlur={(e) => { setIsFocused(false); if (onBlur) onBlur(e); }}
        style={{
          width: '100%',
          height: '64px',
          padding: '28px 48px 8px 20px',
          background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : isFocused ? 'rgba(123,70,243,0.5)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          borderRadius: '20px',
          color: 'var(--text-primary)',
          fontSize: '16px',
          outline: 'none',
          boxShadow: isFocused 
            ? `0 0 0 4px ${error ? 'rgba(239,68,68,0.1)' : 'rgba(123,70,243,0.1)'}, inset 0 2px 10px rgba(0,0,0,${isDark ? '0.2' : '0.05'})` 
            : `inset 0 2px 10px rgba(0,0,0,${isDark ? '0.1' : '0.02'})`,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        {...props}
      />
      {iconRight && (
        <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
          {iconRight}
        </div>
      )}
    </div>
  );
};

const PasswordStrength = ({ password }) => {
  const { isDark } = useTheme();
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  const score = [hasMinLen, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  
  const getColor = () => {
    if (password.length === 0) return isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
    if (score < 2) return "#ef4444";
    if (score === 2 || score === 3) return "#f59e0b";
    if (score === 4) return "#10b981";
  };

  return (
    <div style={{ marginTop: '8px', padding: '12px', background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', borderRadius: '16px', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} style={{ 
            flex: 1, height: '4px', borderRadius: '2px', 
            background: password.length > 0 && score >= idx ? getColor() : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            transition: 'all 0.3s'
          }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', fontWeight: '600' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasMinLen ? '#10b981' : 'var(--text-muted)', transition: 'color 0.3s' }}>
          <CheckCircle2 size={14} /> 8+ Characters
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasUpper ? '#10b981' : 'var(--text-muted)', transition: 'color 0.3s' }}>
          <CheckCircle2 size={14} /> Uppercase Letter
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasNumber ? '#10b981' : 'var(--text-muted)', transition: 'color 0.3s' }}>
          <CheckCircle2 size={14} /> Number
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: hasSpecial ? '#10b981' : 'var(--text-muted)', transition: 'color 0.3s' }}>
          <CheckCircle2 size={14} /> Special Symbol
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const orbX = useTransform(mouseX, [-1000, 1000], [-60, 60]);
  const orbY = useTransform(mouseY, [-1000, 1000], [-60, 60]);
  const glowX = useTransform(mouseX, [-1000, 1000], [-100, 100]);
  const glowY = useTransform(mouseY, [-1000, 1000], [-100, 100]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setSubmitting(true);
    try {
      await register(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        showToast('Account registered successfully!', 'success');
        navigate(redirectTarget);
      }, 1500);
    } catch (error) {
      showToast(error.message || 'Registration failed.', 'error');
      setSubmitting(false);
    }
  };

  const isEmailValid = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  // Checking full password strength for button disable
  const isPasswordStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);

  const bubbles = React.useMemo(() => [...Array(10)].map(() => ({
    size: Math.random() * 100 + 40, // 40px to 140px
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 25 + 20, // 20s to 45s (slower, smoother)
    delay: Math.random() * -40 
  })), []);

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', background: 'var(--bg-primary)', position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 50 }}>
      
      {/* Top Navigation / Brand */}
      <div style={{ position: 'absolute', top: '40px', left: '0', zIndex: 50, display: 'flex', alignItems: 'center', width: '100%', padding: '0 5%', justifyContent: 'space-between' }}>
        <GlowLogo size={32} fontSize="24px" />
      </div>

      <style>{`
        @keyframes float-hero {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          50% { transform: translateY(-40px) rotate(5deg) scale(1.05); }
        }
        @keyframes float-badge-1 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-20px, -30px, 0) scale(1.05); }
        }
        @keyframes float-badge-2 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(30px, -20px, 0) scale(1.05); }
        }
        @keyframes float-badge-3 {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-10px, 30px, 0) scale(1.05); }
        }
        .mesh-bg-epic-reg {
          position: absolute; inset: -50%;
          background-image: 
            radial-gradient(ellipse at 80% 20%, ${isDark ? 'rgba(123, 70, 243, 0.15)' : 'rgba(123, 70, 243, 0.05)'} 0%, transparent 40%),
            radial-gradient(ellipse at 20% 80%, ${isDark ? 'rgba(58, 97, 246, 0.1)' : 'rgba(58, 97, 246, 0.03)'} 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, ${isDark ? 'rgba(244, 114, 182, 0.05)' : 'rgba(244, 114, 182, 0.02)'} 0%, transparent 40%);
          filter: blur(80px);
          animation: float-hero 22s ease-in-out infinite alternate;
        }
        .glass-panel {
          background: ${isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.55)'};
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(123,70,243,0.12)'};
          box-shadow: ${isDark ? '0 40px 100px -20px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.15)' : '0 40px 80px -20px rgba(123,70,243,0.06), inset 0 1px 1px rgba(255,255,255,0.8)'};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          transform: translateZ(0);
        }
        .badge-glass {
          padding: 16px 24px;
          background: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.65)'};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 100px;
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(123,70,243,0.12)'};
          display: flex;
          align-items: center;
          gap: 12px;
          color: ${isDark ? 'white' : 'var(--text-primary)'};
          font-weight: 700;
          font-size: 15px;
          box-shadow: ${isDark ? '0 20px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)' : '0 20px 40px rgba(123,70,243,0.04), inset 0 1px 1px rgba(255,255,255,0.8)'};
        }
        .hide-scrollbar::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .bubble {
          position: absolute;
          border-radius: 50%;
          background: ${isDark ? 
            'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.02) 40%, rgba(123, 70, 243, 0.15) 70%, rgba(58, 97, 246, 0.2) 90%, rgba(244, 114, 182, 0.3) 100%)' :
            'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.1) 40%, rgba(123, 70, 243, 0.06) 70%, rgba(58, 97, 246, 0.06) 90%, rgba(244, 114, 182, 0.08) 100%)'};
          box-shadow: ${isDark ? 
            'inset -10px -10px 20px rgba(244, 114, 182, 0.15), inset 10px 10px 20px rgba(58, 97, 246, 0.15), 0 20px 40px rgba(0,0,0,0.3)' :
            'inset -10px -10px 20px rgba(244, 114, 182, 0.05), inset 10px 10px 20px rgba(58, 97, 246, 0.05), 0 20px 30px rgba(123,70,243,0.04)'};
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(123, 70, 243, 0.1)'};
          pointer-events: none;
          z-index: 2;
          animation: float-bubble 25s infinite linear;
        }
        @keyframes float-bubble {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33% { transform: translate(30px, -60px) scale(1.05) rotate(10deg); }
          66% { transform: translate(-20px, -120px) scale(0.95) rotate(-5deg); }
          100% { transform: translate(0, 0) scale(1) rotate(0deg); }
        }
      `}</style>

      {/* Cinematic Background Layer */}
      <div className="mesh-bg-epic-reg" />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.2, background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")', mixBlendMode: 'overlay', pointerEvents: 'none', zIndex: 1 }} />

      {/* Floating Bubbles Effect */}
      {bubbles.map((b, i) => (
        <div 
          key={`bubble-${i}`}
          className="bubble"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            top: `${b.top}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`
          }}
        />
      ))}

      {/* Hero Visual Space (Asymmetric Left) */}
      <div style={{ position: 'absolute', top: '0', left: '0', width: '55%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, pointerEvents: 'none' }}>
        
        <motion.div style={{ position: 'relative', width: '100%', height: '100%', x: orbX, y: orbY }}>
          {/* Giant Ambient Glow */}
          <motion.div style={{ position: 'absolute', top: '30%', left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: isDark ? 'linear-gradient(to right, rgba(58,97,246,0.3), rgba(244,114,182,0.2))' : 'linear-gradient(to right, rgba(58,97,246,0.08), rgba(244,114,182,0.05))', filter: 'blur(100px)', x: glowX, y: glowY }} />
          
          {/* Floating Product Cards System */}
          <div style={{ position: 'absolute', top: '20%', left: '15%', animation: 'float-hero 15s ease-in-out infinite' }}>
            <div style={{ width: '260px', height: '340px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(123,70,243,0.12)', borderRadius: '24px', boxShadow: isDark ? '0 30px 60px rgba(0,0,0,0.4)' : '0 30px 60px rgba(123,70,243,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: '65%', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Headphones size={80} color={isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.75)"} style={{ filter: isDark ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' : 'drop-shadow(0 10px 20px rgba(123,70,243,0.06))' }} />
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ width: '80%', height: '12px', background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', borderRadius: '6px', marginBottom: '12px' }}></div>
                <div style={{ width: '40%', height: '12px', background: 'var(--color-accent)', borderRadius: '6px' }}></div>
              </div>
            </div>
            
            <div style={{ position: 'absolute', top: '-20px', left: '-40px', animation: 'float-badge-1 12s ease-in-out infinite' }}>
              <div className="badge-glass">
                <Crown size={22} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.5))' }} /> Exclusive Membership
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', top: '35%', left: '45%', animation: 'float-hero 12s ease-in-out infinite', animationDelay: '-5s' }}>
            <div style={{ width: '280px', height: '380px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.65)', backdropFilter: 'blur(30px)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(123,70,243,0.12)', borderRadius: '24px', boxShadow: isDark ? '0 40px 80px rgba(0,0,0,0.5)' : '0 40px 80px rgba(123,70,243,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: '65%', background: isDark ? 'linear-gradient(135deg, rgba(58,97,246,0.1) 0%, rgba(244,114,182,0.1) 100%)' : 'linear-gradient(135deg, rgba(58,97,246,0.05) 0%, rgba(244,114,182,0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Watch size={90} color={isDark ? "white" : "var(--text-primary)"} style={{ filter: isDark ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' : 'drop-shadow(0 10px 20px rgba(123,70,243,0.06))' }} />
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ width: '70%', height: '14px', background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.12)', borderRadius: '6px', marginBottom: '16px' }}></div>
                <div style={{ width: '50%', height: '12px', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', borderRadius: '6px', marginBottom: '12px' }}></div>
                <div style={{ width: '30%', height: '14px', background: '#10b981', borderRadius: '6px' }}></div>
              </div>
            </div>

            <div style={{ position: 'absolute', top: '-10px', right: '-80px', animation: 'float-badge-2 15s ease-in-out infinite' }}>
              <div className="badge-glass">
                <Sparkles size={22} color="#f472b6" style={{ filter: 'drop-shadow(0 0 10px rgba(244,114,182,0.5))' }} /> AI Shopping Assistant
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '10%', left: '25%', animation: 'float-hero 18s ease-in-out infinite', animationDelay: '-10s' }}>
            <div style={{ width: '240px', height: '280px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(123,70,243,0.08)', borderRadius: '24px', boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(123,70,243,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: '65%', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={70} color={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"} style={{ filter: isDark ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' : 'drop-shadow(0 10px 20px rgba(123,70,243,0.04))' }} />
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ width: '90%', height: '10px', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', borderRadius: '6px', marginBottom: '12px' }}></div>
                <div style={{ width: '60%', height: '10px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: '6px' }}></div>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '-20px', left: '-50px', animation: 'float-badge-3 10s ease-in-out infinite' }}>
              <div className="badge-glass">
                <TrendingUp size={22} color="#34d399" style={{ filter: 'drop-shadow(0 0 10px rgba(52,211,153,0.5))' }} /> Smart Recommendations
              </div>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Foreground Panel (Asymmetric Right) */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '20px 10%', zIndex: 10 }}>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel hide-scrollbar"
          style={{ width: '100%', maxWidth: '520px', borderRadius: '32px', padding: '40px', position: 'relative', overflowY: 'auto', maxHeight: 'calc(100vh - 40px)' }}
        >
          {/* Top Panel Edge Highlight */}
          <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: '1px', background: isDark ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' : 'linear-gradient(90deg, transparent, rgba(123,70,243,0.2), transparent)' }} />
          
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '800', color: isDark ? 'white' : 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Unlock Premium<br/>Shopping.
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '15px' }}>
              <ShieldCheck size={18} color="#10b981" /> 
              <span>Join over 1 Million verified members</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <FloatingInput 
              type="text"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <FloatingInput 
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!isEmailValid}
              iconRight={!isEmailValid ? <AlertCircle size={20} color="#ef4444" /> : email.length > 3 ? <CheckCircle2 size={20} color="#10b981" /> : null}
            />

            <div style={{ position: 'relative' }}>
              <FloatingInput 
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyDown}
                iconRight={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
              <AnimatePresence>
                {capsLockActive && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ position: 'absolute', right: '0', top: '-24px', fontSize: '12px', color: '#fbbf24', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={14} /> CAPS LOCK ON
                  </motion.div>
                )}
              </AnimatePresence>
              
              <PasswordStrength password={password} />
            </div>

            {/* Smart Submit CTA */}
            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={submitting || success || !name || !email || !password || !isEmailValid || !isPasswordStrong}
              style={{ 
                height: '64px', borderRadius: '20px', fontSize: '16px', fontWeight: '800', width: '100%', marginTop: '16px',
                background: success ? '#10b981' : 'linear-gradient(135deg, var(--color-accent) 0%, #3a61f6 100%)', 
                color: 'white', border: 'none', cursor: (submitting || success || !isPasswordStrong) ? 'default' : 'pointer', 
                boxShadow: success ? '0 20px 40px rgba(16,185,129,0.4)' : (!name || !email || !password || !isEmailValid || !isPasswordStrong) ? 'none' : '0 20px 40px rgba(123,70,243,0.4)',
                opacity: (!name || !email || !password || !isEmailValid || !isPasswordStrong) ? 0.5 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              <AnimatePresence mode="wait">
                {submitting ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 size={24} className="spin" />
                  </motion.div>
                ) : success ? (
                  <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <CheckCircle2 size={28} />
                  </motion.div>
                ) : (
                  <motion.span key="text" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Create Account <ArrowRight size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)', paddingTop: '24px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already have an account?&nbsp;</span>
            <Link to={`/login?redirect=${encodeURIComponent(redirectTarget)}`} style={{ color: isDark ? 'white' : 'var(--text-primary)', fontWeight: '700', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Register;
