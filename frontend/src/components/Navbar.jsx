import { memo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

const Navbar = memo(() => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // ✅ Obtener el nombre para mostrar (nombre > email)
  const displayName = user?.name || user?.email || 'Usuario'

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/projects">
            <h2>🌍 PhotoSite360</h2>
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/projects" className="nav-link active">
            📁 Mis Proyectos
          </Link>
        </div>

        <div className="nav-user">
          {/* ✅ CAMBIAR: Mostrar nombre en lugar de email */}
          <span className="user-name">👤 {displayName}</span>
          <button onClick={handleLogout} className="logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  )
})

Navbar.displayName = 'Navbar'

export default Navbar