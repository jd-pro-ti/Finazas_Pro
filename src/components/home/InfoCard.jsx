import { FiArrowRight } from 'react-icons/fi'

const InfoCard = ({ icon, title, description, stats, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-white rounded-full shadow-md">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
        {title}
      </h3>
      <p className="text-gray-600 text-center mb-4">
        {description}
      </p>
      <div className="text-center">
        <span className="inline-block px-4 py-2 bg-white/80 rounded-full text-sm font-semibold text-gray-700">
          {stats}
        </span>
      </div>
      <button className="mt-4 w-full flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">
        <span>Saber más</span>
        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}

export default InfoCard