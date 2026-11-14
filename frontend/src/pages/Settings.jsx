import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  User,
  Lock,
  Palette,
  Check,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { getSafeImageUrl, handleImageError } from '../utils/formatters';

const InlineFeedback = ({ feedback }) => {
  if (!feedback?.message) return null;
  const isError = feedback.type === 'error';
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '10px',
        fontSize: '13px',
        fontWeight: '600',
        background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        border: `1px solid ${isError ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
        color: isError ? 'var(--color-error)' : 'var(--color-success)',
      }}
    >
      {isError ? <AlertCircle size={16} style={{ flexShrink: 0 }} /> : <Check size={16} style={{ flexShrink: 0 }} />}
      <span>{feedback.message}</span>
    </div>
  );
};

const PasswordInput = ({ id, label, value, onChange, placeholder, autoComplete }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="settings-input"
          style={{ paddingRight: '42px' }}
        />
        <button
          type="button"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px',
          }}
        >
          {visible ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
    </div>
  );
};

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, loading: authLoading, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  // Profile form state
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setProfileFeedback(null);
    try {
      const res = await api.media.uploadAvatar(file);
      if (res?.imageUrl) {
        setAvatar(res.imageUrl);
        setProfileFeedback({ type: 'success', message: 'Avatar uploaded. Click "Save Profile" to apply.' });
      }
    } catch (err) {
      setProfileFeedback({ type: 'error', message: err.message || 'Failed to upload avatar.' });
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileFeedback(null);

    const trimmedName = name.trim();
    const trimmedAvatar = avatar.trim();

    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setProfileFeedback({ type: 'error', message: 'Name must be between 2 and 80 characters.' });
      return;
    }

    if (trimmedAvatar && trimmedAvatar.length > 500) {
      setProfileFeedback({ type: 'error', message: 'Avatar URL must be 500 characters or fewer.' });
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.auth.updateProfile({ name: trimmedName, avatar: trimmedAvatar });
      if (res?.user) {
        updateUser(res.user);
      }
      setProfileFeedback({ type: 'success', message: 'Profile updated successfully.' });
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      setProfileFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Please fill in all password fields.' });
      return;
    }

    if (newPassword.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setPasswordFeedback({
        type: 'error',
        message: 'New password must be at least 8 characters and include uppercase, lowercase, and a number.',
      });
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password must be different from your current password.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      await api.auth.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordFeedback({ type: 'success', message: 'Password updated successfully.' });
      showToast('Password updated successfully.', 'success');
    } catch (err) {
      setPasswordFeedback({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const avatarPreviewUrl = avatar.trim() ? getSafeImageUrl(avatar.trim()) : null;
  const userInitial = (name || user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="settings-page-container">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '10px',
          }}
        >
          <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Settings</span>
        </div>
        <h1
          style={{
            fontSize: '30px',
            fontWeight: '800',
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
            margin: '0 0 6px 0',
          }}
        >
          Account & Preferences
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Manage your profile details, account security, and display theme.
        </p>
      </div>

      <div className="settings-layout">
        {/* Left Sidebar Summary */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="settings-card">
            {authLoading ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Loading account...</p>
            ) : user ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--brand)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    fontWeight: '800',
                    border: '2px solid var(--glass-border)',
                  }}
                >
                  {avatarPreviewUrl ? (
                    <img
                      src={avatarPreviewUrl}
                      alt={user.name}
                      onError={handleImageError}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    userInitial
                  )}
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                    {user.name}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 10px 0', wordBreak: 'break-all' }}>
                    {user.email}
                  </p>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: 'rgba(36, 84, 244, 0.12)',
                      color: 'var(--brand)',
                    }}
                  >
                    <ShieldCheck size={13} />
                    {user.role || 'customer'}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
                  <LogIn size={20} color="var(--brand)" />
                  <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Sign in to your account</h2>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  Log in to update your profile information or change your password. Theme preferences apply immediately.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <Link to="/login" className="settings-btn-primary" style={{ textDecoration: 'none' }}>
                    Sign In
                  </Link>
                  <Link to="/register" className="settings-btn-secondary" style={{ textDecoration: 'none' }}>
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Appearance Card */}
          <div className="settings-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Palette size={19} color="var(--brand)" />
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Appearance
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Color Theme</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Currently using {isDark ? 'Dark' : 'Light'} mode
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="settings-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {isDark ? <Moon size={15} /> : <Sun size={15} />}
                {isDark ? 'Dark' : 'Light'}
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {user && (
            <>
              {/* Profile Information */}
              <section className="settings-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <User size={20} color="var(--brand)" />
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                      Profile Information
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Update your display name and profile picture.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="settings-form-grid">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="settings-name" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        Full Name
                      </label>
                      <input
                        id="settings-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        maxLength={80}
                        className="settings-input"
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label htmlFor="settings-email" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        Email Address
                      </label>
                      <input
                        id="settings-email"
                        type="email"
                        value={user.email || ''}
                        disabled
                        className="settings-input"
                        style={{ opacity: 0.65, cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="settings-avatar" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Avatar URL
                    </label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <input
                        id="settings-avatar"
                        type="text"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="https://... or upload an image"
                        className="settings-input"
                        style={{ flex: 1, minWidth: '220px' }}
                      />
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="settings-btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Upload size={15} />
                        {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                      </button>
                    </div>
                  </div>

                  <InlineFeedback feedback={profileFeedback} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button type="submit" disabled={savingProfile} className="settings-btn-primary">
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </section>

              {/* Change Password */}
              <section className="settings-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <Lock size={20} color="var(--brand)" />
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                      Change Password
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                      Use at least 8 characters with uppercase, lowercase, and a number.
                    </p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <PasswordInput
                    id="current-password"
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />

                  <div className="settings-form-grid">
                    <PasswordInput
                      id="new-password"
                      label="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 chars (A-Z, a-z, 0-9)"
                      autoComplete="new-password"
                    />
                    <PasswordInput
                      id="confirm-password"
                      label="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                    />
                  </div>

                  <InlineFeedback feedback={passwordFeedback} />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={savingPassword} className="settings-btn-primary">
                      {savingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </section>
            </>
          )}
        </div>
      </div>

      <style>{`
        .settings-page-container {
          max-width: 1560px;
          margin: 0 auto;
          padding: 32px 48px 64px;
          min-height: 75vh;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .settings-card {
          background: var(--bg-secondary);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          padding: 24px;
        }

        .settings-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .settings-input {
          width: 100%;
          padding: 11px 14px;
          border-radius: 10px;
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .settings-input:focus {
          border-color: var(--brand);
        }

        .settings-btn-primary {
          padding: 10px 20px;
          border-radius: 10px;
          background: var(--brand);
          border: 1px solid var(--brand);
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease, opacity 0.15s ease;
        }

        .settings-btn-primary:hover:not(:disabled) {
          background: var(--brand-hover);
        }

        .settings-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .settings-btn-secondary {
          padding: 10px 16px;
          border-radius: 10px;
          background: var(--bg-elevated);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }

        .settings-btn-secondary:hover:not(:disabled) {
          border-color: var(--brand);
        }

        .settings-btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 1024px) {
          .settings-page-container { padding: 28px 28px 56px; }
          .settings-layout { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .settings-page-container { padding: 20px 16px 48px; }
          .settings-form-grid { grid-template-columns: 1fr; }
          .settings-card { padding: 18px; }
        }
      `}</style>
    </div>
  );
};

export default Settings;
