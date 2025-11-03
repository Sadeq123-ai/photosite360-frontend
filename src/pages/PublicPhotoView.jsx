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
      const response = await axios.get(`https://web-production-51970.up.railway.app/api/public/photos/${photoId}`)
      setPhoto(response.data)
      initViewer(response.data)
    } catch (error) {
      console.error('Error loading photo:', error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const initViewer = (photoData) => {
    // Cargar Pannellum si no está cargado
    if (!window.pannellum) {
      // Cargar CSS
      if (!document.querySelector('link[href*="pannellum.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'
        document.head.appendChild(link)
      }

      // Cargar JS
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'
      script.onload = () => createViewer(photoData)
      script.onerror = () => {
        console.error('Failed to load Pannellum')
        setError(true)
      }
      document.body.appendChild(script)
    } else {
      createViewer(photoData)
    }
  }

  const createViewer = (photoData) => {
    const container = document.getElementById('panorama-viewer')
    if (!container || !window.pannellum) return

    try {
      window.pannellum.viewer(container, {
        type: 'equirectangular',
        panorama: photoData.url,
        autoLoad: true,
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        mouseZoom: true,
        draggable: true
      })
    } catch (error) {
      console.error('Error creating viewer:', error)
      setError(true)
    }
  }

  if (loading) {
    return (
      <div className="public-view">
        <div className="loading-message">Cargando foto 360°...</div>
      </div>
    )
  }

  if (error || !photo) {
    return (
      <div className="public-view">
        <div className="error-message">
          <h2>Error al cargar la foto</h2>
          <p>No se pudo cargar la imagen 360°.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="public-view">
      <div className="public-header">
        <h1>📸 {photo.title}</h1>
        <p>Vista 360° - PhotoSite360</p>
      </div>
      <div id="panorama-viewer" className="panorama-container"></div>
    </div>
  )
}

export default PublicPhotoView