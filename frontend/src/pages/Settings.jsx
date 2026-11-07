import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Globe, Shield, Bell, Lock, User, Palette } from 'lucide-react';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '80vh' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', fontWeight: '900', fontFamily: 'var(--font-display)', marginBottom: '16px' }}>Settings</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>Manage your account preferences, appearance, and notifications.</p>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            
            {/* Appearance Settings */}
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Palette size={24} color="var(--color-accent)" />
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Appearance</h2>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Theme</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Switch between light and dark mode</p>
                </div>
                <button 
                  onClick={toggleTheme}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px 16px', borderRadius: '100px', 
                    background: 'var(--input-bg)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isDark ? <Moon size={16}/> : <Sun size={16}/>}
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Language</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Select your preferred language</p>
                </div>
                <button 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px 16px', borderRadius: '100px', 
                    background: 'var(--input-bg)', border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer'
                  }}
                >
                  <Globe size={16}/>
                  English
                </button>
              </div>
            </div>

            {/* Account Settings */}
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <User size={24} color="var(--color-accent)" />
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Account</h2>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Profile Information</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Update your name and email</p>
                </div>
                <button style={{ padding: '8px 16px', borderRadius: '100px', background: 'transparent', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', fontWeight: '700', cursor: 'pointer' }}>Edit Profile</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Password</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Change your account password</p>
                </div>
                <button style={{ padding: '8px 16px', borderRadius: '100px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontWeight: '700', cursor: 'pointer' }}>Update</button>
              </div>
            </div>

            {/* Notifications */}
            <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(30px)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <Bell size={24} color="var(--color-accent)" />
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Notifications</h2>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Email Alerts</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Receive updates about your orders</p>
                </div>
                <div style={{ width: '44px', height: '24px', background: 'var(--color-accent)', borderRadius: '100px', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Promotional Offers</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Get notified about exclusive deals</p>
                </div>
                <div style={{ width: '44px', height: '24px', background: 'var(--input-bg)', border: '1px solid var(--glass-border)', borderRadius: '100px', position: 'relative', cursor: 'pointer' }}>
                  <div style={{ width: '18px', height: '18px', background: 'var(--text-muted)', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }} />
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
