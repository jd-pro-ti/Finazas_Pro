import { useEffect, useState } from 'react'
import HeroSection from '../components/home/HeroSection'
import InfoCard from '../components/home/InfoCard'
import CurrencyRates from '../components/home/CurrencyRates'
import MarketOverview from '../components/home/MarketOverview'
import { FiTrendingUp, FiShield, FiUsers } from 'react-icons/fi'

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const sections = [
    {
      icon: <FiTrendingUp className="w-10 h-10 text-primary-600" />,
      title: "Análisis de Mercado",
      description: "Datos en tiempo real de mercados financieros globales.",
      stats: "+50 Mercados",
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-50"
    },
    {
      icon: <FiShield className="w-10 h-10 text-green-600" />,
      title: "Seguridad Financiera",
      description: "Protección con encriptación de nivel bancario.",
      stats: "100% Seguro",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50"
    },
    {
      icon: <FiUsers className="w-10 h-10 text-purple-600" />,
      title: "Asesoría Personalizada",
      description: "Recomendaciones basadas en IA para tus inversiones.",
      stats: "24/7 Soporte",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50"
    }
  ]

  return (
    <div className="min-h-screen pt-16">
      <HeroSection />
      
      {/* Secciones informativas */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            ¿Por qué <span className="text-primary-600">FinanzasPro</span>?
          </h2>
          <p className="mt-2 text-gray-600">
            La plataforma todo-en-uno para gestionar tus finanzas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section, index) => (
            <div 
              key={index}
              className={`transform transition-all duration-500 hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <InfoCard {...section} />
            </div>
          ))}
        </div>
      </div>

      {/* Tasas de cambio - con manejo de error interno */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            💱 Tasas de Cambio
          </h2>
          <CurrencyRates />
        </div>
      </div>

      {/* Mercado - con manejo de error interno */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            📈 Panorama del Mercado
          </h2>
          <MarketOverview />
        </div>
      </div>
    </div>
  )
}

export default HomePage