import React, { useState } from 'react';
import '../styles/design-system.css';

/**
 * MindTrackEDU: Premium Register Component
 * Features: Multi-role registration, form validation, bilingual support
 */
interface PremiumRegisterProps {
  onRegisterSuccess: () => void;
  onLoginClick: () => void;
}

const PremiumRegister: React.FC<PremiumRegisterProps> = ({ onRegisterSuccess: _onRegisterSuccess, onLoginClick: _onLoginClick }) => {
  const [role, setRole] = useState<'student' | 'therapist'>('student');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    agreeTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log(`Registering as ${role}:`, formData);
      setIsLoading(false);
    }, 1500);
  };

  const roleOptions = [
    { value: 'student', label: 'Student', labelAr: 'طالب' },
    { value: 'therapist', label: 'Therapist', labelAr: 'معالج' },
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

      <div style={{ width: '100%', maxWidth: '500px', position: 'relative', zIndex: 1 }}>
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
            Join MindTrackEDU
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
          }}>
            Create your account and start your mental health journey
          </p>
        </div>

        {/* Register Card */}
        <div className="card" style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-8)',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(10px)',
        }}>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Role Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                I am a / أنا
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
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

            {/* Full Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                Full Name / الاسم الكامل
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  border: errors.fullName ? '2px solid var(--accent-danger)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-fast)',
                }}
              />
              {errors.fullName && (
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', marginTop: 'var(--space-1)' }}>
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                Email Address / البريد الإلكتروني
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  border: errors.email ? '2px solid var(--accent-danger)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-fast)',
                }}
              />
              {errors.email && (
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', marginTop: 'var(--space-1)' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Institution */}
            {role === 'student' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: 'var(--space-2)',
                  color: 'var(--text-primary)',
                }}>
                  School/University / المدرسة/الجامعة
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="Your institution"
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
            )}

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                Password / كلمة المرور
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  border: errors.password ? '2px solid var(--accent-danger)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-fast)',
                }}
              />
              {errors.password && (
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', marginTop: 'var(--space-1)' }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                Confirm Password / تأكيد كلمة المرور
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: 'var(--space-3) var(--space-4)',
                  border: errors.confirmPassword ? '2px solid var(--accent-danger)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  transition: 'all var(--transition-fast)',
                }}
              />
              {errors.confirmPassword && (
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', marginTop: 'var(--space-1)' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-2)',
            }}>
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary-600)',
                  marginTop: '2px',
                }}
              />
              <label htmlFor="agreeTerms" style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}>
                I agree to the{' '}
                <a href="#" style={{
                  color: 'var(--primary-600)',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}>
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" style={{
                  color: 'var(--primary-600)',
                  textDecoration: 'none',
                  fontWeight: '600',
                }}>
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeTerms && (
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-danger)' }}>
                {errors.agreeTerms}
              </p>
            )}

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
              {isLoading ? 'Creating Account...' : 'Create Account / إنشاء حساب'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-8)',
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
        }}>
          <p>
            Already have an account?{' '}
            <a href="#" style={{
              color: 'var(--primary-600)',
              fontWeight: '600',
              textDecoration: 'none',
            }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PremiumRegister;
