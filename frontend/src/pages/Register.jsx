import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
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

const PasswordStrength = ({ password }) => {
  const { isDark } = useTheme();
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const score = [hasMinLen, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthMeta = () => {
    if (password.length === 0) return { label: '', color: 'transparent' };
    if (score <= 1) return { label: 'Weak', color: '#ef4444' };
    if (score === 2) return { label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { label: 'Good', color: '#3b82f6' };
    return { label: 'Strong', color: '#10b981' };
  };

  const { label, color } = getStrengthMeta();

  if (password.length === 0) return null;

  return (
    <div
      style={{
        marginTop: '8px',
        padding: '10px 12px',
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.02)',
        borderRadius: '10px',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'}`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Password Strength
        </span>
        <span style={{ fontSize: '11px', color, fontWeight: '700' }}>
          {label}
        </span>
      </div>

      {/* Progress Bars */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              height: '3px',
              borderRadius: '2px',
              backgroundColor: score >= step ? color : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
              transition: 'background-color 0.25s ease',
            }}
          />
        ))}
      </div>

      {/* Criteria Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', fontSize: '11.5px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: hasMinLen ? '#10b981' : 'var(--text-muted)' }}>
          <CheckCircle2 size={12} /> 8+ Characters
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: hasUpper ? '#10b981' : 'var(--text-muted)' }}>
          <CheckCircle2 size={12} /> Uppercase Letter
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: hasNumber ? '#10b981' : 'var(--text-muted)' }}>
          <CheckCircle2 size={12} /> Number
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: hasSpecial ? '#10b981' : 'var(--text-muted)' }}>
          <CheckCircle2 size={12} /> Special Symbol
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  const { register } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/';

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [authError, setAuthError] = useState('');

  // Terms Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Email validation
  const isEmailValid = email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  // Password match validation
  const isPasswordMatch = confirmPassword.trim() === '' || password === confirmPassword;

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

    if (!name.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAuthError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setAuthError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate(redirectTarget);
    } catch (error) {
      const msg = error.message || 'Registration failed. Please try again.';
      setAuthError(msg);
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    setAuthError('Google account registration is enabled via corporate SSO. Please sign up with your email.');
  };

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    isEmailValid &&
    password.length >= 8 &&
    password === confirmPassword &&
    agreeTerms;

  return (
    <AuthLayout
      backTo={redirectTarget}
      backLabel="Back to UCONEXT"
      brandPanel={<AuthBrandPanel />}
    >
      {/* Brand Header */}
      <div style={{ marginBottom: '26px' }}>
        <div style={{ display: 'inline-block', marginBottom: '20px' }}>
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
          Create your account
        </h1>
        <p
          style={{
            fontSize: '14.5px',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: '1.5',
          }}
        >
          Set up your UCONEXT identity in moments.
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
            marginBottom: '18px',
          }}
        >
          <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{authError}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Full Name Field */}
        <AuthInput
          id="register-name"
          name="name"
          label="Full name"
          type="text"
          placeholder="David Nguyen"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (authError) setAuthError('');
          }}
          required
          autoComplete="name"
        />

        {/* Email Field */}
        <AuthInput
          id="register-email"
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
            id="register-password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (authError) setAuthError('');
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyDown}
            required
            autoComplete="new-password"
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
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />
          <PasswordStrength password={password} />
        </div>

        {/* Confirm Password Field */}
        <div>
          <AuthInput
            id="register-confirm-password"
            name="confirmPassword"
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (authError) setAuthError('');
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyDown}
            required
            autoComplete="new-password"
            error={!isPasswordMatch ? 'Passwords do not match' : null}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

        {/* Terms and Privacy Agreement Checkbox */}
        <div style={{ marginTop: '2px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '9px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.45',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (authError) setAuthError('');
              }}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                accentColor: '#2454F4',
                marginTop: '2px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
            <span>
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#2454F4',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#2454F4',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Privacy Policy
              </button>
              .
            </span>
          </label>
        </div>

        {/* Primary Create Account Button */}
        <button
          type="submit"
          disabled={submitting || !isFormValid}
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
            cursor: submitting || !isFormValid ? 'not-allowed' : 'pointer',
            opacity: submitting || !isFormValid ? 0.55 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '6px',
            boxShadow:
              submitting || !isFormValid
                ? 'none'
                : '0 4px 14px rgba(36, 84, 244, 0.28)',
            transition: 'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!submitting && isFormValid) {
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
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          margin: '20px 0 14px 0',
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

      {/* Google Sign-up Button */}
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
          marginTop: '22px',
          paddingTop: '18px',
          borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(15, 23, 42, 0.06)'}`,
          textAlign: 'center',
          fontSize: '13.5px',
          color: 'var(--text-secondary)',
        }}
      >
        Already have an account?{' '}
        <Link
          to={`/login?redirect=${encodeURIComponent(redirectTarget)}`}
          style={{
            color: '#2454F4',
            fontWeight: '600',
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Sign in
        </Link>
      </div>

      {/* Terms of Service & Privacy Policy Modal */}
      {showTermsModal && (
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
          onClick={() => setShowTermsModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: isDark ? 'var(--bg-elevated)' : '#ffffff',
              borderRadius: '20px',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)'}`,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              padding: '28px',
              position: 'relative',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <button
              onClick={() => setShowTermsModal(false)}
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

            <h3
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
                margin: '0 0 12px 0',
              }}
            >
              Terms of Service & Privacy
            </h3>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                paddingRight: '6px',
              }}
            >
              <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '14px 0 6px 0' }}>
                1. System Access & Security
              </h4>
              <p style={{ margin: '0 0 10px 0' }}>
                Your account provides secure access to the UCONEXT ecosystem. Credentials and personal identity data are encrypted end-to-end.
              </p>

              <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '14px 0 6px 0' }}>
                2. Privacy Commitment
              </h4>
              <p style={{ margin: '0 0 10px 0' }}>
                We prioritize user privacy. Your information is used strictly to power your personalized experience and is never sold to third-party data brokers.
              </p>

              <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', margin: '14px 0 6px 0' }}>
                3. Connected Services
              </h4>
              <p style={{ margin: '0 0 10px 0' }}>
                By creating an account, you agree to comply with system acceptable use policies and maintain the confidentiality of your credentials.
              </p>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'}` }}>
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(true);
                  setShowTermsModal(false);
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
                I Understand & Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default Register;
