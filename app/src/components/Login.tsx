import React, { useState, useEffect, useRef } from 'react';

type Role = 'student' | 'therapist' | 'admin';

interface LoginCredentials {
  role: Role;
  email: string;
  password: string;
}

interface LoginProps {
  onLogin?: (credentials: LoginCredentials) => Promise<void>;
  apiBase?: string;
}

const ROLES: { value: Role; labelEn: string; labelAr: string; icon: string; color: string }[] = [
  { value: 'student',   labelEn: 'Student',       labelAr: 'طالب',   icon: '⬡', color: '#4ade80' },
  { value: 'therapist', labelEn: 'Therapist',      labelAr: 'معالج',  icon: '⬢', color: '#60a5fa' },
  { value: 'admin',     labelEn: 'Administrator',  labelAr: 'مسؤول',  icon: '◈', color: '#f472b6' },
];

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export const Login: React.FC<LoginProps> = ({ onLogin, apiBase = API_BASE }) => {
  const [role, setRole]         = useState<Role>('student');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [lang, setLang]         = useState<'en' | 'ar'>('en');
  const [mounted, setMounted]   = useState(false);
  const canvasRef               = useRef<HTMLCanvasElement>(null);

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Neural particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
      });
    }

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(96,165,250,${(1 - dist / 120) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(96,165,250,0.4)';
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (onLogin) {
        await onLogin({ role, email, password });
      } else {
        const res = await fetch(`${apiBase}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, email, password }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message ?? `Error ${res.status}`);
        }

        const { token, user } = await res.json();
        localStorage.setItem('mt_token', token);
        localStorage.setItem('mt_user', JSON.stringify(user));
        window.location.href = `/${role}/dashboard`;
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const activeRole = ROLES.find(r => r.value === role)!;
  const isRTL      = lang === 'ar';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        background: '#050a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Neural canvas background */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      />

      {/* Radial glow behind card */}
      <div style={{
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${activeRole.color}18 0%, transparent 70%)`,
        transition: 'background 0.6s ease',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 460,
          margin: '1rem',
          background: 'rgba(10,18,28,0.85)',
          border: `1px solid ${activeRole.color}30`,
          borderRadius: 24,
          padding: '2.5rem',
          backdropFilter: 'blur(24px)',
          boxShadow: `0 0 60px ${activeRole.color}15, 0 24px 64px rgba(0,0,0,0.6)`,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease, border-color 0.4s, box-shadow 0.4s',
        }}
      >
        {/* Lang toggle */}
        <button
          onClick={() => setLang(l => l === 'en' ? 'ar' : 'en')}
          style={{
            position: 'absolute',
            top: 20,
            [isRTL ? 'left' : 'right']: 20,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: '#94a3b8',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          {lang === 'en' ? 'عربي' : 'EN'}
        </button>

        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${activeRole.color}30, ${activeRole.color}10)`,
            border: `1px solid ${activeRole.color}40`,
            marginBottom: 16,
            transition: 'all 0.4s',
            fontSize: 24,
          }}>
            🧠
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '1.6rem',
            fontWeight: 700,
            color: '#f1f5f9',
            letterSpacing: '-0.02em',
          }}>
            MindTrack<span style={{ color: activeRole.color }}>EDU</span>
          </h1>
          <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            {lang === 'en' ? 'Student Mental Health Platform' : 'منصة الصحة النفسية للطلاب'}
          </p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              style={{
                flex: 1,
                padding: '10px 6px',
                borderRadius: 12,
                border: `1px solid ${role === r.value ? r.color + '60' : 'rgba(255,255,255,0.06)'}`,
                background: role === r.value ? `${r.color}18` : 'transparent',
                color: role === r.value ? r.color : '#475569',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                transition: 'all 0.25s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              <span>{lang === 'en' ? r.labelEn : r.labelAr}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Email */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, letterSpacing: 0.5 }}>
              {lang === 'en' ? 'EMAIL ADDRESS' : 'البريد الإلكتروني'}
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={lang === 'en' ? 'you@university.edu' : 'you@university.edu'}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12,
                padding: '12px 16px',
                color: '#f1f5f9',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                direction: 'ltr',
              }}
              onFocus={e => (e.target.style.borderColor = activeRole.color + '80')}
              onBlur={e  => (e.target.style.borderColor = error ? '#f87171' : 'rgba(255,255,255,0.1)')}
            />
          </label>

          {/* Password */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500, letterSpacing: 0.5 }}>
              {lang === 'en' ? 'PASSWORD' : 'كلمة المرور'}
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 12,
                padding: '12px 16px',
                color: '#f1f5f9',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                direction: 'ltr',
              }}
              onFocus={e => (e.target.style.borderColor = activeRole.color + '80')}
              onBlur={e  => (e.target.style.borderColor = error ? '#f87171' : 'rgba(255,255,255,0.1)')}
            />
          </label>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              color: '#fca5a5',
              fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: '14px',
              borderRadius: 12,
              border: 'none',
              background: loading
                ? 'rgba(255,255,255,0.05)'
                : `linear-gradient(135deg, ${activeRole.color}, ${activeRole.color}bb)`,
              color: loading ? '#475569' : '#050a0f',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s',
              letterSpacing: 0.5,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid #475569', borderTopColor: '#94a3b8', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                {lang === 'en' ? 'Signing in…' : 'جارٍ الدخول…'}
              </span>
            ) : (
              lang === 'en' ? 'Sign in' : 'تسجيل الدخول'
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.75rem', color: '#334155' }}>
          {lang === 'en'
            ? 'Protected by AES-256 encryption · HIPAA compliant'
            : 'محمي بتشفير AES-256 · متوافق مع HIPAA'}
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 30px #0a121c inset !important; -webkit-text-fill-color: #f1f5f9 !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default Login;
