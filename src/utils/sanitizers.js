// Sanitización de inputs para prevenir XSS
export const sanitizers = {
  // Escapar HTML
  escapeHtml: (str) => {
    if (!str) return ''
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  },

  // Limpiar string (remover caracteres especiales)
  cleanString: (str) => {
    if (!str) return ''
    return str.trim().replace(/[<>{}[\]\\]/g, '')
  },

  // Sanitizar email
  sanitizeEmail: (email) => {
    if (!email) return ''
    return email.trim().toLowerCase()
  },

  // Sanitizar número
  sanitizeNumber: (num) => {
    const parsed = parseFloat(num)
    return isNaN(parsed) ? 0 : parsed
  },

  // Sanitizar monto financiero
  sanitizeAmount: (amount) => {
    let cleaned = String(amount).replace(/[^0-9.-]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : Math.abs(parsed)
  },

  // Remover scripts
  removeScripts: (str) => {
    if (!str) return ''
    return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  }
}
