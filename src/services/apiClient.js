const FRANKFURTER_REMOTE_URL = 'https://api.frankfurter.dev'
const TWELVE_DATA_REMOTE_URL = 'https://api.twelvedata.com'

const normalizeFrankfurterBaseUrl = (rawBaseUrl) => {
  if (!rawBaseUrl) return FRANKFURTER_REMOTE_URL

  const trimmed = rawBaseUrl.replace(/\/+$/, '')

  if (trimmed.includes('api.frankfurter.app')) {
    return FRANKFURTER_REMOTE_URL
  }

  return trimmed
}

const getFrankfurterBaseUrl = () => {
  if (import.meta.env.DEV) return '/api/frankfurter'
  return normalizeFrankfurterBaseUrl(import.meta.env.VITE_FRANKFURTER_API_URL)
}

const getTwelveDataBaseUrl = () => {
  if (import.meta.env.DEV) return '/api/twelvedata'
  return TWELVE_DATA_REMOTE_URL
}

export const API_CLIENT = {
  frankfurter: {
    baseURL: getFrankfurterBaseUrl(),
    remoteURL: FRANKFURTER_REMOTE_URL,
    endpoints: {
      latest: '/v2/rates',
      historical: '/v2/rates',
      currencies: '/v2/currencies'
    }
  },
  twelveData: {
    baseURL: getTwelveDataBaseUrl(),
    remoteURL: TWELVE_DATA_REMOTE_URL,
    apiKey: import.meta.env.VITE_TWELVE_DATA_API_KEY,
    endpoints: {
      quote: '/quote',
      price: '/price',
      timeSeries: '/time_series',
      search: '/search'
    }
  },
  global: {
    timeout: 15000,
    retryDelay: 1000
  },
  mockData: {
    exchangeRates: {
      EUR: 0.92,
      GBP: 0.79,
      JPY: 148.5,
      CAD: 1.36,
      CHF: 0.88,
      CNY: 7.19,
      AUD: 1.52,
      NZD: 1.65,
      SEK: 10.45,
      NOK: 10.82,
      MXN: 17.15,
      BRL: 5.02
    },
    stocks: {
      AAPL: { symbol: 'AAPL', name: 'Apple Inc.', price: 175.5, change: '+2.35', change_percent: '+1.36%' },
      GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.8, change: '+1.20', change_percent: '+0.85%' },
      MSFT: { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.92, change: '+3.45', change_percent: '+0.92%' },
      AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 145.3, change: '-0.75', change_percent: '-0.51%' },
      TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', price: 238.45, change: '+5.20', change_percent: '+2.23%' }
    },
    portfolio: {
      balance: 12500.5,
      invested: 10000,
      returns: 2500.5,
      percentageReturn: 25.01
    }
  }
}

export const API_ENDPOINTS = {
  getExchangeRates: (base = 'USD') =>
    `${API_CLIENT.frankfurter.baseURL}${API_CLIENT.frankfurter.endpoints.latest}?base=${base}`,

  getHistoricalRate: (date, base = 'USD') =>
    `${API_CLIENT.frankfurter.baseURL}${API_CLIENT.frankfurter.endpoints.historical}?date=${date}&base=${base}`,

  getCurrencies: () =>
    `${API_CLIENT.frankfurter.baseURL}${API_CLIENT.frankfurter.endpoints.currencies}`,

  getStockQuote: (symbol) =>
    `${API_CLIENT.twelveData.baseURL}${API_CLIENT.twelveData.endpoints.quote}?symbol=${symbol}&apikey=${API_CLIENT.twelveData.apiKey}`,

  getStockPrice: (symbol) =>
    `${API_CLIENT.twelveData.baseURL}${API_CLIENT.twelveData.endpoints.price}?symbol=${symbol}&apikey=${API_CLIENT.twelveData.apiKey}`,

  getTimeSeries: (symbol, interval = '1day') =>
    `${API_CLIENT.twelveData.baseURL}${API_CLIENT.twelveData.endpoints.timeSeries}?symbol=${symbol}&interval=${interval}&apikey=${API_CLIENT.twelveData.apiKey}`,

  searchSymbol: (query) =>
    `${API_CLIENT.twelveData.baseURL}${API_CLIENT.twelveData.endpoints.search}?symbol=${query}&apikey=${API_CLIENT.twelveData.apiKey}`
}

