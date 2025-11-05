import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import './PublicPhotoView.css'

const PublicPhotoView = () => {
  const { photoId } = useParams()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  console.log('🎯 PublicPhotoView iniciado con photoId:', photoId)
  console.log('📱 URL actual:', window.location.href)

  useEffect(() => {
    console.log('🔄 useEffect ejecutándose para photoId:', photoId)
    loadPhoto()
  }, [photoId])

  const loadPhoto = async () => {
    console.log('🚀 Iniciando carga de foto...')
    
    try {
      const apiUrl = `https://web-production-51970.up.railway.app/api/public/photos/${photoId}`
      console.log('📡 Haciendo request a:', apiUrl)
      
      const response = await axios.get(apiUrl)
      
      console.log('✅ Foto cargada exitosamente:', response.data)
      setPhoto(response.data)
      initViewer(response.data)
      
    } catch (error) {
      console.error('❌ Error cargando foto:', error)
      console.error('📊 Detalles del error:', error.response?.data || error.message)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const initViewer = (photoData) => {
    console.log('🎮 Iniciando visor 360°...')
    
    // Función para crear el visor una vez cargado Pannellum
    const createViewer = () => {
      const container = document.getElementById('panorama-viewer')
      if (!container) {
        console.error('❌ Contenedor panorama-viewer no encontrado')
        return
      }

      // Limpiar contenedor
      container.innerHTML = ''

      try {
        console.log('🖼️ Creando visor con imagen:', photoData.url)
        
        window.pannellum.viewer(container, {
          type: 'equirectangular',
          panorama: photoData.url,
          autoLoad: true,
          autoRotate: -2,
          showControls: true,
          showFullscreenCtrl: true,
          showZoomCtrl: true,
          mouseZoom: true,
          draggable: true,
          compass: true
        })
        
        console.log('✅ Visor 360° creado exitosamente')
      } catch (error) {
        console.error('❌ Error creando visor:', error)
        setError(true)
      }
    }

    // Si Pannellum ya está cargado, crear el visor inmediatamente
    if (window.pannellum) {
      console.log('✅ Pannellum ya está cargado')
      createViewer()
      return
    }

    console.log('📚 Cargando Pannellum...')

    // Cargar CSS
    if (!document.querySelector('link[href*="pannellum.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'
      document.head.appendChild(link)
      console.log('✅ CSS de Pannellum cargado')
    }

    // Cargar JavaScript
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'
    
    script.onload = () => {
      console.log('✅ JavaScript de Pannellum cargado')
      createViewer()
    }
    
    script.onerror = (err) => {
      console.error('❌ Error cargando Pannellum:', err)
      setError(true)
    }
    
    document.body.appendChild(script)
  }

  // Mostrar loading
  if (loading) {
    return (
      <div className="public-view">
        <div className="loading-message">
          <div className="spinner"></div>
          <h2>Cargando foto 360°...</h2>
          <p>ID: {photoId}</p>
          <p className="debug-info">URL: {window.location.href}</p>
        </div>
      </div>
    )
  }

  // Mostrar error
  if (error || !photo) {
    return (
      <div className="public-view">
        <div className="error-message">
          <h2>❌ Error al cargar la foto</h2>
          <p>No se pudo cargar la imagen 360° con ID: {photoId}</p>
          <p>Posibles causas:</p>
          <ul>
            <li>La foto no existe</li>
            <li>La foto no es pública</li>
            <li>Error de conexión con el servidor</li>
          </ul>
          <div className="error-actions">
            <button 
              className="btn btn-primary" 
              onClick={() => window.location.reload()}
            >
              🔄 Reintentar
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => window.location.href = '/'}
            >
              🏠 Volver al inicio
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar visor
  return (
    <div className="public-view">
      <div className="public-header">
        <h1>📸 {photo.title}</h1>
        <p>Vista 360° - PhotoSite360</p>
        <div className="photo-info">
          <span className="photo-id">ID: {photo.id}</span>
          <span className="photo-date">
            Creada: {new Date(photo.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div id="panorama-viewer" className="panorama-container"></div>
      
      <div className="public-footer">
        <p>Comparte esta vista 360° con otros usuarios</p>
      </div>
    </div>
  )
}

export default PublicPhotoView