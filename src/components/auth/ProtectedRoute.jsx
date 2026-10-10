import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute() {
  const { user, employee, loading } = useAuth()
  const location = useLocation()

  // 1. While authentication state is bootstrapping, render an ODW-consistent loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-odw-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-odw-primary border-t-transparent" />
          <p className="text-xs font-medium text-odw-text-muted">Authenticating...</p>
        </div>
      </div>
    )
  }

  // 2. If unauthenticated, redirect to /login and preserve requested path in location.state
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // 3. RBAC route protection: Members cannot access /payments
  const role = employee?.system_role?.toLowerCase() || 'member'
  if (role === 'member' && location.pathname.startsWith('/payments')) {
    return <Navigate to="/dashboard" replace />
  }

  // 4. Authenticated session exists: render protected route hierarchy
  return <Outlet />
}
