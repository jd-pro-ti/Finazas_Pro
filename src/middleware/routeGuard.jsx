import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { logger } from '../services/logger'

export const RouteGuard = ({ children, requiredRole }) => {
  const { user, hasRole, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        logger.warn('Route access denied - not authenticated')
        navigate('/login')
      } else if (requiredRole && !hasRole(requiredRole)) {
        logger.warn('Route access denied - insufficient role', {
          userId: user.id,
          requiredRole,
          userRole: hasRole('admin') ? 'admin' : 'user'
        })
        navigate('/dashboard')
      }
    }
  }, [user, loading, requiredRole, hasRole, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return user && (!requiredRole || hasRole(requiredRole)) ? children : null
}
