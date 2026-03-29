import React, { useState } from 'react';
import '../styles/design-system.css';

interface PremiumLoginProps {
  onLoginSuccess?: (role: 'student' | 'therapist' | 'admin') => void;
  onRegisterClick?: () => void;
}

/**
 * MindTrackEDU: Premium Login Component
 * Features: Multi-role authentication, bilingual support, premium design
 * Inspired by Stripe, Apple, and Notion
 */
const PremiumLogin: React.FC<PremiumLoginProps> = ({ onLoginSuccess, onRegisterClick }) => {
  const [role, setRole] = useState<'student' | 'therapist' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(`Logging in as ${role} with ${email}`);
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(role);
      }
    }, 1000);
  };

  const roleOptions = [
    { value: 'student', label: 'Student', labelAr: 'طالب' },
    { value: 'therapist', label: 'Therapist', labelAr: 'معالج' },
    { value: 'admin', label: 'Administrator', labelAr: 'مسؤول' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)',
      padding: 'var(--space-4)',
    }}>
      {/* Background Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: -1,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-50%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        zIndex: -1,
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--secondary-600) 100%)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-6)',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <span style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: 'var(--white)',
              fontFamily: 'var(--font-display)',
            }}>
              MT
            </span>
          </div>
          
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '800',
            marginBottom: 'var(--space-2)',
            color: 'var(--text-primary)',
          }}>
            MindTrackEDU
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2)',
          }}>
            Mental Health Support Platform
          </p>
          
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-tertiary)',
          }}>
            منصة دعم الصحة النفسية
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(10px)',
        }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Role Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                Select Your Role / اختر دورك
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--space-2)',
              }}>
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value as any)}
                    style={{
                      padding: 'var(--space-3) var(--space-2)',
                      borderRadius: 'var(--radius-lg)',
                      border: role === option.value 
                        ? '2px solid var(--primary-600)' 
                        : '1px solid var(--border-color)',
                      background: role === option.value 
                        ? 'var(--primary-50)' 
                        : 'var(--bg-secondary)',
                      color: role === option.value 
                        ? 'var(--primary-600)' 
                        : 'var(--text-secondary)',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                    }}
                  >
                    <div>{option.label}</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{option.labelAr}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                Email Address / عنوان البريد الإلكتروني
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-fast)',
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-2)',
              }}>
                <label style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}>
                  Password / كلمة المرور
                </label>
                <a href="#" style={{
                  fontSize: '0.875rem',
                  color: 'var(--primary-600)',
                  textDecoration: 'none',
                  fontWeight: '500',
                }}>
                  Forgot?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-fast)',
                }}
              />
            </div>

            {/* Remember Me */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary-600)',
                }}
              />
              <label htmlFor="rememberMe" style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}>
                Remember me / تذكرني
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-6)',
                fontSize: '1rem',
                fontWeight: '700',
                background: isLoading 
                  ? 'var(--neutral-400)' 
                  : 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In / دخول'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            margin: 'var(--space-8) 0',
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'var(--border-color)',
            }} />
            <span style={{
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
            }}>
              or / أو
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              background: 'var(--border-color)',
            }} />
          </div>

          {/* Social Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-4)',
          }}>
            <button
              type="button"
              className="btn-secondary"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: '0.875rem',
              }}
            >
              Google
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: '0.875rem',
              }}
            >
              GitHub
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-8)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          <p>
            Don't have an account?{' '}
            <button
              onClick={onRegisterClick}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-600)',
                fontWeight: '600',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Sign up
            </button>
          </p>
          <p style={{ marginTop: 'var(--space-2)' }}>
            ليس لديك حساب؟{' '}
            <button
              onClick={onRegisterClick}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-600)',
                fontWeight: '600',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              سجل الآن
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumLogin;
