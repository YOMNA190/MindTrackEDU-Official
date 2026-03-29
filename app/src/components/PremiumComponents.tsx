import React from 'react';
import '../styles/design-system.css';

/**
 * MindTrackEDU: Reusable Premium Components
 * Card, Button, Badge, Alert, Loading, Modal
 */

// Card Component
export const Card: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'gradient';
  className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
  const baseStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--space-6)',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    transition: 'all var(--transition-base)',
  };

  const variantStyles = {
    default: {},
    elevated: { boxShadow: 'var(--shadow-lg)' },
    gradient: {
      background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)',
      border: '1px solid var(--primary-200)',
    },
  };

  return (
    <div style={{ ...baseStyle, ...variantStyles[variant] }} className={className}>
      {children}
    </div>
  );
};

// Button Component
export const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, variant = 'primary', size = 'md', disabled = false, onClick, type = 'button' }) => {
  const baseStyle: React.CSSProperties = {
    border: 'none',
    borderRadius: 'var(--radius-lg)',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--transition-base)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    opacity: disabled ? 0.6 : 1,
  };

  const sizeStyles = {
    sm: { padding: 'var(--space-2) var(--space-4)', fontSize: '0.875rem' },
    md: { padding: 'var(--space-3) var(--space-6)', fontSize: '1rem' },
    lg: { padding: 'var(--space-4) var(--space-8)', fontSize: '1.125rem' },
  };

  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
      color: 'var(--white)',
      boxShadow: 'var(--shadow-sm)',
    },
    secondary: {
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--primary-600)',
    },
    danger: {
      background: 'var(--accent-danger)',
      color: 'var(--white)',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
      }}
    >
      {children}
    </button>
  );
};

// Badge Component
export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}> = ({ children, variant = 'primary' }) => {
  const variantStyles = {
    primary: { background: 'var(--primary-100)', color: 'var(--primary-600)' },
    secondary: { background: 'var(--secondary-100)', color: 'var(--secondary-600)' },
    success: { background: 'var(--secondary-100)', color: 'var(--secondary-600)' },
    warning: { background: 'var(--accent-warning)', color: 'var(--white)' },
    danger: { background: 'var(--accent-danger)', color: 'var(--white)' },
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
        fontWeight: '600',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  );
};

// Alert Component
export const Alert: React.FC<{
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
}> = ({ children, variant = 'info', title }) => {
  const variantStyles = {
    info: {
      background: 'var(--accent-info)',
      borderColor: 'var(--accent-info)',
      color: 'var(--white)',
    },
    success: {
      background: 'var(--secondary-100)',
      borderColor: 'var(--secondary-600)',
      color: 'var(--secondary-600)',
    },
    warning: {
      background: 'var(--accent-warning)',
      borderColor: 'var(--accent-warning)',
      color: 'var(--white)',
    },
    danger: {
      background: 'var(--accent-danger)',
      borderColor: 'var(--accent-danger)',
      color: 'var(--white)',
    },
  };

  return (
    <div
      style={{
        padding: 'var(--space-4)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid',
        ...variantStyles[variant],
      }}
    >
      {title && (
        <p style={{ fontWeight: '700', marginBottom: 'var(--space-2)' }}>
          {title}
        </p>
      )}
      <p style={{ fontSize: '0.875rem' }}>{children}</p>
    </div>
  );
};

// Loading Spinner
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeMap = {
    sm: '24px',
    md: '40px',
    lg: '60px',
  };

  return (
    <div
      style={{
        display: 'inline-block',
        width: sizeMap[size],
        height: sizeMap[size],
        border: '3px solid var(--border-color)',
        borderTop: '3px solid var(--primary-600)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Input Component
export const Input: React.FC<{
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
}> = ({ type = 'text', placeholder, value, onChange, disabled = false, error }) => {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: '100%',
          padding: 'var(--space-3) var(--space-4)',
          border: error ? '2px solid var(--accent-danger)' : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          fontSize: '1rem',
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          transition: 'all var(--transition-fast)',
          opacity: disabled ? 0.6 : 1,
        }}
      />
      {error && (
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--accent-danger)',
          marginTop: 'var(--space-2)',
        }}>
          {error}
        </p>
      )}
    </div>
  );
};

// Select Component
export const Select: React.FC<{
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
}> = ({ options, value, onChange, placeholder }) => {
  return (
    <select
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: 'var(--space-3) var(--space-4)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        fontSize: '1rem',
        background: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

// Checkbox Component
export const Checkbox: React.FC<{
  id: string;
  label: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ id, label, checked = false, onChange }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        style={{
          width: '18px',
          height: '18px',
          cursor: 'pointer',
          accentColor: 'var(--primary-600)',
        }}
      />
      <label htmlFor={id} style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
      }}>
        {label}
      </label>
    </div>
  );
};

// Progress Bar
export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning';
}> = ({ value, max = 100, variant = 'primary' }) => {
  const percentage = (value / max) * 100;

  const variantColors = {
    primary: 'var(--primary-600)',
    secondary: 'var(--secondary-600)',
    success: 'var(--secondary-600)',
    warning: 'var(--accent-warning)',
  };

  return (
    <div style={{
      width: '100%',
      height: '8px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--border-color)',
      overflow: 'hidden',
    }}>
      <div
        style={{
          height: '100%',
          width: `${percentage}%`,
          background: variantColors[variant],
          borderRadius: 'var(--radius-full)',
          transition: 'width var(--transition-base)',
        }}
      />
    </div>
  );
};

// Divider Component
export const Divider: React.FC<{ text?: string }> = ({ text }) => {
  if (text) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        margin: 'var(--space-6) 0',
      }}>
        <div style={{
          flex: 1,
          height: '1px',
          background: 'var(--border-color)',
        }} />
        <span style={{
          fontSize: '0.875rem',
          color: 'var(--text-tertiary)',
          fontWeight: '600',
        }}>
          {text}
        </span>
        <div style={{
          flex: 1,
          height: '1px',
          background: 'var(--border-color)',
        }} />
      </div>
    );
  }

  return (
    <div style={{
      height: '1px',
      background: 'var(--border-color)',
      margin: 'var(--space-6) 0',
    }} />
  );
};

// Tooltip Component
export const Tooltip: React.FC<{
  children: React.ReactNode;
  text: string;
}> = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: 'var(--space-2) var(--space-3)',
            background: 'var(--neutral-900)',
            color: 'var(--white)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            marginBottom: 'var(--space-2)',
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default {
  Card,
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  Input,
  Select,
  Checkbox,
  ProgressBar,
  Divider,
  Tooltip,
};
