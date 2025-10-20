import { useAuth } from '@/services/auth.service'
import { Navigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // TODO remove
  console.log("User is authenticated:", user);

  return <>{children}</>
}
