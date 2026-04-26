import { Link } from 'react-router-dom'
import { FiTrendingUp, FiShield, FiZap } from 'react-icons/fi'

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-400 rounded-full filter blur-3xl opacity-20"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Controla tus{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              Finanzas
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
            La plataforma inteligente para gestionar inversiones, seguir mercados y tomar decisiones financieras informadas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/registro"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Comenzar Gratis
              <FiZap className="ml-2" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-white">
              <FiTrendingUp className="w-5 h-5" />
              <span>Datos en tiempo real</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white">
              <FiShield className="w-5 h-5" />
              <span>Seguridad garantizada</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-white">
              <FiZap className="w-5 h-5" />
              <span>Interfaz intuitiva</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection