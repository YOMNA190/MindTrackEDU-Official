import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

const Login              = lazy(() => import('./components/Login'));
const StudentDashboard   = lazy(() => import('./pages/StudentDashboard'));
const TherapistDashboard = lazy(() => import('./pages/TherapistDashboard'));

const Loader = () => (
  <div style={{
    minHeight: '100vh',
    background: '#050a0f',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{
      width: 40,
      height: 40,
      border: '3px solid rgba(74,222,128,0.2)',
      borderTopColor: '#4ade80',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
  </div>
);

function isAuthenticated(): boolean {
  return !!localStorage.getItem('mt_token');
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login"             element={<Login />} />
          <Route path="/student/dashboard"   element={<RequireAuth><StudentDashboard /></RequireAuth>} />
          <Route path="/therapist/dashboard" element={<RequireAuth><TherapistDashboard /></RequireAuth>} />
          <Route path="/"                  element={<Navigate to={isAuthenticated() ? '/student/dashboard' : '/login'} replace />} />
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
