import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../../context/ApiContext'
import { useAuth } from '../../hooks/useAuth'
import { getUserDashboardData } from '../../services/supabaseClient'
import { FiTrendingUp, FiDollarSign, FiPieChart, FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'

const UserPanel = () => {
  const {
    stocks,
    exchangeRates,
    apiStatus,
    refreshAllData,
    mockData
  } = useApi()
  const { user, userProfile, reloadProfile } = useAuth()

  const [portfolio, setPortfolio] = useState(mockData.portfolio)
  const [transactions, setTransactions] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return

    setLoadingProfile(true)
    try {
      const { profile, transactions: recentTransactions } = await getUserDashboardData(user.id)

      if (profile) {
        setPortfolio({
          balance: Number(profile.balance ?? mockData.portfolio.balance),
          invested: Number(profile.invested ?? mockData.portfolio.invested),
          returns: Number(profile.returns ?? mockData.portfolio.returns),
          percentageReturn: Number(profile.percentage_return ?? mockData.portfolio.percentageReturn)
        })
      }

      setTransactions(recentTransactions)
    } finally {
      setLoadingProfile(false)
    }
  }, [mockData.portfolio.balance, mockData.portfolio.invested, mockData.portfolio.percentageReturn, mockData.portfolio.returns, user?.id])

  useEffect(() => {
    const init = async () => {
      await loadDashboardData()
    }

    init()
  }, [loadDashboardData])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      refreshAllData(),
      reloadProfile(),
      loadDashboardData()
    ])
    setRefreshing(false)
  }

  const statsCards = [
    {
      title: 'Balance Total',
      value: `$${portfolio.balance.toLocaleString()}`,
      icon: <FiDollarSign className="w-6 h-6" />,
      color: 'bg-green-500'
    },
    {
      title: 'Invertido',
      value: `$${portfolio.invested.toLocaleString()}`,
      icon: <FiTrendingUp className="w-6 h-6" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Retorno',
      value: `$${portfolio.returns.toLocaleString()}`,
      icon: <FiPieChart className="w-6 h-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Rendimiento',
      value: `${portfolio.percentageReturn >= 0 ? '+' : ''}${portfolio.percentageReturn}%`,
      icon: <FiClock className="w-6 h-6" />,
      color: 'bg-orange-500'
    }
  ]

  const symbols = ['AAPL', 'GOOGL', 'MSFT']
  const userStocks = symbols.map(s => stocks[s]).filter(Boolean)
  const hasAnyFallback = apiStatus.usingMockExchangeRates || apiStatus.usingMockStocks

  return (
    <div className="space-y-8">
      {hasAnyFallback && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiAlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <div>
              <p className="text-yellow-700 font-medium">Modo parcial de demostracion</p>
              <p className="text-yellow-600 text-sm">
                Algunas APIs financieras no estan disponibles. Tus datos de Supabase siguen siendo reales.
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Reintentar</span>
          </button>
        </div>
      )}

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
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-600 text-sm mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Mi Perfil Financiero</h2>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            <FiRefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {loadingProfile ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Cargando datos reales desde Supabase...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-semibold text-gray-900">{userProfile?.full_name || user?.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold text-gray-900">{userProfile?.email || user?.email}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-semibold text-gray-900 capitalize">{userProfile?.status || 'active'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Ultima actividad</p>
              <p className="font-semibold text-gray-900">
                {userProfile?.last_active ? new Date(userProfile.last_active).toLocaleString() : 'Sin registro'}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mi Portafolio de Mercado</h2>
        {userStocks.length > 0 ? (
          <div className="space-y-3">
            {userStocks.map((stock) => (
              <div key={stock.symbol} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{stock.symbol}</p>
                  <p className="text-sm text-gray-600">{stock.name || 'Accion'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${parseFloat(stock.price).toFixed(2)}</p>
                  <p className={`text-sm ${parseFloat(stock.change) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {parseFloat(stock.change) > 0 ? '+' : ''}{stock.change} ({stock.change_percent})
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Cargando cotizaciones del mercado...</p>
          </div>
        )}
      </div>

      {transactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Ultimas Transacciones</h2>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900 uppercase">{transaction.symbol}</p>
                  <p className="text-sm text-gray-600 capitalize">{transaction.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${Number(transaction.price || 0).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">
                    {Number(transaction.amount || 0).toLocaleString()} - {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'Sin fecha'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {exchangeRates && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tasas de Cambio</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(exchangeRates).slice(0, 4).map(([currency, rate]) => (
              <div key={currency} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold text-gray-900">{currency}</p>
                <p className="text-lg font-bold text-primary-600">{Number(rate).toFixed(4)}</p>
                <p className="text-xs text-gray-500">USD</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-400 border-t pt-4">
        {apiStatus.usingMock ? (
          <p>Mercado en modo mixto. Tu perfil y permisos vienen de Supabase.</p>
        ) : (
          <p>Conectado a APIs reales y a datos de Supabase.</p>
        )}
      </div>
    </div>
  )
}

export default UserPanel
