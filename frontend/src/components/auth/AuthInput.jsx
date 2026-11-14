import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { AlertCircle } from 'lucide-react';

const AuthInput = ({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  placeholder,
  error,
  required = false,
  autoComplete,
  disabled = false,
  rightElement,
  style,
  ...props
}) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const inputId = id || name || `auth-input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: '600',
            color: isDark ? '#e2e8f0' : '#1e293b',
            marginBottom: '6px',
            userSelect: 'none',
          }}
        >
          <span>
            {label}
            {required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
          </span>
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          style={{
            width: '100%',
            height: '46px',
            padding: rightElement ? '0 44px 0 14px' : '0 14px',
            fontSize: '14px',
            fontFamily: '"Inter", sans-serif',
            color: isDark ? '#f8fafc' : '#0f172a',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
            border: error
              ? '1px solid rgba(239, 68, 68, 0.8)'
              : isFocused
              ? '1px solid #2454F4'
              : isDark
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(15, 23, 42, 0.14)',
            borderRadius: '12px',
            outline: 'none',
            boxShadow: error
              ? '0 0 0 3px rgba(239, 68, 68, 0.12)'
              : isFocused
              ? '0 0 0 3px rgba(36, 84, 244, 0.15)'
              : 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          {...props}
        />

        {rightElement && (
          <div
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            {rightElement}
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginTop: '5px',
            fontSize: '12px',
            color: '#ef4444',
            fontWeight: '500',
          }}
        >
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AuthInput;

