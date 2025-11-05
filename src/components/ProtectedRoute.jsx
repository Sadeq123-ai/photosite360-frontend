import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Mientras carga, mostrar loading
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px',
        fontWeight: '500'
      }}>
        <div>🔄 Verificando autenticación...</div>
      </div>
    )
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si hay usuario, mostrar el contenido protegido
  return children
}

export default ProtectedRoute