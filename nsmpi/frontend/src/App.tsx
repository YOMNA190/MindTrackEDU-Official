import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import NotFound from './pages/NotFound';

// Student Pages
import { StudentDashboard } from './pages/student/Dashboard';
import { Screening } from './pages/student/Screening';
import { ScreeningResults } from './pages/student/ScreeningResults';
import { TherapyRequest } from './pages/student/TherapyRequest';
import { StudentChat } from './pages/student/StudentChat';

// Therapist Pages
import { TherapistDashboard } from './pages/therapist/Dashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/Dashboard';

// Components
import { useAuthStore } from './stores/authStore';
import { Loader2 } from 'lucide-react';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Loading Component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: ('student' | 'therapist' | 'admin')[];
}) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'therapist') {
      return <Navigate to="/therapist/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

// Role-based Dashboard Redirect
function DashboardRedirect() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'therapist':
      return <Navigate to="/therapist/dashboard" replace />;
    default:
      return <StudentDashboard />;
  }
}

// App Content Component
function AppContent() {
  const { fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<DashboardLayout />}>
            {/* Student Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/screening"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <Screening />
                </ProtectedRoute>
              }
            />
            <Route
              path="/screening/results"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <ScreeningResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapy"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <TherapyRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentChat />
                </ProtectedRoute>
              }
            />

            {/* Therapist Routes */}
            <Route
              path="/therapist/dashboard"
              element={
                <ProtectedRoute allowedRoles={['therapist']}>
                  <TherapistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapist/students"
              element={
                <ProtectedRoute allowedRoles={['therapist']}>
                  <div>Therapist Students Page (Coming Soon)</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapist/chat"
              element={
                <ProtectedRoute allowedRoles={['therapist']}>
                  <div>Therapist Chat Page (Coming Soon)</div>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>User Management Page (Coming Soon)</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>Audit Logs Page (Coming Soon)</div>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Main App Component
function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </I18nextProvider>
  );
}

export default App;
