import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, Loader2, 
  Watch, Headphones, Camera, Smartphone, ScanFace, Laptop, ArrowRight, Github
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

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

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
    if (e) e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    try {
      const user = await login(email, password);
      setSuccess(true);
      setTimeout(() => {
        showToast(`Welcome back, ${user.name}!`, 'success');
        if (user.role === 'admin') navigate('/admin');
        else navigate(redirectTarget);
      }, 1500); 
    } catch (error) {
      showToast(error.message || 'Incorrect email or password.', 'error');
      setSubmitting(false);
    }
  };

  const isEmailValid = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(300px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(300px) rotate(-360deg); }
        }
        @keyframes orbit-reverse {
          from { transform: rotate(360deg) translateX(220px) rotate(-360deg); }
          to { transform: rotate(0deg) translateX(220px) rotate(0deg); }
        }
        .mesh-bg-epic {
          position: absolute; inset: -50%;
          background-image: 
            radial-gradient(ellipse at 20% 20%, ${isDark ? 'rgba(123, 70, 243, 0.15)' : 'rgba(123, 70, 243, 0.05)'} 0%, transparent 40%),
            radial-gradient(ellipse at 80% 80%, ${isDark ? 'rgba(58, 97, 246, 0.1)' : 'rgba(58, 97, 246, 0.03)'} 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, ${isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)'} 0%, transparent 40%);
          filter: blur(80px);
          animation: float-hero 20s ease-in-out infinite alternate;
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
        .glass-btn {
          background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
          border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'};
          backdrop-filter: blur(10px);
          color: ${isDark ? 'white' : 'var(--text-primary)'};
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-btn:hover {
          background: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
          border-color: ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(123,70,243,0.3)'};
          box-shadow: ${isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 10px 20px rgba(123,70,243,0.04)'};
          transform: translateY(-2px);
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
      <div className="mesh-bg-epic" />
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
          <motion.div style={{ position: 'absolute', top: '30%', left: '20%', width: '400px', height: '400px', borderRadius: '50%', background: isDark ? 'linear-gradient(to right, rgba(123,70,243,0.3), rgba(58,97,246,0.2))' : 'linear-gradient(to right, rgba(123,70,243,0.08), rgba(58,97,246,0.05))', filter: 'blur(100px)', x: glowX, y: glowY }} />
          
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
          </div>

          <div style={{ position: 'absolute', top: '35%', left: '45%', animation: 'float-hero 12s ease-in-out infinite', animationDelay: '-5s' }}>
            <div style={{ width: '280px', height: '380px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.65)', backdropFilter: 'blur(30px)', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(123,70,243,0.12)', borderRadius: '24px', boxShadow: isDark ? '0 40px 80px rgba(0,0,0,0.5)' : '0 40px 80px rgba(123,70,243,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: '65%', background: isDark ? 'linear-gradient(135deg, rgba(123,70,243,0.1) 0%, rgba(58,97,246,0.1) 100%)' : 'linear-gradient(135deg, rgba(123,70,243,0.05) 0%, rgba(58,97,246,0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Watch size={90} color={isDark ? "white" : "var(--text-primary)"} style={{ filter: isDark ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' : 'drop-shadow(0 10px 20px rgba(123,70,243,0.06))' }} />
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ width: '70%', height: '14px', background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.12)', borderRadius: '6px', marginBottom: '16px' }}></div>
                <div style={{ width: '50%', height: '12px', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', borderRadius: '6px', marginBottom: '12px' }}></div>
                <div style={{ width: '30%', height: '14px', background: '#10b981', borderRadius: '6px' }}></div>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', top: '65%', left: '22%', animation: 'float-hero 18s ease-in-out infinite', animationDelay: '-10s' }}>
            <div style={{ width: '240px', height: '280px', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.65)', backdropFilter: 'blur(16px)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(123,70,243,0.08)', borderRadius: '24px', boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.3)' : '0 20px 40px rgba(123,70,243,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ height: '65%', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={70} color={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)"} style={{ filter: isDark ? 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' : 'drop-shadow(0 10px 20px rgba(123,70,243,0.04))' }} />
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ width: '90%', height: '10px', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)', borderRadius: '6px', marginBottom: '12px' }}></div>
                <div style={{ width: '60%', height: '10px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: '6px' }}></div>
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
          style={{ width: '100%', maxWidth: '480px', borderRadius: '32px', padding: '40px', position: 'relative', overflowY: 'auto', maxHeight: 'calc(100vh - 40px)' }}
        >
          {/* Top Panel Edge Highlight */}
          <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: '1px', background: isDark ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' : 'linear-gradient(90deg, transparent, rgba(123,70,243,0.2), transparent)' }} />
          
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '40px', fontWeight: '800', color: isDark ? 'white' : 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Welcome to<br/>GlowStore.
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '15px' }}>
              <ShieldCheck size={18} color="#10b981" /> 
              <span>Encrypted Authentication</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                <input type="checkbox" style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }} />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: '600' }}>
                Forgot password?
              </Link>
            </div>

            {/* Smart Submit CTA */}
            <motion.button 
              type="submit" 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              disabled={submitting || success || !email || !password || !isEmailValid}
              style={{ 
                height: '64px', borderRadius: '20px', fontSize: '16px', fontWeight: '800', width: '100%', marginTop: '8px',
                background: success ? '#10b981' : 'linear-gradient(135deg, var(--color-accent) 0%, #3a61f6 100%)', 
                color: 'white', border: 'none', cursor: (submitting || success) ? 'default' : 'pointer', 
                boxShadow: success ? '0 20px 40px rgba(16,185,129,0.4)' : '0 20px 40px rgba(123,70,243,0.4)',
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
                    Continue <ArrowRight size={20} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0 12px 0' }}>
            <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)' }}></div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em' }}>OR CONTINUE WITH</span>
            <div style={{ flex: 1, height: '1px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)' }}></div>
          </div>

          {/* Social Logins grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginTop: '16px' }}>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className="glass-btn" style={{ height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className="glass-btn" style={{ height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="22" height="22" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className="glass-btn" style={{ height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Github size={22} />
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className="glass-btn" style={{ height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <MicrosoftIcon />
            </motion.button>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', borderTop: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)', paddingTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <Laptop size={16} /> Last login: Mac Studio • 2h ago
            </div>
            <Link to={`/register?redirect=${encodeURIComponent(redirectTarget)}`} style={{ color: isDark ? 'white' : 'var(--text-primary)', fontWeight: '700', textDecoration: 'none' }}>
              Create Account
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;
