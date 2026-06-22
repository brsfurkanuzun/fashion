import { Navigate } from 'react-router-dom'
import { loadStoredUser, useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const hasSession = isAuthenticated || Boolean(loadStoredUser()?.id)

  if (!hasSession) {
    return <Navigate to="/" replace />
  }

  return children
}
