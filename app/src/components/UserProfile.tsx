import React, { useState } from 'react';
import '../styles/design-system.css';

/**
 * MindTrackEDU: Premium User Profile
 * Features: Profile management, preferences, security settings
 */
interface UserProfileProps {
  userRole: 'student' | 'therapist' | 'admin' | null;
  onLogout: () => void;
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ userRole: _userRole, onLogout: _onLogout, onBack: _onBack }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Mental health advocate and student',
    institution: 'Harvard University',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log('Profile saved:', formData);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      padding: 'var(--space-6)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-12)',
      }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
        }}>
          My Profile 👤
        </h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--transition-base)',
            }}
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)',
        border: '1px solid var(--primary-200)',
        marginBottom: 'var(--space-12)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-8)',
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--secondary-600) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--white)',
            fontWeight: '700',
            fontSize: '2.5rem',
            boxShadow: 'var(--shadow-lg)',
          }}>
            SJ
          </div>
          <div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-2)',
            }}>
              {formData.fullName}
            </h2>
            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-1)',
            }}>
              {formData.email}
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-tertiary)',
            }}>
              Member since January 2024
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        {(['profile', 'preferences', 'security'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab ? 'var(--primary-600)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? '700' : '600',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid var(--primary-600)' : 'none',
              transition: 'all var(--transition-base)',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'profile' && (
        <div className="card" style={{ background: 'var(--bg-primary)' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: 'var(--space-6)',
            color: 'var(--text-primary)',
          }}>
            Personal Information
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-6)',
          }}>
            {/* Full Name */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                  }}
                />
              ) : (
                <p style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                }}>
                  {formData.fullName}
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
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                  }}
                />
              ) : (
                <p style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                }}>
                  {formData.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                  }}
                />
              ) : (
                <p style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                }}>
                  {formData.phone}
                </p>
              )}
            </div>

            {/* Institution */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                Institution
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                  }}
                />
              ) : (
                <p style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                }}>
                  {formData.institution}
                </p>
              )}
            </div>

            {/* Bio */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '600',
                marginBottom: 'var(--space-2)',
                color: 'var(--text-primary)',
              }}>
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    resize: 'vertical',
                  }}
                />
              ) : (
                <p style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontWeight: '600',
                }}>
                  {formData.bio}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
            <div style={{
              display: 'flex',
              gap: 'var(--space-4)',
              marginTop: 'var(--space-8)',
            }}>
              <button
                onClick={handleSave}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                  color: 'var(--white)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                }}
              >
                💾 Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                }}
              >
                ✕ Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'preferences' && (
        <div className="card" style={{ background: 'var(--bg-primary)' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: 'var(--space-6)',
            color: 'var(--text-primary)',
          }}>
            Preferences
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}>
            {[
              { title: 'Email Notifications', description: 'Receive updates about your sessions', enabled: true },
              { title: 'SMS Reminders', description: 'Get SMS reminders before appointments', enabled: false },
              { title: 'Weekly Reports', description: 'Receive weekly mental health reports', enabled: true },
              { title: 'Marketing Emails', description: 'Receive news and updates from MindTrackEDU', enabled: false },
            ].map((pref, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <p style={{
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-1)',
                  }}>
                    {pref.title}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}>
                    {pref.description}
                  </p>
                </div>
                <div style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  background: pref.enabled ? 'var(--secondary-600)' : 'var(--neutral-300)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  position: 'relative',
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--white)',
                    position: 'absolute',
                    top: '2px',
                    left: pref.enabled ? '24px' : '2px',
                    transition: 'all var(--transition-base)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card" style={{ background: 'var(--bg-primary)' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: 'var(--space-6)',
            color: 'var(--text-primary)',
          }}>
            Security Settings
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
          }}>
            {/* Change Password */}
            <div style={{
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                marginBottom: 'var(--space-4)',
                color: 'var(--text-primary)',
              }}>
                Change Password
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-4)',
              }}>
                <input
                  type="password"
                  placeholder="Current Password"
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1rem',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <button style={{
                padding: 'var(--space-3) var(--space-6)',
                background: 'var(--primary-600)',
                color: 'var(--white)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontWeight: '600',
                cursor: 'pointer',
              }}>
                Update Password
              </button>
            </div>

            {/* Two-Factor Authentication */}
            <div style={{
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '700',
                    marginBottom: 'var(--space-1)',
                    color: 'var(--text-primary)',
                  }}>
                    Two-Factor Authentication
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}>
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--secondary-600)',
                  color: 'var(--white)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}>
                  Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
