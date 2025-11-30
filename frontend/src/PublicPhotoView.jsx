import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import './PublicPhotoView.css'

const PublicPhotoView = () => {
  const { photoId } = useParams()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    loadPhoto()
  }, [photoId])

  const loadPhoto = async () => {
    try {
      console.log('🔄 Cargando foto pública ID:', photoId)
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/public/photos/${photoId}`)
      
      console.log('✅ Foto cargada:', response.data)
      setPhoto(response.data)
      initViewer(response.data)
      
    } catch (error) {
      console.error('❌ Error cargando foto:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const initViewer = (photoData) => {
    console.log('🎮 Iniciando visor para:', photoData.title)
    
    const loadPannellum = () => {
      if (window.pannellum) {
        console.log('✅ Pannellum ya cargado')
        createViewer(photoData)
        return
      }

      // Cargar CSS de Pannellum
      if (!document.querySelector('link[href*="pannellum.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'
        document.head.appendChild(link)
        console.log('✅ CSS de Pannellum cargado')
      }

      // Cargar JavaScript de Pannellum
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'
      script.onload = () => {
        console.log('✅ Pannellum JS cargado')
        createViewer(photoData)
      }
      script.onerror = () => {
        console.error('❌ Error cargando Pannellum')
        setError(true)
      }
      document.body.appendChild(script)
    }

    const createViewer = (photoData) => {
      if (!window.pannellum) {
        console.error('❌ Pannellum no disponible')
        return
      }

      const container = document.getElementById('panorama-viewer')
      if (!container) {
        console.error('❌ Contenedor no encontrado')
        return
      }

      // Limpiar contenedor previo
      container.innerHTML = ''

      console.log('🖼️ Creando visor con imagen:', photoData.url)

      try {
        window.pannellum.viewer(container, {
          type: 'equirectangular',
          panorama: photoData.url,
          autoLoad: true,
          autoRotate: -1,
          showControls: true,
          showFullscreenCtrl: true,
          showZoomCtrl: true,
          mouseZoom: true,
          draggable: true,
          compass: true,
          hfov: 90,
          crossOrigin: 'anonymous'
        })
        console.log('✅ Visor 360° creado exitosamente')
      } catch (error) {
        console.error('❌ Error creando visor:', error)
        setError(true)
      }
    }

    loadPannellum()
  }

  if (loading) {
    return (
      <div className="public-view">
        <div className="loading-message">
          <div className="spinner"></div>
          <h2>Cargando foto 360°...</h2>
          <p>ID: {photoId}</p>
        </div>
      </div>
    )
  }

  if (error || !photo) {
    return (
      <div className="public-view">
        <div className="error-message">
          <h2>❌ Error al cargar la foto</h2>
          <p>No se pudo cargar la imagen 360° con ID: {photoId}</p>
          <p>Puede que la foto no exista o no sea pública.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.href = '/'}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="public-view">
      <div className="public-header">
        <h1>📸 {photo.title}</h1>
        <p>Vista 360° - PhotoSite360</p>
        <p className="photo-id">ID: {photo.id}</p>
      </div>
      <div id="panorama-viewer" className="panorama-container"></div>
    </div>
  )
}

export default PublicPhotoView
