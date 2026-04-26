import { FiClock, FiRefreshCw } from 'react-icons/fi'

const TimeoutError = ({ onRetry, message }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="bg-yellow-50 rounded-full p-4 mb-4">
        <FiClock className="w-12 h-12 text-yellow-500 animate-pulse" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        ⏰ Tiempo de espera agotado
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {message || "La solicitud está tardando más de lo esperado. Esto puede deberse a que los servidores de las APIs están ocupados o en mantenimiento."}
      </p>
      
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-auto"
        >
          <FiRefreshCw className="w-4 h-4" />
          <span>Reintentar ahora</span>
        </button>
        
        <p className="text-xs text-gray-400">
          💡 También puedes hacer clic en "Usar datos de prueba" en la pantalla de error
        </p>
      </div>
    </div>
  )
}

export default TimeoutError