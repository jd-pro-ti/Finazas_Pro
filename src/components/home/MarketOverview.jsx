import { useEffect } from 'react'
import { useApi } from '../../context/ApiContext'
import { FiTrendingUp, FiTrendingDown, FiAlertCircle } from 'react-icons/fi'

const SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA']

const MarketOverview = () => {
  const { stocks, getMultipleQuotes, apiStatus, loading } = useApi()

  useEffect(() => {
    const loadStocks = async () => {
      const missingStocks = SYMBOLS.filter(s => !stocks[s])
      if (missingStocks.length > 0) {
        await getMultipleQuotes(missingStocks)
      }
    }
    loadStocks()
  }, [getMultipleQuotes, stocks])

  const stockList = SYMBOLS.map(s => stocks[s]).filter(Boolean)

  if (stockList.length === 0 && loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {apiStatus.usingMockStocks && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-center justify-center">
          <FiAlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
          <p className="text-yellow-700 text-xs">
            Datos de mercado en modo demostracion
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stockList.map((stock) => {
          const change = parseFloat(stock.change)
          const isPositive = change > 0

          return (
            <div
              key={stock.symbol}
              className="bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{stock.symbol}</p>
                  <p className="text-xs text-gray-500 truncate max-w-[80px]">{stock.name || stock.symbol}</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-lg font-bold text-gray-900">
                  ${parseFloat(stock.price).toFixed(2)}
                </p>
                <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <FiTrendingUp className="mr-0.5 w-3 h-3" /> : <FiTrendingDown className="mr-0.5 w-3 h-3" />}
                  <span>{isPositive ? '+' : ''}{stock.change} ({stock.change_percent}%)</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MarketOverview
