import { useState } from 'react'
import { useApi } from '../../context/ApiContext'
import { FiRefreshCw, FiAlertCircle } from 'react-icons/fi'

const CurrencyRates = () => {
  const { exchangeRates, getExchangeRates, apiStatus, loading } = useApi()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await getExchangeRates('USD', false)
    setRefreshing(false)
  }

  const currencies = [
    { code: 'EUR', name: 'Euro', color: 'blue' },
    { code: 'GBP', name: 'Libra', color: 'green' },
    { code: 'JPY', name: 'Yen', color: 'purple' },
    { code: 'CAD', name: 'Dolar Canadiense', color: 'orange' },
    { code: 'CHF', name: 'Franco Suizo', color: 'pink' },
    { code: 'CNY', name: 'Yuan', color: 'indigo' },
  ]

  const getColorClass = (color) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      pink: 'from-pink-500 to-pink-600',
      indigo: 'from-indigo-500 to-indigo-600',
    }
    return colors[color] || 'from-gray-500 to-gray-600'
  }

  if (!exchangeRates && loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
            <div className="bg-gray-300 h-20"></div>
            <div className="p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {apiStatus.usingMockExchangeRates && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiAlertCircle className="w-4 h-4 text-yellow-500" />
            <p className="text-yellow-700 text-sm">
              Usando datos de demostracion. Las tasas de cambio reales no estan disponibles.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-yellow-600 hover:text-yellow-700 text-sm flex items-center"
          >
            <FiRefreshCw className={`w-3 h-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Reintentar
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Tasas de cambio (USD base)
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {exchangeRates ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currencies.map((currency) => (
            <div
              key={currency.code}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className={`bg-gradient-to-r ${getColorClass(currency.color)} p-3`}>
                <div className="flex justify-between items-center text-white">
                  <span className="font-semibold text-sm">{currency.name}</span>
                  <span className="text-xl font-bold">{currency.code}</span>
                </div>
              </div>
              <div className="p-3 text-center">
                <p className="text-2xl font-bold text-gray-800">
                  {exchangeRates[currency.code]?.toFixed(4) || 'N/A'}
                </p>
                <p className="text-xs text-gray-500">USD</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay datos de tasas de cambio disponibles</p>
        </div>
      )}
    </div>
  )
}

export default CurrencyRates
