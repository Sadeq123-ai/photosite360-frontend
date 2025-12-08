import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Camera, Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import './Auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // ✅ Validaciones mejoradas
    if (!formData.full_name.trim() || !formData.username.trim() || !formData.email.trim() || !formData.password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    
    try {
      // ✅ Asegurar que los datos son strings
      await register({
        full_name: String(formData.full_name).trim(),
        username: String(formData.username).trim(),
        email: String(formData.email).trim(),
        password: formData.password
      })
      // ✅ La redirección se maneja en AuthContext, no aquí
    } catch (error) {
      console.error('Registration failed:', error)
      // El error ya se muestra en AuthContext
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Camera className="auth-icon" size={48} />
          <h1>Crear Cuenta</h1>
          <p>Únete a PhotoSite360</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="full_name">
              <User size={18} />
              Nombre completo
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              className="input"
              value={formData.full_name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">
              <User size={18} />
              Nombre de usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="input"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="juanperez"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="tu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <Lock size={18} />
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Confirma tu contraseña"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="auth-link">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register