import React, { useState } from 'react';
import '../styles/design-system.css';

/**
 * MindTrackEDU: Premium Admin Dashboard
 * Features: System monitoring, user management, analytics, compliance
 */
const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'compliance'>('overview');

  const stats = [
    { label: 'Total Users', value: '2,847', change: '+12%', icon: '👥' },
    { label: 'Active Sessions', value: '456', change: '+8%', icon: '📊' },
    { label: 'System Health', value: '99.8%', change: '↑', icon: '💚' },
    { label: 'Data Encrypted', value: '100%', change: '✓', icon: '🔒' },
  ];

  const users = [
    { id: 1, name: 'Sarah Johnson', role: 'Student', status: 'Active', joinDate: '2024-01-15' },
    { id: 2, name: 'Dr. Emily Johnson', role: 'Therapist', status: 'Active', joinDate: '2024-01-10' },
    { id: 3, name: 'Michael Chen', role: 'Student', status: 'Active', joinDate: '2024-02-01' },
    { id: 4, name: 'Admin User', role: 'Administrator', status: 'Active', joinDate: '2024-01-01' },
  ];

  const compliance = [
    { standard: 'GDPR', status: 'Compliant', lastAudit: '2024-03-15' },
    { standard: 'HIPAA', status: 'Compliant', lastAudit: '2024-03-10' },
    { standard: 'ISO 27001', status: 'Pending', lastAudit: '2024-02-28' },
    { standard: 'FERPA', status: 'Compliant', lastAudit: '2024-03-12' },
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
            Admin Dashboard 🛡️
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
          }}>
            System monitoring and user management
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: 'var(--space-4)',
        }}>
          <button style={{
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
          }}>
            📊 Reports
          </button>
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
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* System Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-12)',
      }}>
        {stats.map((stat, index) => (
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
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 'var(--space-4)',
            }}>
              <div style={{ fontSize: '2rem' }}>{stat.icon}</div>
              <span style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-full)',
                background: stat.change.includes('+') ? 'var(--secondary-100)' : 'var(--neutral-200)',
                color: stat.change.includes('+') ? 'var(--secondary-600)' : 'var(--neutral-600)',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}>
                {stat.change}
              </span>
            </div>
            <p style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)',
            }}>
              {stat.label}
            </p>
            <p style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: 'var(--primary-600)',
            }}>
              {stat.value}
            </p>
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
        {(['overview', 'users', 'compliance'] as const).map((tab) => (
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
      {activeTab === 'overview' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          <div className="card" style={{ background: 'var(--bg-primary)', gridColumn: 'span 1' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: 'var(--space-4)',
              color: 'var(--text-primary)',
            }}>
              System Performance 📈
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
            }}>
              {[
                { label: 'API Response Time', value: '45ms', status: 'Good' },
                { label: 'Database Load', value: '32%', status: 'Normal' },
                { label: 'Memory Usage', value: '58%', status: 'Normal' },
                { label: 'Disk Space', value: '72%', status: 'Warning' },
              ].map((item, index) => (
                <div key={index}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-2)',
                  }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                      {item.label}
                    </span>
                    <span style={{ fontWeight: '700', color: 'var(--primary-600)' }}>
                      {item.value}
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-secondary)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: item.value.includes('45') ? '45%' : item.value.includes('32') ? '32%' : item.value.includes('58') ? '58%' : '72%',
                      background: item.status === 'Warning' 
                        ? 'var(--accent-warning)' 
                        : 'var(--secondary-600)',
                      borderRadius: 'var(--radius-full)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-primary)', gridColumn: 'span 1' }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: 'var(--space-4)',
              color: 'var(--text-primary)',
            }}>
              Recent Activity 📝
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}>
              {[
                { action: 'New user registered', time: '5 minutes ago' },
                { action: 'System backup completed', time: '1 hour ago' },
                { action: 'Security audit passed', time: '3 hours ago' },
                { action: 'Database optimization', time: '6 hours ago' },
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <p style={{
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--space-1)',
                  }}>
                    {item.action}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-tertiary)',
                  }}>
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card" style={{ background: 'var(--bg-primary)' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: 'var(--space-6)',
            color: 'var(--text-primary)',
          }}>
            User Management
          </h2>
          <div style={{
            overflowX: 'auto',
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{
                  borderBottom: '2px solid var(--border-color)',
                }}>
                  <th style={{
                    textAlign: 'left',
                    padding: 'var(--space-4)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                  }}>
                    Name
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: 'var(--space-4)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                  }}>
                    Role
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: 'var(--space-4)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                  }}>
                    Status
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: 'var(--space-4)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                  }}>
                    Join Date
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: 'var(--space-4)',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <td style={{
                      padding: 'var(--space-4)',
                      color: 'var(--text-primary)',
                      fontWeight: '600',
                    }}>
                      {user.name}
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      color: 'var(--text-secondary)',
                    }}>
                      {user.role}
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                    }}>
                      <span style={{
                        padding: 'var(--space-1) var(--space-3)',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--secondary-100)',
                        color: 'var(--secondary-600)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.875rem',
                    }}>
                      {user.joinDate}
                    </td>
                    <td style={{
                      padding: 'var(--space-4)',
                    }}>
                      <button style={{
                        padding: 'var(--space-2) var(--space-3)',
                        background: 'var(--primary-600)',
                        color: 'var(--white)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all var(--transition-base)',
                      }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="card" style={{ background: 'var(--bg-primary)' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: 'var(--space-6)',
            color: 'var(--text-primary)',
          }}>
            Compliance Status
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {compliance.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: 'var(--space-6)',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-4)',
                }}>
                  <p style={{
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                  }}>
                    {item.standard}
                  </p>
                  <span style={{
                    padding: 'var(--space-1) var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    background: item.status === 'Compliant' ? 'var(--secondary-100)' : 'var(--accent-warning)',
                    color: item.status === 'Compliant' ? 'var(--secondary-600)' : 'var(--white)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}>
                    {item.status}
                  </span>
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                }}>
                  Last Audit: {item.lastAudit}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
