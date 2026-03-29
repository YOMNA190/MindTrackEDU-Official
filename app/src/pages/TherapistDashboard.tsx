import React, { useState, useEffect } from 'react';

const PATIENTS = [
  { id: '1', name: 'Sara Ahmed',    risk: 'HIGH',     lastSeen: '2026-03-27', score: 68, mood: 'Anxious',   avatar: 'SA' },
  { id: '2', name: 'Omar Hassan',   risk: 'MODERATE', lastSeen: '2026-03-25', score: 55, mood: 'Stable',    avatar: 'OH' },
  { id: '3', name: 'Nour Khalil',   risk: 'SEVERE',   lastSeen: '2026-03-24', score: 82, mood: 'Distressed', avatar: 'NK' },
  { id: '4', name: 'Yara Mansour',  risk: 'LOW',      lastSeen: '2026-03-20', score: 30, mood: 'Good',      avatar: 'YM' },
  { id: '5', name: 'Ali Suleiman',  risk: 'MODERATE', lastSeen: '2026-03-18', score: 51, mood: 'Improving', avatar: 'AS' },
];

const RISK_COLORS: Record<string, string> = {
  LOW:      '#4ade80',
  MODERATE: '#fbbf24',
  HIGH:     '#f87171',
  SEVERE:   '#f472b6',
};

