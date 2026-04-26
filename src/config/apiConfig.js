const normalizeFrankfurterBaseUrl = (rawBaseUrl) => {
  if (!rawBaseUrl) return 'https://api.frankfurter.dev'

  const trimmed = rawBaseUrl.replace(/\/+$/, '')

  if (trimmed.includes('api.frankfurter.app')) {
    return 'https://api.frankfurter.dev'
  }

  return trimmed
}

export const API_CONFIG = {
  frankfurter: {
    baseURL: normalizeFrankfurterBaseUrl(import.meta.env.VITE_FRANKFURTER_API_URL),
    endpoints: {
      latest: '/v2/rates',
      historical: '/v2/rates',
      currencies: '/v2/currencies'
    },
    timeout: 10000,
    retries: 2
  },

  twelveData: {
    baseURL: 'https://api.twelvedata.com',
    apiKey: import.meta.env.VITE_TWELVE_DATA_API_KEY,
    endpoints: {
      quote: '/quote',
      price: '/price',
      timeSeries: '/time_series',
      search: '/search',
      etf: '/etf',
      forex: '/forex'
    },
    timeout: 10000,
    retries: 2,
    rateLimit: {
      perMinute: 8,
      perDay: 800
    }
  },

  global: {
    timeout: 15000,
    retryDelay: 1000,
    useMockData: true,
    enableLogging: true
  }
}

export const ENDPOINTS = {
  getExchangeRates: (base = 'USD') =>
    `${API_CONFIG.frankfurter.endpoints.latest}?base=${base}`,

  getHistoricalRate: (date, base = 'USD') =>
    `${API_CONFIG.frankfurter.endpoints.historical}?date=${date}&base=${base}`,

  getCurrencies: API_CONFIG.frankfurter.endpoints.currencies,

  getStockQuote: (symbol) =>
    `${API_CONFIG.twelveData.endpoints.quote}?symbol=${symbol}&apikey=${API_CONFIG.twelveData.apiKey}`,

  getStockPrice: (symbol) =>
    `${API_CONFIG.twelveData.endpoints.price}?symbol=${symbol}&apikey=${API_CONFIG.twelveData.apiKey}`,

  getMultipleQuotes: (symbols) =>
    `${API_CONFIG.twelveData.endpoints.quote}?symbol=${symbols.join(',')}&apikey=${API_CONFIG.twelveData.apiKey}`,

  getTimeSeries: (symbol, interval = '1day') =>
    `${API_CONFIG.twelveData.endpoints.timeSeries}?symbol=${symbol}&interval=${interval}&apikey=${API_CONFIG.twelveData.apiKey}`,

  searchSymbol: (query) =>
    `${API_CONFIG.twelveData.endpoints.search}?symbol=${query}&apikey=${API_CONFIG.twelveData.apiKey}`
}

export const MOCK_DATA = {
  exchangeRates: {
    EUR: 0.92, GBP: 0.79, JPY: 148.5, CAD: 1.36, CHF: 0.88, CNY: 7.19,
    AUD: 1.52, NZD: 1.65, SEK: 10.45, NOK: 10.82, MXN: 17.15, BRL: 5.02
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
