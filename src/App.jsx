import { Routes, Route } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import PublicPhotoView from './pages/PublicPhotoView'
import ProjectPhotoView from './pages/ProjectPhotoView'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { loading } = useAuth()

  // Mientras carga la autenticación, mostrar loading
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
        <div>🔄 Cargando PhotoSite360...</div>
      </div>
    )
  }

  return (
    <Routes>
      {/* 🎯 RUTAS PÚBLICAS - ABSOLUTAMENTE SIN AUTENTICACIÓN */}
      {/* IMPORTANTE: /view/:photoId DEBE estar antes que las rutas protegidas */}
      <Route path="/view/:photoId" element={<PublicPhotoView />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* 🔒 RUTAS PROTEGIDAS - REQUIEREN AUTENTICACIÓN */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/projects" element={
        <ProtectedRoute>
          <Projects />
        </ProtectedRoute>
      } />
      
      <Route path="/projects/:id" element={
        <ProtectedRoute>
          <ProjectDetail />
        </ProtectedRoute>
      } />
      
      <Route path="/projects/:id/view/:photoId" element={
        <ProtectedRoute>
          <ProjectPhotoView />
        </ProtectedRoute>
      } />
      
      {/* 🏠 RUTA RAÍZ - Redirige al dashboard SOLO para la raíz */}
      <Route path="/" element={<Dashboard />} />
      
      {/* ❌ PARA CUALQUIER OTRA RUTA NO ENCONTRADA */}
      <Route path="*" element={
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          background: '#0f172a',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>404</h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>Página no encontrada</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Volver al Inicio
          </button>
        </div>
      } />
    </Routes>
  )
}

export default App