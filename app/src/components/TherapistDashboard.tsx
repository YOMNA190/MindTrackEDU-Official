import React, { useState } from 'react';
import '../styles/design-system.css';

/**
 * MindTrackEDU: Premium Therapist Dashboard
 * Features: Patient management, session tracking, clinical insights, notes
 */
interface DashboardProps {
  onLogout: () => void;
  onNavigate: (page: any) => void;
  onProfileClick: () => void;
}

const TherapistDashboard: React.FC<DashboardProps> = ({ onLogout: _onLogout, onNavigate: _onNavigate, onProfileClick: _onProfileClick }) => {
  const [activeTab, setActiveTab] = useState<'patients' | 'sessions' | 'insights'>('patients');

  const patients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      status: 'Active',
      lastSession: '2 days ago',
      riskLevel: 'Mild',
      nextSession: 'Tomorrow at 3 PM',
      avatar: 'SJ',
    },
    {
      id: 2,
      name: 'Michael Chen',
      status: 'Active',
      lastSession: '1 week ago',
      riskLevel: 'Moderate',
      nextSession: 'Friday at 2 PM',
      avatar: 'MC',
    },
    {
      id: 3,
      name: 'Emma Wilson',
      status: 'Inactive',
      lastSession: '3 weeks ago',
      riskLevel: 'Low',
      nextSession: 'Not scheduled',
      avatar: 'EW',
    },
  ];

  const sessions = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      date: 'Today',
      time: '3:00 PM',
      duration: '60 min',
      status: 'Scheduled',
    },
    {
      id: 2,
      patient: 'Michael Chen',
      date: 'Tomorrow',
      time: '2:00 PM',
      duration: '45 min',
      status: 'Scheduled',
    },
    {
      id: 3,
      patient: 'Emma Wilson',
      date: 'Next Week',
      time: '10:00 AM',
      duration: '60 min',
      status: 'Pending',
    },
  ];

  const insights = [
    { label: 'Total Patients', value: '24', icon: '👥' },
    { label: 'Active Sessions', value: '18', icon: '📅' },
    { label: 'Avg. Risk Level', value: 'Mild', icon: '📊' },
    { label: 'Patient Satisfaction', value: '4.8/5', icon: '⭐' },
  ];

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
        <div>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
          }}>
            Therapist Dashboard 👨‍⚕️
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
          }}>
            Manage your patients and track clinical progress
          </p>
        </div>
        <button style={{
          padding: 'var(--space-3) var(--space-6)',
          background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
          color: 'var(--white)',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all var(--transition-base)',
        }}>
          + New Session
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-12)',
      }}>
        {insights.map((insight, index) => (
          <div
            key={index}
            className="card"
            style={{
              background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)',
              border: '1px solid var(--primary-200)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
            }}>
              <div style={{
                fontSize: '2.5rem',
              }}>
                {insight.icon}
              </div>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-1)',
                }}>
                  {insight.label}
                </p>
                <p style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  color: 'var(--primary-600)',
                }}>
                  {insight.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        {(['patients', 'sessions', 'insights'] as const).map((tab) => (
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
      {activeTab === 'patients' && (
        <div className="card" style={{ background: 'var(--bg-primary)' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: 'var(--space-6)',
            color: 'var(--text-primary)',
          }}>
            Your Patients
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {patients.map((patient) => (
              <div
                key={patient.id}
                style={{
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--primary-300)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-4)',
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--secondary-600) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--white)',
                    fontWeight: '700',
                  }}>
                    {patient.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      marginBottom: 'var(--space-1)',
                    }}>
                      {patient.name}
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                    }}>
                      {patient.status}
                    </p>
                  </div>
                  <span style={{
                    padding: 'var(--space-1) var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    background: patient.riskLevel === 'Mild' ? 'var(--accent-warning)' : 'var(--accent-danger)',
                    color: 'var(--white)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}>
                    {patient.riskLevel}
                  </span>
                </div>
                <div style={{
                  paddingTop: 'var(--space-4)',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}>
                  <p style={{ marginBottom: 'var(--space-2)' }}>
                    <strong>Last Session:</strong> {patient.lastSession}
                  </p>
                  <p>
                    <strong>Next Session:</strong> {patient.nextSession}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="card" style={{ background: 'var(--bg-primary)' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: 'var(--space-6)',
            color: 'var(--text-primary)',
          }}>
            Upcoming Sessions
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}>
            {sessions.map((session) => (
              <div
                key={session.id}
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
                    {session.patient}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                  }}>
                    {session.date} at {session.time} • {session.duration}
                  </p>
                </div>
                <span style={{
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-full)',
                  background: session.status === 'Scheduled' ? 'var(--secondary-100)' : 'var(--neutral-200)',
                  color: session.status === 'Scheduled' ? 'var(--secondary-600)' : 'var(--neutral-600)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="card" style={{ background: 'var(--bg-primary)' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: 'var(--space-6)',
            color: 'var(--text-primary)',
          }}>
            Clinical Insights
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            <div style={{
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)',
              border: '1px solid var(--primary-200)',
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
              }}>
                Most Common Condition
              </p>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--primary-600)',
              }}>
                Anxiety Disorder
              </p>
            </div>
            <div style={{
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--secondary-50) 0%, var(--primary-50) 100%)',
              border: '1px solid var(--secondary-200)',
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-2)',
              }}>
                Avg. Session Duration
              </p>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--secondary-600)',
              }}>
                52 minutes
              </p>
            </div>
            <div style={{
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--accent-info) 0%, var(--primary-500) 100%)',
              border: '1px solid var(--primary-300)',
            }}>
              <p style={{
                fontSize: '0.875rem',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: 'var(--space-2)',
              }}>
                Patient Recovery Rate
              </p>
              <p style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--white)',
              }}>
                78%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistDashboard;
