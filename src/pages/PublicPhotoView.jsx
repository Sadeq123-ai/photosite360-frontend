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
      const response = await axios.get(`http://localhost:8001/api/public/photos/${photoId}`)
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
    const loadPannellum = () => {
      if (window.pannellum) {
        createViewer(photoData)
        return
      }

      if (!document.querySelector('link[href*="pannellum.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'
        document.head.appendChild(link)
      }

      if (!document.querySelector('script[src*="pannellum.js"]')) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'
        script.onload = () => createViewer(photoData)
        document.body.appendChild(script)
      }
    }

    const createViewer = (photoData) => {
      if (!window.pannellum) return

      const container = document.getElementById('panorama-viewer')
      if (!container) return

      const orientMatch = photoData.description?.match(/orientation:\[([-\d.eE+]+),([-\d.eE+]+),([-\d.eE+]+),([-\d.eE+]+)\]/)
      let initialYaw = 0
      let initialPitch = 0

      if (orientMatch) {
        const qx = parseFloat(orientMatch[1])
        const qy = parseFloat(orientMatch[2])
        const qz = parseFloat(orientMatch[3])
        const qw = parseFloat(orientMatch[4])

        const sinr_cosp = 2 * (qw * qx + qy * qz)
        const cosr_cosp = 1 - 2 * (qx * qx + qy * qy)
        const sinp = 2 * (qw * qy - qz * qx)
        const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp)
        const siny_cosp = 2 * (qw * qz + qx * qy)
        const cosy_cosp = 1 - 2 * (qy * qy + qz * qz)
        const yaw = Math.atan2(siny_cosp, cosy_cosp)

        initialYaw = yaw * (180 / Math.PI)
        initialPitch = pitch * (180 / Math.PI)
      }

      window.pannellum.viewer(container, {
        type: 'equirectangular',
        panorama: photoData.url,
        autoLoad: true,
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        mouseZoom: true,
        draggable: true,
        yaw: initialYaw,
        pitch: initialPitch,
        hfov: 90
      })
    }

    loadPannellum()
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
          <h2>Foto no encontrada</h2>
          <p>Esta foto no existe o ha sido eliminada.</p>
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