import { Link } from 'react-router-dom'
import { FiHome, FiAlertTriangle } from 'react-icons/fi'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="text-center animate-fade-in">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="text-9xl font-bold text-gray-200">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiAlertTriangle className="w-20 h-20 text-primary-500" />
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ¡Página no encontrada!
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-md">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiHome className="mr-2" />
            Ir al Inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Volver Atrás
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>¿Necesitas ayuda? <Link to="/" className="text-primary-600 hover:underline">Contacta con soporte</Link></p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage