import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiBarChart2, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout, isAdmin, isSuperAdmin, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      // Mostrar loading
      toast.loading('Cerrando sesión...', { id: 'logout' })
      
      const result = await logout()
      
      if (result.success) {
        toast.success('Sesión cerrada correctamente', { id: 'logout' })
        // Redirigir al inicio
        navigate('/')
        // Cerrar menú móvil si está abierto
        setIsOpen(false)
      } else {
        toast.error('Error al cerrar sesión', { id: 'logout' })
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  // No mostrar el navbar mientras carga la autenticación
  if (loading && !user) {
    return (
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">$</span>
              </div>
              <span className="font-bold text-xl text-gray-800">FinanzasPro</span>
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  const navLinks = [
    { to: '/', label: 'Inicio', icon: <FiHome />, public: true },
    { to: '/dashboard', label: 'Dashboard', icon: <FiBarChart2 />, private: true },
    { to: '/admin', label: 'Admin', icon: <FiShield />, admin: true },
    { to: '/superadmin', label: 'Superadmin', icon: <FiShield />, superadmin: true },
  ]

  const visibleLinks = navLinks.filter(link => {
    if (link.public) return true
    if (link.private && !user) return false
    if (link.admin && (!user || !isAdmin())) return false
    if (link.superadmin && (!user || !isSuperAdmin())) return false
    return true
  })

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">$</span>
              </div>
              <span className="font-bold text-xl text-gray-800">FinanzasPro</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {visibleLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-1 transition-colors ${
                  location.pathname === link.to 
                    ? 'text-primary-600 font-semibold' 
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiUser className="text-primary-600" />
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="text-gray-700 font-medium max-w-[150px] truncate">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </p>
                    {isSuperAdmin() ? (
                      <span className="text-xs text-amber-600 font-semibold">Superadmin</span>
                    ) : isAdmin() ? (
                      <span className="text-xs text-red-600 font-semibold">Admin</span>
                    ) : null}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <FiLogOut />
                  <span>Salir</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FiUser />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600">
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden animate-slide-up pb-4">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {visibleLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === link.to 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="px-3 py-2 border-t border-gray-100 mt-2 pt-2">
                    <div className="flex items-center space-x-2 mb-2">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <FiUser className="text-primary-600" />
                        </div>
                      )}
                      <span className="text-sm text-gray-700 truncate">
                        {user.email}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 text-red-600 w-full rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut />
                      <span>Salir</span>
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-3 py-2 text-primary-600"
                  onClick={() => setIsOpen(false)}
                >
                  <FiUser />
                  <span>Iniciar Sesión</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