export const hasTwelveDataKey = () => Boolean(
  API_CLIENT.twelveData.apiKey && API_CLIENT.twelveData.apiKey !== 'tu_api_key_aqui'
)

export const createMockStock = (symbol) => {
  return API_CLIENT.mockData.stocks[symbol.toUpperCase()] || {
    symbol,
    name: symbol,
    price: 100.0,
    change: '0.00',
    change_percent: '0.00%'
  }
}

export const isValidFrankfurterRates = (data) => {
  if (Array.isArray(data)) {
    return data.length > 0 && data.every(item => item?.quote && item?.rate !== undefined)
  }

  return Boolean(data && typeof data === 'object' && data.rates && Object.keys(data.rates).length > 0)
}

export const isValidTwelveDataResponse = (data) => {
  if (!data || typeof data !== 'object') return false
  if (data.status === 'error' || data.code) return false
  return Boolean(data.price)
}

export const normalizeFrankfurterRates = (data) => {
  if (Array.isArray(data)) {
    return Object.fromEntries(
      data
        .filter(item => item?.quote && item?.rate !== undefined)
        .map(item => [item.quote, Number(item.rate)])
    )
  }

  return data?.rates || {}
}

export const fetchJsonWithRetry = async (url, options = {}, retries = 0, timeoutMs = API_CLIENT.global.timeout) => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })

    window.clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    window.clearTimeout(timeoutId)

    if (retries > 0) {
      await new Promise(resolve => window.setTimeout(resolve, API_CLIENT.global.retryDelay))
      return fetchJsonWithRetry(url, options, retries - 1, timeoutMs)
    }

    throw error
  }
}

export const apiClient = {
  mockData: API_CLIENT.mockData,

  async checkApisStatus() {
    const status = {
      frankfurter: false,
      twelveData: false,
      hasTwelveDataKey: hasTwelveDataKey(),
      twelveDataError: null
    }

    try {
      const frankfurterData = await fetchJsonWithRetry(API_ENDPOINTS.getExchangeRates(), {}, 0, 4000)
      status.frankfurter = isValidFrankfurterRates(frankfurterData)
    } catch {
      status.frankfurter = false
    }

    if (status.hasTwelveDataKey) {
      try {
        const twelveData = await fetchJsonWithRetry(API_ENDPOINTS.getStockPrice('AAPL'), {}, 0, 4000)
        status.twelveData = isValidTwelveDataResponse(twelveData)
        if (!status.twelveData && twelveData?.message) {
          status.twelveDataError = twelveData.message
        }
      } catch (error) {
        status.twelveData = false
        status.twelveDataError = error.message
      }
    }

    return {
      ...status,
      usingMockExchangeRates: !status.frankfurter,
      usingMockStocks: !status.hasTwelveDataKey || !status.twelveData,
      usingMock: !status.frankfurter || !status.hasTwelveDataKey || !status.twelveData
    }
  },

  async getExchangeRates(base = 'USD') {
    const data = await fetchJsonWithRetry(API_ENDPOINTS.getExchangeRates(base), {}, 0, 5000)
    if (!isValidFrankfurterRates(data)) {
      throw new Error('Frankfurter returned invalid rates')
    }
    return normalizeFrankfurterRates(data)
  },

  async getStockQuote(symbol) {
    const data = await fetchJsonWithRetry(API_ENDPOINTS.getStockQuote(symbol), {}, 0, 5000)
    if (!isValidTwelveDataResponse(data)) {
      throw new Error('Twelve Data returned invalid quote')
    }
    return data
  },

  async getMultipleQuotes(symbols) {
    return await Promise.all(symbols.map(symbol => this.getStockQuote(symbol)))
  }
}
