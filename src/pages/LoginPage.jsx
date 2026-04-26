import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTimeoutError } from '../hooks/useTimeoutError'
import { validators, validateForm } from '../utils/validators'
import { sanitizers } from '../utils/sanitizers'
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiAlertCircle } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false)

  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const { startTimeout, resetTimeout, clearTimeout: clearTimeoutFn } = useTimeoutError(10000)

  useEffect(() => {
    return () => clearTimeoutFn()
  }, [clearTimeoutFn])

  const validationRules = {
    email: [validators.required, validators.email],
    password: [validators.required]
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const nextValue = name === 'email' ? sanitizers.sanitizeEmail(value) : sanitizers.cleanString(value)

    setFormData(prev => ({
      ...prev,
      [name]: nextValue
    }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }

    if (showTimeoutMessage) {
      setShowTimeoutMessage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { isValid, errors: validationErrors } = validateForm(formData, validationRules)

    if (!isValid) {
      setErrors(validationErrors)
      toast.error('Por favor, corrige los errores en el formulario')
      return
    }

    setLoading(true)
    setShowTimeoutMessage(false)

    const timeoutCleanup = startTimeout(
      'Lo sentimos, el servidor no responde. Intenta nuevamente o contacta a soporte.'
    )

    try {
      const result = await login(formData.email, formData.password)
      resetTimeout()

      if (result.success) {
        toast.success('Bienvenido de vuelta')
        navigate(from, { replace: true })
      } else {
        toast.error(result.error || 'Error al iniciar sesion')
        setErrors({ submit: result.error || 'Error al iniciar sesion' })
      }
    } catch (error) {
      resetTimeout()
      console.error('Login error:', error)

      let errorMessage = 'Error de conexion. Verifica tu internet o intenta mas tarde.'

      if (error.message?.includes('timeout') || error.name === 'AbortError') {
        errorMessage = 'La conexion excedio el tiempo de espera.'
        setShowTimeoutMessage(true)
      }

      toast.error(errorMessage, { duration: 6000 })
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
      timeoutCleanup()
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setShowTimeoutMessage(false)

    const timeoutCleanup = startTimeout(
      'Google no esta respondiendo. Por favor, intenta con email y contrasena.'
    )

    try {
      const result = await loginWithGoogle()
      resetTimeout()

      if (result.success) {
        toast.success('Redirigiendo a Google...')
      } else {
        toast.error(result.error || 'Error al iniciar con Google')
      }
    } catch {
      resetTimeout()
      toast.error('Error al conectar con Google. Intenta con email y contrasena.')
    } finally {
      setLoading(false)
      timeoutCleanup()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl font-bold">$</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesion
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/registro" className="font-medium text-primary-600 hover:text-primary-500">
              Registrate aqui
            </Link>
          </p>
        </div>

        {showTimeoutMessage && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-center">
              <FiAlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-700">
                La conexion esta tardando mas de lo normal.
                <br />
                <span className="text-xs">Sugerencia: revisa tu conexion o intenta mas tarde.</span>
              </p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electronico
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contrasena
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <FiLogIn className="mr-2 h-5 w-5" />
                  Iniciar Sesion
                </>
              )}
            </button>
          </div>

          {loading && (
            <p className="text-center text-xs text-gray-500 animate-pulse">
              Si tarda mas de 10 segundos, recibiras un mensaje de timeout...
            </p>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continua con</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Google
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            Volver al inicio
          </Link>
        </div>

        <div className="text-center text-xs text-gray-400 border-t pt-4 mt-4">
          <p>Las APIs financieras pueden tardar en responder. Si ves un timeout, espera unos minutos y reintenta.</p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
