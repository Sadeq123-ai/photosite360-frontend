import { useEffect, useRef, useState } from 'react'
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import './Viewer360.css'

const Viewer360 = ({ photo, photos, onClose, onNavigate }) => {
  const viewerRef = useRef(null)
  const pannellumRef = useRef(null)
  const scriptLoadedRef = useRef(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPannellum()
    
    return () => {
      if (pannellumRef.current) {
        try {
          pannellumRef.current.destroy()
          pannellumRef.current = null
        } catch (e) {
          console.error('Error destroying viewer:', e)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (scriptLoadedRef.current) {
      setError(false)
      setLoading(true)
      
      // Pequeño delay para asegurar que el contenedor está listo
      setTimeout(() => {
        initViewer()
      }, 100)
    }
  }, [photo.id]) // Cambiado de photo a photo.id

  const loadPannellum = () => {
    if (window.pannellum) {
      scriptLoadedRef.current = true
      initViewer()
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
      script.onload = () => {
        scriptLoadedRef.current = true
        initViewer()
      }
      script.onerror = () => {
        console.error('Error loading Pannellum')
        setError(true)
        setLoading(false)
      }
      document.body.appendChild(script)
    }
  }

  // Convertir cuaternión a ángulos Euler (yaw, pitch, roll)
  const quaternionToEuler = (qx, qy, qz, qw) => {
    // Convertir cuaternión a ángulos de Euler
    const sinr_cosp = 2 * (qw * qx + qy * qz)
    const cosr_cosp = 1 - 2 * (qx * qx + qy * qy)
    const roll = Math.atan2(sinr_cosp, cosr_cosp)

    const sinp = 2 * (qw * qy - qz * qx)
    const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp)

    const siny_cosp = 2 * (qw * qz + qx * qy)
    const cosy_cosp = 1 - 2 * (qy * qy + qz * qz)
    const yaw = Math.atan2(siny_cosp, cosy_cosp)

    // Convertir a grados
    return {
      yaw: yaw * (180 / Math.PI),
      pitch: pitch * (180 / Math.PI),
      roll: roll * (180 / Math.PI)
    }
  }

  // Extraer orientación del description
  const getOrientation = () => {
    if (!photo.description) return null
    
    const orientMatch = photo.description.match(/orientation:\[([-\d.eE+]+),([-\d.eE+]+),([-\d.eE+]+),([-\d.eE+]+)\]/)
    if (orientMatch) {
      const qx = parseFloat(orientMatch[1])
      const qy = parseFloat(orientMatch[2])
      const qz = parseFloat(orientMatch[3])
      const qw = parseFloat(orientMatch[4])
      
      return quaternionToEuler(qx, qy, qz, qw)
    }
    return null
  }

  const initViewer = () => {
    if (!window.pannellum || !viewerRef.current) {
      console.log('Waiting for Pannellum or container...')
      return
    }

    // IMPORTANTE: Destruir completamente el visor anterior
    if (pannellumRef.current) {
      try {
        pannellumRef.current.destroy()
        pannellumRef.current = null
      } catch (e) {
        console.error('Error destroying previous viewer:', e)
      }
    }

    // Limpiar el contenedor
    if (viewerRef.current) {
      viewerRef.current.innerHTML = ''
    }

// Si la URL ya es de Cloudinary, usarla directamente
const imageUrl = photo.url.startsWith('http') 
  ? photo.url 
  : `http://localhost:8001${photo.url}?t=${Date.now()}`
    console.log('Loading panorama:', imageUrl)

    // Obtener orientación inicial
    const orientation = getOrientation()
    const initialYaw = orientation ? orientation.yaw : 0
    const initialPitch = orientation ? orientation.pitch : 0

    console.log('Initial orientation:', { yaw: initialYaw, pitch: initialPitch })

    try {
      pannellumRef.current = window.pannellum.viewer(viewerRef.current, {
        type: 'equirectangular',
        panorama: imageUrl,
        autoLoad: true,
        showControls: true,
        showFullscreenCtrl: true,
        showZoomCtrl: true,
        mouseZoom: true,
        draggable: true,
        compass: false,
        crossOrigin: 'anonymous',
        yaw: initialYaw,
        pitch: initialPitch,
        hfov: 90,
        hotSpots: getHotSpots()
      })

      pannellumRef.current.on('load', () => {
        console.log('Panorama loaded successfully')
        setLoading(false)
        setError(false)
      })

      pannellumRef.current.on('error', (err) => {
        console.error('Pannellum error:', err)
        setError(true)
        setLoading(false)
      })

    } catch (error) {
      console.error('Error initializing Pannellum:', error)
      setError(true)
      setLoading(false)
    }
  }

  const getHotSpots = () => {
    const hotSpots = []
    const currentOrientation = getOrientation()
    
    photos.forEach(p => {
      if (p.id === photo.id) return
      
      const distance = calculateDistance(photo, p)
      if (distance < 50) {
        const angle = calculateAngle(photo, p)
        
        // Si tenemos orientación, solo mostrar hotspots en el campo de visión
        let showHotspot = true
        if (currentOrientation) {
          const currentYaw = currentOrientation.yaw
          let angleDiff = Math.abs(angle - currentYaw)
          if (angleDiff > 180) angleDiff = 360 - angleDiff
          
          // Solo mostrar si está dentro de 120 grados del campo de visión
          showHotspot = angleDiff < 120
        }
        
        if (showHotspot) {
          hotSpots.push({
            pitch: 0,
            yaw: angle,
            type: 'info',
            text: p.title,
            clickHandlerFunc: () => onNavigate(p.id)
          })
        }
      }
    })
    
    return hotSpots
  }

  const calculateDistance = (p1, p2) => {
    if (!p1.latitude || !p2.latitude) return 999
    const dx = parseFloat(p1.latitude) - parseFloat(p2.latitude)
    const dy = parseFloat(p1.longitude) - parseFloat(p2.longitude)
    return Math.sqrt(dx * dx + dy * dy)
  }

  const calculateAngle = (p1, p2) => {
    if (!p1.latitude || !p2.latitude) return 0
    const dx = parseFloat(p2.latitude) - parseFloat(p1.latitude)
    const dy = parseFloat(p2.longitude) - parseFloat(p1.longitude)
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }

  const currentIndex = photos.findIndex(p => p.id === photo.id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1

  const handlePrev = () => {
    if (hasPrev) onNavigate(photos[currentIndex - 1].id)
  }

  const handleNext = () => {
    if (hasNext) onNavigate(photos[currentIndex + 1].id)
  }

  return (
    <div className="viewer360-overlay">
      <div className="viewer360-header">
        <h3>{photo.title}</h3>
        <button className="viewer360-close" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="viewer360-container-wrapper">
        <div ref={viewerRef} className="viewer360-container" key={photo.id} />
        
        {loading && (
          <div className="viewer360-loading">
            <div className="spinner"></div>
            <p>Cargando panorama...</p>
          </div>
        )}
        
        {error && (
          <div className="viewer360-error">
            <AlertCircle size={64} />
            <h3>Error al cargar la imagen 360°</h3>
            <p>No se pudo cargar: {photo.title}</p>
            <button className="btn btn-secondary" onClick={initViewer}>
              Reintentar
            </button>
          </div>
        )}
      </div>

      <div className="viewer360-controls">
        <button 
          className="viewer360-nav" 
          onClick={handlePrev}
          disabled={!hasPrev}
        >
          <ChevronLeft size={32} />
        </button>
        
        <div className="viewer360-info">
          {currentIndex + 1} / {photos.length}
        </div>
        
        <button 
          className="viewer360-nav" 
          onClick={handleNext}
          disabled={!hasNext}
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  )
}

export default Viewer360
