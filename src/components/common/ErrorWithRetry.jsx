import { FiAlertTriangle, FiRefreshCw, FiDatabase } from 'react-icons/fi'

const ErrorWithRetry = ({ 
  message, 
  onRetry, 
  onUseMockData,
  isLoading = false,
  showMockOption = true 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
      <div className="bg-red-50 rounded-full p-4 mb-4">
        <FiAlertTriangle className="w-12 h-12 text-red-500" />
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        ⚠️ No se pudieron cargar los datos
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md">
        {message || "Lo sentimos, no podemos obtener los datos en este momento. Esto puede deberse a que las APIs están en mantenimiento o hay problemas de conexión."}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRetry}
          disabled={isLoading}
          className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Reintentar</span>
        </button>
        
        {showMockOption && onUseMockData && (
          <button
            onClick={onUseMockData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FiDatabase className="w-4 h-4" />
            <span>Usar datos de prueba</span>
          </button>
        )}
      </div>
      
      <p className="text-xs text-gray-400 mt-6">
        💡 Sugerencia: Puedes usar "Datos de prueba" para continuar probando la aplicación
      </p>
    </div>
  )
}

export default ErrorWithRetry