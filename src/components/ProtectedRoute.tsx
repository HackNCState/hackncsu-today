import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // TODO: Replace with actual Firebase auth check
  // Example when ready:
  // const { user, loading } = useAuth()
  // if (loading) return <div>Loading...</div>
  // if (!user) return <Navigate to="/login" replace />
  
  // PLACEHOLDER: Currently allows all access
  const isAuthenticated = true // Change to false to test redirect

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
