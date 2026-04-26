// Sistema de logs para seguridad
const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
}

class Logger {
  constructor() {
    this.logs = []
    this.maxLogs = 1000
  }

  formatMessage(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  }

  async saveLog(log) {
    this.logs.unshift(log)
    if (this.logs.length > this.maxLogs) {
      this.logs.pop()
    }

    // En producción, enviar logs a un servidor
    if (import.meta.env.PROD) {
      try {
        await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(log)
        })
      } catch (error) {
        console.error('Error saving log:', error)
      }
    }

    // Mostrar en consola según nivel
    if (log.level === LOG_LEVELS.ERROR) {
      console.error(`[${log.timestamp}] ${log.level}: ${log.message}`, log.data)
    } else if (log.level === LOG_LEVELS.WARN) {
      console.warn(`[${log.timestamp}] ${log.level}: ${log.message}`, log.data)
    } else {
      console.log(`[${log.timestamp}] ${log.level}: ${log.message}`, log.data)
    }
  }

  info(message, data = {}) {
    const log = this.formatMessage(LOG_LEVELS.INFO, message, data)
    this.saveLog(log)
  }

  warn(message, data = {}) {
    const log = this.formatMessage(LOG_LEVELS.WARN, message, data)
    this.saveLog(log)
  }

  error(message, data = {}) {
    const log = this.formatMessage(LOG_LEVELS.ERROR, message, data)
    this.saveLog(log)
  }

  debug(message, data = {}) {
    if (import.meta.env.DEV) {
      const log = this.formatMessage(LOG_LEVELS.DEBUG, message, data)
      this.saveLog(log)
    }
  }

  getLogs() {
    return this.logs
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2)
  }
}

export const logger = new Logger()