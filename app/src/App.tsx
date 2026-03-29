import { useState } from 'react'
import './App.css'
import './styles/design-system.css'
import PremiumLogin from './components/PremiumLogin'
import PremiumRegister from './components/PremiumRegister'
import StudentDashboard from './components/StudentDashboard'
import TherapistDashboard from './components/TherapistDashboard'
import AdminDashboard from './components/AdminDashboard'
import UserProfile from './components/UserProfile'

type Page = 'login' | 'register' | 'student-dashboard' | 'therapist-dashboard' | 'admin-dashboard' | 'profile'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login')
  const [userRole, setUserRole] = useState<'student' | 'therapist' | 'admin' | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Handle login
  const handleLogin = (role: 'student' | 'therapist' | 'admin') => {
    setUserRole(role)
    setIsAuthenticated(true)
    
    // Route based on role
    switch (role) {
      case 'student':
        setCurrentPage('student-dashboard')
        break
      case 'therapist':
        setCurrentPage('therapist-dashboard')
        break
      case 'admin':
        setCurrentPage('admin-dashboard')
        break
    }
  }

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
    setCurrentPage('login')
  }

  // Handle navigation
  const navigate = (page: Page) => {
    setCurrentPage(page)
  }

  // Render based on current page
  const renderPage = () => {
    if (!isAuthenticated) {
      if (currentPage === 'register') {
        return (
          <PremiumRegister
            onRegisterSuccess={() => {
              setCurrentPage('login')
            }}
            onLoginClick={() => setCurrentPage('login')}
          />
        )
      }
      return (
        <PremiumLogin
          onLoginSuccess={handleLogin}
          onRegisterClick={() => setCurrentPage('register')}
        />
      )
    }

    // Authenticated pages
    switch (currentPage) {
      case 'student-dashboard':
        return (
          <StudentDashboard
            onLogout={handleLogout}
            onNavigate={navigate}
            onProfileClick={() => setCurrentPage('profile')}
          />
        )
      case 'therapist-dashboard':
        return (
          <TherapistDashboard
            onLogout={handleLogout}
            onNavigate={navigate}
            onProfileClick={() => setCurrentPage('profile')}
          />
        )
      case 'admin-dashboard':
        return (
          <AdminDashboard
            onLogout={handleLogout}
            onNavigate={navigate}
            onProfileClick={() => setCurrentPage('profile')}
          />
        )
      case 'profile':
        return (
          <UserProfile
            userRole={userRole}
            onLogout={handleLogout}
            onBack={() => {
              if (userRole === 'student') setCurrentPage('student-dashboard')
              else if (userRole === 'therapist') setCurrentPage('therapist-dashboard')
              else if (userRole === 'admin') setCurrentPage('admin-dashboard')
            }}
          />
        )
      default:
        return (
          <PremiumLogin
            onLoginSuccess={handleLogin}
            onRegisterClick={() => setCurrentPage('register')}
          />
        )
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
    }}>
      {renderPage()}
    </div>
  )
}

export default App
