import { Link, useLocation } from 'react-router-dom'
import { FiHome } from 'react-icons/fi'

const Breadcrumbs = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  if (pathnames.length === 0) return null

  return (
    <div className="bg-gray-100 py-3 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center space-x-2 text-sm">
          <Link to="/" className="text-gray-600 hover:text-primary-600 flex items-center">
            <FiHome className="mr-1" />
            Inicio
          </Link>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
            const isLast = index === pathnames.length - 1
            
            return (
              <div key={name} className="flex items-center">
                <span className="text-gray-400 mx-2">/</span>
                {isLast ? (
                  <span className="text-gray-800 capitalize">
                    {name.replace('-', ' ')}
                  </span>
                ) : (
                  <Link to={routeTo} className="text-gray-600 hover:text-primary-600 capitalize">
                    {name.replace('-', ' ')}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

export default Breadcrumbs