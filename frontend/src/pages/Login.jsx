import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  Mail, 
  Check, 
  X
} from 'lucide-react';
import GlowLogo from '../components/GlowLogo';
import AuthLayout from '../components/auth/AuthLayout';
import AuthBrandPanel from '../components/auth/AuthBrandPanel';
import AuthInput from '../components/auth/AuthInput';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const Login = () => {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  // Form State
  const [email, setEmail] = useState(() => localStorage.getItem('uconext_remember_email') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('uconext_remember_email'));
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [authError, setAuthError] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotFeedback, setForgotFeedback] = useState('');

  // Email Validation
  const isEmailValid = email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');

    if (!email || !password) {
      setAuthError('Please enter both your email address and password.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);

      // Handle Remember Me
      if (rememberMe) {
        localStorage.setItem('uconext_remember_email', email);
      } else {
        localStorage.removeItem('uconext_remember_email');
      }

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectTarget);
      }
    } catch (error) {
      const msg = error.message || 'Incorrect email or password. Please try again.';
      setAuthError(msg);
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    setAuthError('Google Sign-In is configured via corporate SSO. Please sign in with your email and password.');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotFeedback('');
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotFeedback('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSent(true);
    }, 700);
  };

  return (
    <AuthLayout
      backTo={redirectTarget}
      backLabel="Back to UCONEXT"
      brandPanel={<AuthBrandPanel />}
    >
      {/* Brand Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'inline-block', marginBottom: '22px' }}>
          <GlowLogo size={26} fontSize="19px" to="/" />
        </div>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            margin: '0 0 8px 0',
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          }}
        >
          Welcome back
        </h1>
        <p
          style={{
            fontSize: '14.5px',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: '1.5',
          }}
        >
          Sign in to your UCONEXT account.
        </p>
      </div>

      {/* Clean Error Notification Banner */}
      {authError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
            border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}`,
            color: isDark ? '#fca5a5' : '#b91c1c',
            fontSize: '13px',
            lineHeight: '1.45',
            marginBottom: '20px',
          }}
        >
          <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{authError}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Email Field */}
        <AuthInput
          id="login-email"
          name="email"
          label="Email address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (authError) setAuthError('');
          }}
          required
          autoComplete="email"
          error={!isEmailValid ? 'Please enter a valid email address' : null}
        />

        {/* Password Field */}
        <div>
          <AuthInput
            id="login-password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (authError) setAuthError('');
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyDown}
            required
            autoComplete="current-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          {capsLockActive && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '6px',
                fontSize: '12px',
                color: '#f59e0b',
                fontWeight: '600',
              }}
            >
              <AlertCircle size={13} />
              <span>Caps Lock is active</span>
            </div>
          )}
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            marginTop: '-4px',
          }}
        >
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              userSelect: 'none',
              fontWeight: '500',
            }}
          >
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                accentColor: '#2454F4',
                cursor: 'pointer',
              }}
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => {
              setForgotEmail(email);
              setShowForgotModal(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '13px',
              color: '#2454F4',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Forgot password?
          </button>
        </div>

        {/* Primary Sign In Button */}
        <button
          type="submit"
          disabled={submitting || !email || !password || !isEmailValid}
          style={{
            width: '100%',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#2454F4',
            color: '#ffffff',
            border: 'none',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily: '"Inter", sans-serif',
            cursor: submitting || !email || !password || !isEmailValid ? 'not-allowed' : 'pointer',
            opacity: submitting || !email || !password || !isEmailValid ? 0.55 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '4px',
            boxShadow:
              submitting || !email || !password
                ? 'none'
                : '0 4px 14px rgba(36, 84, 244, 0.28)',
            transition: 'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!submitting && email && password && isEmailValid) {
              e.currentTarget.style.backgroundColor = '#1b3ec8';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#2454F4';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {submitting ? (
            <>
              <Loader2 size={17} className="spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          margin: '22px 0 16px 0',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
          }}
        />
        <span
          style={{
            fontSize: '12.5px',
            fontWeight: '500',
            color: 'var(--text-muted)',
          }}
        >
          or
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)',
          }}
        />
      </div>

      {/* Google Sign-in Button */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        style={{
          width: '100%',
          height: '46px',
          borderRadius: '12px',
          border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)'}`,
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
          color: 'var(--text-primary)',
          fontSize: '14px',
          fontWeight: '500',
          fontFamily: '"Inter", sans-serif',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(15, 23, 42, 0.03)';
          e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff';
          e.currentTarget.style.borderColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)';
        }}
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      {/* Footer Navigation */}
      <div
        style={{
          marginTop: '26px',
          paddingTop: '20px',
          borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'}`,
          textAlign: 'center',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
        }}
      >
        Don't have an account?{' '}
        <Link
          to={`/register?redirect=${encodeURIComponent(redirectTarget)}`}
          style={{
            color: '#2454F4',
            fontWeight: '600',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Sign up
        </Link>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '20px',
          }}
          onClick={() => {
            setShowForgotModal(false);
            setForgotSent(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: isDark ? 'var(--bg-elevated)' : '#ffffff',
              borderRadius: '20px',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)'}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '28px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSent(false);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
              }}
            >
              <X size={18} />
            </button>

            {!forgotSent ? (
              <form onSubmit={handleForgotSubmit}>
                <div style={{ marginBottom: '18px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(36, 84, 244, 0.1)',
                      color: '#2454F4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '14px',
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      margin: '0 0 6px 0',
                    }}
                  >
                    Reset your password
                  </h3>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      margin: 0,
                    }}
                  >
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <AuthInput
                    id="forgot-email"
                    label="Email address"
                    type="email"
                    placeholder="name@example.com"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (forgotFeedback) setForgotFeedback('');
                    }}
                    error={forgotFeedback || null}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    style={{
                      flex: 1,
                      height: '42px',
                      borderRadius: '10px',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)'}`,
                      backgroundColor: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    style={{
                      flex: 1.4,
                      height: '42px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: '#2454F4',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: forgotLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    {forgotLoading ? <Loader2 size={16} className="spin" /> : 'Send Instructions'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                  }}
                >
                  <Check size={24} />
                </div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    margin: '0 0 6px 0',
                  }}
                >
                  Instructions sent
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    margin: '0 0 20px 0',
                  }}
                >
                  If an account exists for <strong>{forgotEmail}</strong>, you will receive password reset instructions shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#2454F4',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default Login;
