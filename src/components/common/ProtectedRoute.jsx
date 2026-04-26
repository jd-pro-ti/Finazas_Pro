import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { logger } from '../../services/logger'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, hasRole, userStatus } = useAuth()
  const location = useLocation()

  if (loading && !user) {
    return <LoadingSpinner />
  }

  if (!user) {
    logger.warn('Access denied - not authenticated', { path: location.pathname })
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (userStatus !== 'active') {
    logger.warn('Access denied - inactive or suspended account', { userId: user.id, status: userStatus, path: location.pathname })
    return <Navigate to="/" replace />
  }

  if (requiredRole && !hasRole(requiredRole)) {
    logger.warn('Access denied - insufficient role', { 
      userId: user.id, 
      requiredRole,
      path: location.pathname 
    })
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
