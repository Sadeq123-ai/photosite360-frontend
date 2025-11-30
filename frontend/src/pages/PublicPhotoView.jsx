import { useParams } from 'react-router-dom'

const PublicPhotoView = () => {
  const { photoId } = useParams()

  console.log('🎯 PublicPhotoView - INICIADO:', {
    photoId,
    ruta: window.location.pathname,
    urlCompleta: window.location.href
  })

  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
      color: 'white',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        padding: '40px',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        maxWidth: '600px',
        margin: '0 auto',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '15px' }}>🌐 VISTA PÚBLICA</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '25px', opacity: 0.9 }}>PhotoSite360 - Enlace Compartible</h2>
        
        <div style={{
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '25px',
          borderRadius: '12px',
          margin: '25px 0',
          textAlign: 'left',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginTop: 0, borderBottom: '1px solid rgba(255, 255, 255, 0.2)', paddingBottom: '10px' }}>
            📊 Información de la Ruta:
          </h3>
          <p><strong>🆔 ID de Foto:</strong> {photoId}</p>
          <p><strong>📍 Ruta Actual:</strong> {window.location.pathname}</p>
          <p><strong>🌐 URL Completa:</strong> {window.location.href}</p>
          <p><strong>🔍 Estado:</strong> <span style={{ color: '#90ee90' }}>RUTA PÚBLICA FUNCIONANDO</span></p>
        </div>

        <p style={{ fontSize: '1.1rem', marginBottom: '30px', lineHeight: '1.5' }}>
          ✅ <strong>¡Éxito!</strong> Esta es una página pública que puede ser compartida con cualquier persona sin necesidad de iniciar sesión.
        </p>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '25px' }}>
          <button 
            onClick={() => window.location.href = 'https://photosite360-frontend.onrender.com'}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🏠 Ir a la Aplicación Principal
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔄 Recargar Página
          </button>
        </div>

        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          opacity: 0.8
        }}>
          <p style={{ margin: 0 }}>
            <strong>💡 Para desarrolladores:</strong> Si puedes ver esta página, significa que las rutas públicas (/view/:photoId) están funcionando correctamente.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PublicPhotoView