export const TherapistDashboard: React.FC = () => {
  const [lang, setLang]           = useState<'en' | 'ar'>('en');
  const [mounted, setMounted]     = useState(false);
  const [selected, setSelected]   = useState<string | null>(null);
  const isRTL = lang === 'ar';

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const selectedPatient = PATIENTS.find(p => p.id === selected);

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{
      minHeight: '100vh',
      background: '#050a0f',
      fontFamily: "'DM Sans','IBM Plex Sans Arabic',system-ui,sans-serif",
      color: '#f1f5f9',
      display: 'flex',
      overflow: 'hidden',
    }}>
      {/* Fixed background */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
        <div style={{ position:'absolute', top:'5%', right:'10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(96,165,250,0.04) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute', bottom:'15%', left:'5%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(244,114,182,0.04) 0%,transparent 70%)' }} />
      </div>

      {/* Sidebar */}
      <aside style={{
        position: 'relative', zIndex:1,
        width: 260, minHeight:'100vh',
        background: 'rgba(10,18,28,0.9)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '1.5rem 1rem',
        flexShrink: 0,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateX(-16px)',
        transition: 'all 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'2rem', padding:'0 0.5rem' }}>
          <span style={{ fontSize:24 }}>🧠</span>
          <span style={{ fontWeight:700, fontSize:'1.1rem', letterSpacing:'-0.02em' }}>
            MindTrack<span style={{ color:'#60a5fa' }}>EDU</span>
          </span>
        </div>

        {/* Nav items */}
        {[
          { icon:'◈', label:'Dashboard',  labelAr:'لوحة التحكم',  active: true },
          { icon:'⬡', label:'Patients',   labelAr:'المرضى',       active: false },
          { icon:'⬢', label:'Sessions',   labelAr:'الجلسات',      active: false },
          { icon:'◆', label:'Reports',    labelAr:'التقارير',     active: false },
          { icon:'○', label:'Settings',   labelAr:'الإعدادات',    active: false },
        ].map(item => (
          <div key={item.label} style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'10px 14px', borderRadius:12, marginBottom:4,
            background: item.active ? 'rgba(96,165,250,0.1)' : 'transparent',
            color: item.active ? '#60a5fa' : '#475569',
            cursor:'pointer', fontSize:'0.9rem', fontWeight: item.active ? 600 : 400,
            transition: 'all 0.2s',
            border: item.active ? '1px solid rgba(96,165,250,0.2)' : '1px solid transparent',
          }}>
            <span style={{ fontSize:16 }}>{item.icon}</span>
            {lang === 'en' ? item.label : item.labelAr}
          </div>
        ))}

        {/* Lang toggle at bottom */}
        <div style={{ position:'absolute', bottom:'1.5rem', left:'1rem', right:'1rem' }}>
          <button onClick={() => setLang(l => l==='en'?'ar':'en')} style={{
            width:'100%', padding:'8px', borderRadius:10,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
            color:'#64748b', cursor:'pointer', fontSize:13,
          }}>
            {lang === 'en' ? '🌐 عربي' : '🌐 English'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex:1, padding:'2rem', position:'relative', zIndex:1, overflow:'auto' }}>
        {/* Header */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          marginBottom:'2rem',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'none' : 'translateY(-10px)',
          transition: 'all 0.4s ease 0.1s',
        }}>
          <div>
            <h1 style={{ margin:0, fontSize:'1.5rem', fontWeight:800, letterSpacing:'-0.02em' }}>
              {lang==='en' ? 'Patient Overview' : 'نظرة عامة على المرضى'}
            </h1>
            <p style={{ margin:'4px 0 0', color:'#475569', fontSize:'0.85rem' }}>
              {lang==='en' ? 'Dr. Hana Youssef — 5 active patients' : 'د. هناء يوسف — 5 مرضى نشطون'}
            </p>
          </div>
          <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#60a5fa,#a78bfa)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#050a0f', fontSize:14 }}>H</div>
        </div>

        {/* Stats row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1rem', marginBottom:'2rem' }}>
          {[
            { label:'Total Patients', labelAr:'إجمالي المرضى',   value:'5',  color:'#60a5fa' },
            { label:'High Risk',      labelAr:'خطر مرتفع',       value:'2',  color:'#f87171' },
            { label:'Sessions Today', labelAr:'جلسات اليوم',     value:'3',  color:'#4ade80' },
            { label:'Avg PHQ-9',      labelAr:'متوسط PHQ-9',     value:'57', color:'#fbbf24' },
          ].map((s, i) => (
            <div key={s.label} style={{
              background:'rgba(10,18,28,0.8)',
              border:`1px solid ${s.color}20`,
              borderRadius:18, padding:'1.2rem',
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'none' : 'translateY(12px)',
              transition: `all 0.4s ease ${0.15 + i*0.07}s`,
            }}>
              <p style={{ margin:0, fontSize:'0.72rem', color:'#475569', fontWeight:600, letterSpacing:1 }}>
                {lang==='en' ? s.label.toUpperCase() : s.labelAr}
              </p>
              <p style={{ margin:'6px 0 0', fontSize:'2rem', fontWeight:800, color:s.color, letterSpacing:'-0.03em' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Patient list + detail */}
        <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap:'1rem' }}>
          {/* Patient list */}
          <div style={{
            background:'rgba(10,18,28,0.8)',
            border:'1px solid rgba(255,255,255,0.06)',
            borderRadius:20, padding:'1.5rem',
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.4s ease 0.3s',
          }}>
            <h3 style={{ margin:'0 0 1rem', fontSize:'0.82rem', color:'#64748b', fontWeight:600, letterSpacing:1 }}>
              {lang==='en' ? 'PATIENT LIST' : 'قائمة المرضى'}
            </h3>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {PATIENTS.map(p => (
                <div key={p.id}
                  onClick={() => setSelected(sel => sel===p.id ? null : p.id)}
                  style={{
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'12px 16px', borderRadius:14, cursor:'pointer',
                    background: selected===p.id ? 'rgba(96,165,250,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selected===p.id ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.2s',
                  }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{
                      width:36, height:36, borderRadius:'50%',
                      background:`linear-gradient(135deg,${RISK_COLORS[p.risk]}40,${RISK_COLORS[p.risk]}20)`,
                      border:`1px solid ${RISK_COLORS[p.risk]}40`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:700, color:RISK_COLORS[p.risk],
                    }}>{p.avatar}</div>
                    <div>
                      <p style={{ margin:0, fontSize:'0.88rem', fontWeight:600, color:'#cbd5e1' }}>{p.name}</p>
                      <p style={{ margin:'2px 0 0', fontSize:'0.74rem', color:'#475569' }}>{p.lastSeen}</p>
                    </div>
                  </div>
                  <span style={{
                    padding:'4px 12px', borderRadius:20, fontSize:'0.72rem', fontWeight:700,
                    background:`${RISK_COLORS[p.risk]}15`, color:RISK_COLORS[p.risk],
                  }}>{p.risk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Patient detail panel */}
          {selectedPatient && (
            <div style={{
              background:'rgba(10,18,28,0.8)',
              border:'1px solid rgba(255,255,255,0.06)',
              borderRadius:20, padding:'1.5rem',
              animation: 'fadeIn 0.3s ease',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                <div>
                  <h3 style={{ margin:0, fontSize:'1.1rem', fontWeight:700, color:'#f1f5f9' }}>{selectedPatient.name}</h3>
                  <p style={{ margin:'4px 0 0', color:'#475569', fontSize:'0.82rem' }}>
                    {lang==='en' ? 'Last session:' : 'آخر جلسة:'} {selectedPatient.lastSeen}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} style={{
                  background:'transparent', border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:8, color:'#475569', padding:'4px 10px', cursor:'pointer', fontSize:12,
                }}>✕</button>
              </div>

              {/* Score display */}
              <div style={{
                textAlign:'center', padding:'2rem 0',
                background:'rgba(255,255,255,0.02)', borderRadius:16, marginBottom:'1rem',
              }}>
                <div style={{
                  display:'inline-flex', alignItems:'center', justifyContent:'center',
                  width:90, height:90, borderRadius:'50%',
                  background:`radial-gradient(circle,${RISK_COLORS[selectedPatient.risk]}20,transparent)`,
                  border:`2px solid ${RISK_COLORS[selectedPatient.risk]}50`,
                  fontSize:'1.8rem', fontWeight:800,
                  color:RISK_COLORS[selectedPatient.risk],
                }}>
                  {selectedPatient.score}
                </div>
                <p style={{ margin:'12px 0 4px', fontWeight:600, color:RISK_COLORS[selectedPatient.risk] }}>
                  {selectedPatient.risk} RISK
                </p>
                <p style={{ margin:0, color:'#475569', fontSize:'0.82rem' }}>{selectedPatient.mood}</p>
              </div>

              <button style={{
                width:'100%', padding:'12px', borderRadius:12,
                background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.3)',
                color:'#60a5fa', fontWeight:600, cursor:'pointer', fontSize:'0.88rem',
                transition:'all 0.2s',
              }}>
                {lang==='en' ? '📅 Schedule Session' : '📅 جدولة جلسة'}
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
};

export default TherapistDashboard;
