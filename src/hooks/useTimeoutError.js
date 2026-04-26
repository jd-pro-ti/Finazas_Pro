import { useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

export const useTimeoutError = (timeoutMs = 10000) => {
  const [isTimedOut, setIsTimedOut] = useState(false)
  const [error, setError] = useState(null)
  const timeoutRef = useRef(null)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const startTimeout = useCallback((customMessage = 'Lo sentimos, no podemos obtener los datos en este momento.') => {
    clearTimer()
    setIsTimedOut(false)

    timeoutRef.current = window.setTimeout(() => {
      setIsTimedOut(true)
      toast.error(customMessage, {
        duration: 5000,
        icon: '⏰',
        style: {
          background: '#FF4444',
          color: '#fff',
          fontWeight: 'bold'
        }
      })
    }, timeoutMs)

    return () => clearTimer()
  }, [timeoutMs, clearTimer])

  const resetTimeout = useCallback(() => {
    clearTimer()
    setIsTimedOut(false)
    setError(null)
  }, [clearTimer])

  const handleError = useCallback((err, customMessage) => {
    setError(err)
    clearTimer()
    toast.error(customMessage || 'Error al procesar la solicitud', {
      duration: 4000,
      icon: '❌'
    })
  }, [clearTimer])

  return {
    isTimedOut,
    error,
    startTimeout,
    resetTimeout,
    handleError,
    clearTimeout: clearTimer
  }
}
