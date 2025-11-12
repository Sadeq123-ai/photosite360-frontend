import { memo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = memo(({ children }) => {
  const { user, loading } = useAuth()

  console.log('🛡️ ProtectedRoute - Estado:', { 
    tieneUsuario: !!user, 
    cargando: loading,
    rutaActual: window.location.pathname 
  })

  // Mientras verifica autenticación
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <div>🔄 Verificando autenticación...</div>
        </div>
      </div>
    )
  }

  // Si NO hay usuario, redirigir a login
  if (!user) {
    console.log('🔐 ProtectedRoute: Redirigiendo a login')
    return <Navigate to="/login" replace />
  }

  // Si hay usuario, mostrar el contenido
  console.log('✅ ProtectedRoute: Usuario autenticado, mostrando contenido')
  return children
})

ProtectedRoute.displayName = 'ProtectedRoute'

export default ProtectedRoute