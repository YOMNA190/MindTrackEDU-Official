import React, { useState, useEffect } from 'react';

interface Metric {
  label: string;
  labelAr: string;
  value: number;
  max: number;
  color: string;
  icon: string;
}

const METRICS: Metric[] = [
  { label: 'Mood Score',     labelAr: 'درجة المزاج',    value: 72, max: 100, color: '#4ade80', icon: '◈' },
  { label: 'Anxiety Level',  labelAr: 'مستوى القلق',    value: 34, max: 100, color: '#60a5fa', icon: '⬡' },
  { label: 'Focus Index',    labelAr: 'مؤشر التركيز',   value: 61, max: 100, color: '#f59e0b', icon: '⬢' },
  { label: 'Sleep Quality',  labelAr: 'جودة النوم',     value: 80, max: 100, color: '#a78bfa', icon: '◆' },
];

const RECENT_SESSIONS = [
  { date: '2026-03-27', therapist: 'Dr. Hana Youssef',  score: 68, mood: 'Stable' },
  { date: '2026-03-20', therapist: 'Dr. Hana Youssef',  score: 55, mood: 'Anxious' },
  { date: '2026-03-13', therapist: 'Dr. Khalid Mansour', score: 72, mood: 'Improving' },
];

const TIPS = [
  { en: 'Take 5 deep breaths before your next class.',         ar: 'خذ 5 أنفاس عميقة قبل محاضرتك القادمة.' },
  { en: 'A 20-minute walk today can shift your mood.',         ar: 'نزهة 20 دقيقة اليوم قادرة على تحسين مزاجك.' },
  { en: 'Drinking water reduces fatigue and improves focus.', ar: 'شرب الماء يقلل التعب ويحسن التركيز.' },
];

export const StudentDashboard: React.FC = () => {
  const [lang, setLang]       = useState<'en' | 'ar'>('en');
  const [mounted, setMounted] = useState(false);
  const [tipIdx, setTipIdx]   = useState(0);
  const isRTL = lang === 'ar';

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const card = (content: React.ReactNode, extra?: React.CSSProperties) => (
    <div style={{
      background: 'rgba(10,18,28,0.8)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      padding: '1.5rem',
      backdropFilter: 'blur(12px)',
      ...extra,
    }}>
      {content}
    </div>
  );

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: '#050a0f',
        fontFamily: "'DM Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif",
        color: '#f1f5f9',
        padding: '2rem',
      }}
    >
      {/* Background mesh */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '2rem',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(-10px)',
          transition: 'all 0.4s ease',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>🧠</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                MindTrack<span style={{ color: '#4ade80' }}>EDU</span>
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: '#475569', fontSize: '0.85rem' }}>
              {lang === 'en' ? 'Good morning, Sarah 👋' : 'صباح الخير، سارة 👋'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', padding: '5px 12px', cursor: 'pointer', fontSize: 12 }}
            >
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4ade80,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#050a0f', fontSize: 14 }}>S</div>
          </div>
        </div>

        {/* Tip banner */}
        <div style={{
          padding: '14px 20px',
          borderRadius: 14,
          background: 'rgba(74,222,128,0.06)',
          border: '1px solid rgba(74,222,128,0.2)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.5s ease 0.1s',
        }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <p style={{ margin: 0, color: '#86efac', fontSize: '0.9rem', transition: 'opacity 0.4s' }}>
            {lang === 'en' ? TIPS[tipIdx].en : TIPS[tipIdx].ar}
          </p>
        </div>

        {/* Metrics grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              style={{
                background: 'rgba(10,18,28,0.8)',
                border: `1px solid ${m.color}25`,
                borderRadius: 20,
                padding: '1.4rem',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'none' : 'translateY(12px)',
                transition: `opacity 0.4s ease ${0.1 + i * 0.08}s, transform 0.4s ease ${0.1 + i * 0.08}s`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#475569', fontWeight: 600, letterSpacing: 0.5 }}>
                    {lang === 'en' ? m.label.toUpperCase() : m.labelAr}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '2rem', fontWeight: 800, color: m.color, letterSpacing: '-0.03em' }}>
                    {m.value}
                  </p>
                </div>
                <span style={{ fontSize: 22, color: m.color, opacity: 0.6 }}>{m.icon}</span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${m.value}%`,
                  borderRadius: 4,
                  background: m.color,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Sessions */}
          {card(
            <>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 600, letterSpacing: 1 }}>
                {lang === 'en' ? 'RECENT SESSIONS' : 'الجلسات الأخيرة'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {RECENT_SESSIONS.map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1' }}>{s.therapist}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#475569' }}>{s.date}</p>
                    </div>
                    <div style={{ textAlign: isRTL ? 'left' : 'right' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '3px 10px',
                        borderRadius: 20,
                        background: s.score >= 70 ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.12)',
                        color: s.score >= 70 ? '#4ade80' : '#fbbf24',
                        fontWeight: 600,
                      }}>
                        {s.mood}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Next appointment */}
          {card(
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 600, letterSpacing: 1 }}>
                {lang === 'en' ? 'NEXT APPOINTMENT' : 'الموعد القادم'}
              </h3>
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(96,165,250,0.15), rgba(96,165,250,0.05))',
                  border: '2px solid rgba(96,165,250,0.3)',
                  marginBottom: 12,
                }}>
                  <span style={{ fontSize: 28 }}>📅</span>
                </div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#60a5fa' }}>Apr 3, 2026</p>
                <p style={{ margin: '4px 0', color: '#94a3b8', fontSize: '0.85rem' }}>10:00 AM — Dr. Hana Youssef</p>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.8rem' }}>
                  {lang === 'en' ? 'Video Session · 50 min' : 'جلسة فيديو · 50 دقيقة'}
                </p>
              </div>
              <button style={{
                marginTop: 'auto',
                padding: '10px',
                borderRadius: 12,
                border: '1px solid rgba(96,165,250,0.3)',
                background: 'rgba(96,165,250,0.08)',
                color: '#60a5fa',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}>
                {lang === 'en' ? 'Join Session' : 'الانضمام للجلسة'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
