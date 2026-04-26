import { useCallback, useEffect, useMemo, useState } from 'react'
import { FiUsers, FiActivity, FiShield, FiBarChart2, FiRefreshCw, FiEdit2, FiPauseCircle, FiPlayCircle, FiAlertCircle, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { getAdminDashboardData, updateProfile, updateUserRole, updateUserSuspension, deleteProfile } from '../../services/supabaseClient'

const emptyForm = { full_name: '', role: 'user' }

const AdminPanel = () => {
  const { user, isSuperAdmin } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalAdmins: 0,
      suspendedUsers: 0,
    totalTransactions: 0
  })
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const canManageAdmins = isSuperAdmin()

  const roleOptions = useMemo(() => {
    return canManageAdmins
      ? ['user', 'admin', 'superadmin']
      : ['user', 'admin']
  }, [canManageAdmins])

  const loadAdminData = useCallback(async () => {
    setLoading(true)
    try {
      const { profiles, stats: nextStats } = await getAdminDashboardData()
      setUsers(profiles)
      setStats(nextStats)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await loadAdminData()
    }

    init()
  }, [loadAdminData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAdminData()
    setRefreshing(false)
  }

  const statsCards = [
    {
      title: 'Usuarios Totales',
      value: stats.totalUsers,
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Usuarios Activos',
      value: stats.activeUsers,
      icon: <FiActivity className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Admins y Superadmins',
      value: stats.totalAdmins,
      icon: <FiShield className="w-6 h-6" />,
      color: 'bg-amber-500'
    },
    {
      title: 'Transacciones',
      value: stats.totalTransactions.toLocaleString(),
      icon: <FiBarChart2 className="w-6 h-6" />,
      color: 'bg-purple-500'
    }
  ]

  const updateLocalUser = (updatedUser) => {
    setUsers(prev => prev.map(profile => profile.id === updatedUser.id ? updatedUser : profile))
  }

  const handleEditUser = (profile) => {
    setSelectedUser(profile)
    setEditForm({
      full_name: profile.full_name || '',
      role: profile.role || 'user'
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return

    try {
      const updatedProfile = await updateProfile(selectedUser.id, {
        full_name: editForm.full_name
      })

      if (canManageAdmins && editForm.role !== selectedUser.role) {
        await updateUserRole(selectedUser.id, editForm.role)
      }

      updateLocalUser({
        ...updatedProfile,
        role: canManageAdmins ? editForm.role : selectedUser.role
      })

      setShowEditModal(false)
      toast.success('Usuario actualizado correctamente')
      await loadAdminData()
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar el usuario')
    }
  }

  const handleChangeUserRole = async (profile, newRole) => {
    if (!canManageAdmins) {
      toast.error('Solo un superadministrador puede cambiar roles')
      return
    }

    if (profile.id === user?.id && newRole !== 'superadmin') {
      toast.error('No puedes quitarte el rol de superadministrador desde aqui')
      return
    }

    try {
      const updatedProfile = await updateUserRole(profile.id, newRole)
      updateLocalUser(updatedProfile)
      toast.success(`Rol actualizado a ${newRole}`)
      await loadAdminData()
    } catch (error) {
      toast.error(error.message || 'No se pudo actualizar el rol')
    }
  }

  const handleSuspendUser = async (profile) => {
    if (!canManageAdmins) {
      toast.error('Solo un superadministrador puede suspender usuarios')
      return
    }

    if (profile.id === user?.id) {
      toast.error('No puedes suspender tu propia cuenta')
      return
    }

    try {
      const updatedProfile = await updateUserSuspension(profile.id, true)
      updateLocalUser(updatedProfile)
      toast.success('Usuario suspendido')
      await loadAdminData()
    } catch (error) {
      toast.error(error.message || 'No se pudo suspender el usuario')
    }
  }

  const handleReactivateUser = async (profile) => {
    if (!canManageAdmins) {
      toast.error('Solo un superadministrador puede reactivar usuarios')
      return
    }

    try {
      const updatedProfile = await updateUserSuspension(profile.id, false)
      updateLocalUser(updatedProfile)
      toast.success('Usuario reactivado')
      await loadAdminData()
    } catch (error) {
      toast.error(error.message || 'No se pudo reactivar el usuario')
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await deleteProfile(userToDelete.id)
      setUsers(prev => prev.filter(profile => profile.id !== userToDelete.id))
      // Recalcular estadísticas
      const newUsers = users.filter(profile => profile.id !== userToDelete.id)
      const newStats = {
        totalUsers: newUsers.length,
        activeUsers: newUsers.filter(profile => (profile.status || 'active') === 'active').length,
        totalAdmins: newUsers.filter(profile => ['admin', 'superadmin'].includes(profile.role)).length,
        suspendedUsers: newUsers.filter(profile => profile.status === 'inactive').length,
        totalTransactions: stats.totalTransactions // No cambia
      }
      setStats(newStats)
      setShowDeleteModal(false)
      setUserToDelete(null)
      toast.success('Usuario eliminado correctamente')
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el usuario')
    }
  }

  const handleOpenDeleteModal = (profile) => {
    if (!canManageAdmins) {
      toast.error('Solo un superadministrador puede eliminar usuarios')
      return
    }

    if (profile.id === user?.id) {
      toast.error('No puedes eliminar tu propia cuenta')
      return
    }

    if (profile.role === 'superadmin') {
      toast.error('No puedes eliminar a otro superadministrador')
      return
    }

    setUserToDelete(profile)
    setShowDeleteModal(true)
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FiAlertCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
          <div>
            <p className="text-gray-900 font-medium">Panel conectado a Supabase</p>
            <p className="text-gray-600 text-sm">
              {canManageAdmins
                ? 'Como superadministrador puedes promover, degradar, suspender y eliminar cuentas.'
                : 'Como administrador puedes consultar usuarios y editar datos basicos.'}
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-primary-600 hover:text-primary-700 text-sm flex items-center"
        >
          <FiRefreshCw className={`inline mr-1 ${refreshing ? 'animate-spin' : ''}`} /> Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</h3>
            <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-bold text-gray-900">Gestion de Usuarios</h2>
          <div className="text-sm text-gray-500">
            Superadmins: {stats.totalAdmins} - Suspendidos: {stats.suspendedUsers}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Cargando usuarios reales desde Supabase...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((profile) => {
                  const isCurrentUser = profile.id === user?.id
                  const isProtectedSuperAdmin = profile.role === 'superadmin' && !isCurrentUser

                  return (
                    <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                            {profile.full_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {profile.full_name || 'Sin nombre'}
                            </div>
                            {isCurrentUser && (
                              <div className="text-xs text-primary-600">Tu cuenta</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{profile.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={profile.role || 'user'}
                          onChange={(e) => handleChangeUserRole(profile, e.target.value)}
                          disabled={!canManageAdmins || isProtectedSuperAdmin}
                          className={`text-xs rounded-full px-3 py-1 font-semibold cursor-pointer disabled:opacity-60 ${
                            profile.role === 'superadmin'
                              ? 'bg-amber-100 text-amber-700'
                              : profile.role === 'admin'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {roleOptions.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs rounded-full px-3 py-1 font-semibold ${
                          (profile.status || 'active') === 'inactive'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {profile.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Sin fecha'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(profile)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          {canManageAdmins && !isProtectedSuperAdmin && (
                            <>
                              {(profile.status || 'active') === 'active' && (
                                <button
                                  onClick={() => handleSuspendUser(profile)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Suspender usuario"
                                >
                                  <FiPauseCircle className="w-4 h-4" />
                                </button>
                              )}
                              {(profile.status || 'active') === 'inactive' && (
                                <button
                                  onClick={() => handleReactivateUser(profile)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Reactivar usuario"
                                >
                                  <FiPlayCircle className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                          {canManageAdmins && !isCurrentUser && profile.role !== 'superadmin' && (
                            <button
                              onClick={() => handleOpenDeleteModal(profile)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Editar Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nombre del usuario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={selectedUser?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>
              {canManageAdmins && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  >
                    {roleOptions.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-red-600">Eliminar Usuario</h3>
            <div className="space-y-4">
              <p className="text-gray-700">
                ¿Estás seguro de que quieres eliminar al usuario <strong>{userToDelete.full_name || userToDelete.email}</strong>?
              </p>
              <p className="text-sm text-gray-500">
                Esta acción no se puede deshacer. Se eliminará permanentemente la cuenta del usuario.
              </p>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setUserToDelete(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Eliminar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
