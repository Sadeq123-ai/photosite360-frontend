import { Routes, Route, Navigate } from 'react-router-dom'
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
      <Route path="/view/:photoId" element={<PublicPhotoView />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* 🔒 RUTAS PROTEGIDAS - REQUIEREN LOGIN */}
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
      
      {/* 🚀 RUTAS POR DEFECTO */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* ❌ Capturar todas las demás rutas */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App