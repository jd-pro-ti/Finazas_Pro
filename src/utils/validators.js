// Validaciones frontend con regex y sanitización
export const validators = {
  // Validar email
  email: (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!email) return 'El email es requerido'
    if (!regex.test(email)) return 'Email inválido'
    return null
  },

  // Validar contraseña (mínimo 8 caracteres, una mayúscula, una minúscula, un número)
  password: (password) => {
    if (!password) return 'La contraseña es requerida'
    if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
    if (!/[A-Z]/.test(password)) return 'Debe contener al menos una mayúscula'
    if (!/[a-z]/.test(password)) return 'Debe contener al menos una minúscula'
    if (!/[0-9]/.test(password)) return 'Debe contener al menos un número'
    return null
  },

  // Validar nombre
  name: (name) => {
    if (!name) return 'El nombre es requerido'
    if (name.length < 2) return 'El nombre debe tener al menos 2 caracteres'
    if (name.length > 50) return 'El nombre no puede exceder 50 caracteres'
    if (!/^[a-zA-ZáéíóúñÑ\s]+$/.test(name)) return 'El nombre solo puede contener letras'
    return null
  },

  // Validar monto financiero
  amount: (amount) => {
    if (amount === undefined || amount === null) return 'El monto es requerido'
    if (isNaN(amount)) return 'El monto debe ser un número'
    if (amount <= 0) return 'El monto debe ser mayor a 0'
    if (amount > 1000000000) return 'El monto excede el límite permitido'
    return null
  },

  // Validar que no sea campo vacío
  required: (value, fieldName = 'Campo') => {
    if (!value || value.trim() === '') return `${fieldName} es requerido`
    return null
  },

  // Validar número de teléfono
  phone: (phone) => {
    if (!phone) return null // Opcional
    const regex = /^[0-9+\-\s()]{8,15}$/
    if (!regex.test(phone)) return 'Teléfono inválido'
    return null
  }
}

// Función para validar un objeto completo
export const validateForm = (data, rules) => {
  const errors = {}
  
  for (const [field, validations] of Object.entries(rules)) {
    for (const validation of validations) {
      const error = validation(data[field])
      if (error) {
        errors[field] = error
        break
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}