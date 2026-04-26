/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient, createMockStock } from '../services/apiClient'
import { logger } from '../services/logger'

const ApiContext = createContext(null)

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within ApiProvider')
  }
  return context
}

export const ApiProvider = ({ children }) => {
  const [apiStatus, setApiStatus] = useState({
    frankfurter: false,
    twelveData: false,
    hasTwelveDataKey: false,
    usingMockExchangeRates: true,
    usingMockStocks: true,
    usingMock: true
  })
  const [exchangeRates, setExchangeRates] = useState(apiClient.mockData.exchangeRates)
  const [stocks, setStocks] = useState(apiClient.mockData.stocks)
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const checkApisStatus = async () => {
    const nextStatus = await apiClient.checkApisStatus()
    setApiStatus(nextStatus)
    return nextStatus
  }

  const getExchangeRates = async (base = 'USD', forceMock = false, statusOverride = apiStatus) => {
    if (forceMock || statusOverride.usingMockExchangeRates) {
      setExchangeRates(apiClient.mockData.exchangeRates)
      return apiClient.mockData.exchangeRates
    }

    try {
      const rates = await apiClient.getExchangeRates(base)
      setExchangeRates(rates)
      return rates
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      setExchangeRates(apiClient.mockData.exchangeRates)
      return apiClient.mockData.exchangeRates
    }
  }

  const getStockQuote = async (symbol, forceMock = false, statusOverride = apiStatus) => {
    if (forceMock || statusOverride.usingMockStocks || !statusOverride.hasTwelveDataKey) {
      const mockData = createMockStock(symbol)
      setStocks(prev => ({ ...prev, [symbol]: mockData }))
      return mockData
    }

    try {
      const quote = await apiClient.getStockQuote(symbol)
      setStocks(prev => ({ ...prev, [symbol]: quote }))
      return quote
    } catch (error) {
      console.error(`Error fetching stock quote for ${symbol}:`, error)
      const mockData = createMockStock(symbol)
      setStocks(prev => ({ ...prev, [symbol]: mockData }))
      return mockData
    }
  }

  const getMultipleQuotes = async (symbols, forceMock = false, statusOverride = apiStatus) => {
    if (forceMock || statusOverride.usingMockStocks || !statusOverride.hasTwelveDataKey) {
      const mockQuotes = symbols.map(symbol => createMockStock(symbol))
      setStocks(prev => ({
        ...prev,
        ...Object.fromEntries(mockQuotes.map(quote => [quote.symbol, quote]))
      }))
      return mockQuotes
    }

    try {
      const quotes = await apiClient.getMultipleQuotes(symbols)
      setStocks(prev => ({
        ...prev,
        ...Object.fromEntries(quotes.map(quote => [quote.symbol, quote]))
      }))
      return quotes
    } catch (error) {
      console.error('Error fetching multiple quotes:', error)
      const mockQuotes = symbols.map(symbol => createMockStock(symbol))
      setStocks(prev => ({
        ...prev,
        ...Object.fromEntries(mockQuotes.map(quote => [quote.symbol, quote]))
      }))
      return mockQuotes
    }
  }

  const forceMockMode = (enable) => {
    setApiStatus(prev => ({
      ...prev,
      usingMockExchangeRates: enable,
      usingMockStocks: enable,
      usingMock: enable
    }))
    logger.info(`Mock mode ${enable ? 'enabled' : 'disabled'}`, { source: 'ApiContext' })
  }

  const refreshAllData = async () => {
    setLoading(true)
    try {
      const status = await checkApisStatus()
      await Promise.all([
        getExchangeRates('USD', false, status),
        getMultipleQuotes(['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'], false, status)
      ])
      setLastUpdate(new Date())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await refreshAllData()
    }

    init()

    const interval = window.setInterval(() => {
      refreshAllData()
    }, 300000)

    return () => window.clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = {
    apiStatus,
    exchangeRates,
    stocks,
    loading,
    lastUpdate,
    getExchangeRates,
    getStockQuote,
    getMultipleQuotes,
    forceMockMode,
    refreshAllData,
    checkApisStatus,
    mockData: apiClient.mockData
  }

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  )
}
