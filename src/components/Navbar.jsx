import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Camera } from 'lucide-react'
import './Navbar.css'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <Camera size={24} />
          <span>PhotoSite360</span>
        </Link>
        
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">Dashboard</Link>
          <Link to="/projects" className="navbar-link">Proyectos</Link>
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.full_name}</span>
          <button onClick={logout} className="btn-logout">
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar