import { useCallback, useEffect, useState } from 'react'
import { FiShield, FiList, FiRefreshCw, FiUserCheck } from 'react-icons/fi'
import { getSuperAdminDashboardData } from '../../services/supabaseClient'
import AdminPanel from './AdminPanel'

const SuperAdminPanel = () => {
  const [meta, setMeta] = useState({
    stats: {
      totalUsers: 0,
      activeUsers: 0,
      totalAdmins: 0,
      suspendedUsers: 0,
      totalTransactions: 0,
      systemLogsCount: 0
    },
    systemLogs: []
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadSuperAdminData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSuperAdminDashboardData()
      setMeta(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      await loadSuperAdminData()
    }

    init()
  }, [loadSuperAdminData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadSuperAdminData()
    setRefreshing(false)
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-amber-700 font-semibold">
              <FiShield className="w-5 h-5" />
              Superadministracion
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">Panel de Superadmin</h2>
            <p className="text-gray-600 mt-1">
              Aqui puedes supervisar administradores, usuarios y actividad del sistema.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <FiUserCheck className="w-6 h-6 text-amber-600" />
            <h3 className="font-bold text-gray-900">Cuentas privilegiadas</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{meta.stats.totalAdmins}</p>
          <p className="text-sm text-gray-500 mt-1">Admins y superadmins activos</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <FiList className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-gray-900">Logs del sistema</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{meta.stats.systemLogsCount}</p>
          <p className="text-sm text-gray-500 mt-1">Eventos registrados</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-3">
            <FiShield className="w-6 h-6 text-red-600" />
            <h3 className="font-bold text-gray-900">Suspendidos</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{meta.stats.suspendedUsers}</p>
          <p className="text-sm text-gray-500 mt-1">Cuentas temporalmente bloqueadas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Ultimos logs del sistema</h3>
        {loading ? (
          <div className="text-center py-6 text-gray-500">Cargando logs...</div>
        ) : meta.systemLogs.length > 0 ? (
          <div className="space-y-3">
            {meta.systemLogs.map((log) => (
              <div key={log.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-900">{log.message || 'Evento del sistema'}</p>
                    <p className="text-sm text-gray-500">{log.level || 'info'} - {log.user_id || 'sin usuario'}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {log.created_at ? new Date(log.created_at).toLocaleString() : 'Sin fecha'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">No hay logs disponibles.</div>
        )}
      </div>

      <AdminPanel />
    </div>
  )
}

export default SuperAdminPanel
