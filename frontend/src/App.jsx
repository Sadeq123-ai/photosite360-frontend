import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'  // ✅ CORRECTO: lazy y Suspense vienen de 'react'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// ✅ COMPONENTES QUE SE CARGAN INMEDIATAMENTE (críticos)
import Login from './pages/Login'
import Register from './pages/Register'

// 🚀 LAZY LOADING - Componentes que se cargan solo cuando se necesitan
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const ImageGallery = lazy(() => import('./pages/ImageGallery'))  // ✅ NUEVO
const PublicPhotoView = lazy(() => import('./pages/PublicPhotoView'))
const ProjectPhotoView = lazy(() => import('./pages/ProjectPhotoView'))

// Componente de Loading mejorado
const PageLoader = () => (
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
      <div>⚡ Cargando...</div>
    </div>
  </div>
)

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <PageLoader />
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 🎯 RUTAS PÚBLICAS */}
        <Route path="/view/:photoId" element={<PublicPhotoView />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* 🔒 RUTAS PROTEGIDAS */}
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

        <Route path="/projects/:id" element={
  <ProtectedRoute>
    <ProjectDetail />
  </ProtectedRoute>
} />

{/* ✅ NUEVA RUTA: Galería de imágenes normales */}
<Route path="/projects/:id/gallery" element={
  <ProtectedRoute>
    <ImageGallery />
  </ProtectedRoute>
} />
        <Route path="/projects/:id/view/:photoId" element={
          <ProtectedRoute>
            <ProjectPhotoView />
          </ProtectedRoute>
        } />
        
        {/* 🏠 RUTA RAÍZ */}
        <Route path="/" element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        } />
        
        {/* ❌ 404 */}
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
              onClick={() => window.location.href = '/projects'}
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
              Ver Mis Proyectos
            </button>
          </div>
        } />
      </Routes>
    </Suspense>
  )
}

export default App