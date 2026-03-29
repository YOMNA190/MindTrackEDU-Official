import React, { useState } from 'react';
import '../styles/design-system.css';

/**
 * MindTrackEDU: Premium Student Dashboard
 * Features: Mental health tracking, mood monitoring, resources, therapist connection
 */
const StudentDashboard: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const moods = [
    { value: 1, emoji: '😢', label: 'Very Bad' },
    { value: 2, emoji: '😟', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Neutral' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Great' },
  ];

  const recentAssessments = [
    { name: 'PHQ-9 (Depression)', score: 12, status: 'Mild', date: '2 days ago' },
    { name: 'GAD-7 (Anxiety)', score: 8, status: 'Mild', date: '1 week ago' },
    { name: 'Stress Level', score: 6, status: 'Moderate', date: '3 days ago' },
  ];

  const resources = [
    { title: 'Meditation Guide', description: '10-minute guided meditation', icon: '🧘' },
    { title: 'Breathing Exercises', description: 'Manage anxiety with breathing', icon: '💨' },
    { title: 'Sleep Tips', description: 'Improve your sleep quality', icon: '😴' },
    { title: 'Stress Management', description: 'Practical stress relief techniques', icon: '🎯' },
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
            Welcome back, Sarah! 👋
          </h1>
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
          }}>
            How are you feeling today? Let's track your mental health journey.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}>
          <button style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-600)',
            color: 'var(--white)',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            🔔
          </button>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--secondary-600) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--white)',
            fontWeight: '700',
            fontSize: '1.25rem',
          }}>
            S
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-6)',
        marginBottom: 'var(--space-12)',
      }}>
        {/* Mood Tracker Card */}
        <div className="card" style={{
          gridColumn: 'span 1',
          background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)',
          border: '1px solid var(--primary-200)',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: 'var(--space-4)',
            color: 'var(--text-primary)',
          }}>
            How are you feeling? 🎯
          </h2>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            gap: 'var(--space-2)',
          }}>
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-lg)',
                  border: selectedMood === mood.value 
                    ? '2px solid var(--primary-600)' 
                    : '1px solid transparent',
                  background: selectedMood === mood.value 
                    ? 'var(--white)' 
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  fontSize: '2rem',
                }}
              >
                {mood.emoji}
                <span style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  fontWeight: '600',
                }}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>
          <button style={{
            width: '100%',
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--primary-600)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
          }}>
            Log Mood
          </button>
        </div>

        {/* Quick Stats */}
        <div className="card" style={{
          gridColumn: 'span 1',
          background: 'var(--bg-primary)',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: 'var(--space-4)',
            color: 'var(--text-primary)',
          }}>
            Your Stats 📊
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 'var(--space-4)',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                Mood Streak
              </span>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--primary-600)',
              }}>
                12 days
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 'var(--space-4)',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                Assessments Done
              </span>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--secondary-600)',
              }}>
                8
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>
                Therapist Sessions
              </span>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: '800',
                color: 'var(--accent-info)',
              }}>
                3
              </span>
            </div>
          </div>
        </div>

        {/* Therapist Connection */}
        <div className="card" style={{
          gridColumn: 'span 1',
          background: 'linear-gradient(135deg, var(--secondary-50) 0%, var(--primary-50) 100%)',
          border: '1px solid var(--secondary-200)',
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            marginBottom: 'var(--space-4)',
            color: 'var(--text-primary)',
          }}>
            Your Therapist 👨‍⚕️
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--secondary-600) 0%, var(--primary-600) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--white)',
              fontWeight: '700',
              fontSize: '1.5rem',
            }}>
              DR
            </div>
            <div>
              <p style={{
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-1)',
              }}>
                Dr. Emily Johnson
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                Clinical Psychologist
              </p>
            </div>
          </div>
          <button style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--secondary-600)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all var(--transition-base)',
          }}>
            Schedule Session
          </button>
        </div>
      </div>

      {/* Recent Assessments */}
      <div className="card" style={{
        marginBottom: 'var(--space-12)',
        background: 'var(--bg-primary)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: 'var(--space-6)',
          color: 'var(--text-primary)',
        }}>
          Recent Assessments 📋
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {recentAssessments.map((assessment, index) => (
            <div
              key={index}
              style={{
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <p style={{
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)',
              }}>
                {assessment.name}
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-2)',
              }}>
                <span style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  color: 'var(--primary-600)',
                }}>
                  {assessment.score}
                </span>
                <span style={{
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-warning)',
                  color: 'var(--white)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                }}>
                  {assessment.status}
                </span>
              </div>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-tertiary)',
              }}>
                {assessment.date}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Resources */}
      <div className="card" style={{
        background: 'var(--bg-primary)',
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: 'var(--space-6)',
          color: 'var(--text-primary)',
        }}>
          Recommended Resources 💡
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {resources.map((resource, index) => (
            <div
              key={index}
              style={{
                padding: 'var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--secondary-50) 100%)',
                border: '1px solid var(--primary-200)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div style={{
                fontSize: '2.5rem',
                marginBottom: 'var(--space-3)',
              }}>
                {resource.icon}
              </div>
              <p style={{
                fontWeight: '700',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-1)',
              }}>
                {resource.title}
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
              }}>
                {resource.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
