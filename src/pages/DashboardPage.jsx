import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import AdminPanel from '../components/dashboard/AdminPanel'
import SuperAdminPanel from '../components/dashboard/SuperAdminPanel'
import UserPanel from '../components/dashboard/UserPanel'

const roleStyles = {
  user: 'bg-blue-100 text-blue-700',
  admin: 'bg-red-100 text-red-700',
  superadmin: 'bg-amber-100 text-amber-700'
}

const roleLabels = {
  user: 'Usuario',
  admin: 'Administrador',
  superadmin: 'Superadministrador'
}

const DashboardPage = () => {
  const { user, userRole, userStatus } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (userStatus === 'suspended') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Cuenta suspendida</h1>
            <p className="text-gray-600 mt-2">
              Tu acceso fue suspendido por un superadministrador. Contacta al equipo para reactivar tu cuenta.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const roleClass = roleStyles[userRole] || roleStyles.user
  const roleLabel = roleLabels[userRole] || roleLabels.user

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Hola de nuevo, {user.user_metadata?.full_name || user.email?.split('@')[0]}. Este es tu resumen financiero.
          </p>
          {userRole && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${roleClass}`}>
              Rol: {roleLabel}
            </span>
          )}
        </div>

        {userRole === 'superadmin'
          ? <SuperAdminPanel />
          : userRole === 'admin'
            ? <AdminPanel />
            : <UserPanel />}
      </div>
    </div>
  )
}

export default DashboardPage
