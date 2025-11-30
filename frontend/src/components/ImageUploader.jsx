import { useState, useCallback } from 'react'
import api from '../config/axios'
import './ImageUploader.css'

const ImageUploader = ({ projectId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [uploadedImages, setUploadedImages] = useState([])

  // Manejar drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Manejar drop de archivos
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  // Manejar selección de archivos
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  // Subir archivos al servidor (VERSIÓN MEJORADA CON DEBUG)
  const handleFiles = async (files) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    )

    if (imageFiles.length === 0) {
      alert('Por favor, selecciona solo archivos de imagen (JPG, PNG, etc.)')
      return
    }

    // 🔧 DEBUG: Ver información de la subida
    console.log('🚀 INICIANDO SUBIDA A API REAL:', {
      projectId,
      totalFiles: imageFiles.length,
      files: imageFiles.map(f => ({
        name: f.name,
        size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
        type: f.type
      })),
      endpoint: `/projects/${projectId}/gallery/upload`,
      token: localStorage.getItem('token') ? '✅ Presente' : '❌ Faltante'
    })

    setUploading(true)
    const newUploadedImages = []

    try {
      for (const file of imageFiles) {
        console.log(`📤 Procesando archivo: ${file.name}`)
        
        // Configurar progreso inicial
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 5
        }))

        // Crear FormData para la subida
        const formData = new FormData()
        formData.append('file', file)
        formData.append('image_type', 'edification')

        console.log('📦 FormData creado, iniciando upload...')

        try {
          // Subir a tu backend real
          const response = await api.post(`/projects/${projectId}/photos/upload`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 30000, // 30 segundos timeout
            onUploadProgress: (progressEvent) => {
              const progress = progressEvent.total ? 
                Math.round((progressEvent.loaded * 100) / progressEvent.total) : 50
              
              setUploadProgress(prev => ({
                ...prev,
                [file.name]: progress
              }))
            }
          })

          console.log('✅ RESPUESTA DEL SERVIDOR:', response.data)

          if (response.data) {
            newUploadedImages.push(response.data)
            
            // Actualizar progreso a 100%
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: 100
            }))

            console.log(`✅ ${file.name} subido correctamente`)
          }

        } catch (fileError) {
          console.error(`❌ ERROR con archivo ${file.name}:`, fileError)
          throw fileError // Relanzar el error para manejarlo fuera
        }
      }

      // 🔧 DEBUG: Ver resultado final
      console.log('🎯 SUBIDA COMPLETADA:', {
        totalSubidos: newUploadedImages.length,
        imagenes: newUploadedImages
      })

      setUploadedImages(prev => [...prev, ...newUploadedImages])
      
      if (onUploadComplete) {
        onUploadComplete(newUploadedImages)
      }

      // Mostrar mensaje de éxito
      alert(`✅ ${imageFiles.length} imagen(es) subidas correctamente usando endpoint temporal`)

    } catch (error) {
      // 🔧 DEBUG DETALLADO DEL ERROR
      console.error('🚨 ERROR CRÍTICO EN SUBIDA:', {
        name: error.name,
        message: error.message,
        code: error.code,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        },
        request: {
          url: error.config?.url,
          method: error.config?.method
        }
      })

      let errorMessage = 'Error al subir las imágenes. '
      
      if (error.response?.status === 413) {
        errorMessage += 'El archivo es demasiado grande (máximo 10MB).'
      } else if (error.response?.status === 401) {
        errorMessage += 'Sesión expirada. Por favor, inicia sesión nuevamente.'
        // Redirigir al login
        setTimeout(() => window.location.href = '/login', 2000)
      } else if (error.response?.status === 404) {
        errorMessage += 'Proyecto no encontrado.'
      } else if (error.response?.status === 500) {
        errorMessage += 'Error del servidor. Intenta más tarde.'
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage += 'Error de conexión. Verifica tu internet.'
      } else if (error.response?.data?.detail) {
        errorMessage += error.response.data.detail
      } else {
        errorMessage += `Error: ${error.message}`
      }
      
      alert(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }

  return (
    <div className="image-uploader">
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📤</div>
          <h3>Subir Imágenes a la Nube</h3>
          <p>Arrastra y suelta imágenes aquí o haz clic para seleccionar</p>
          <p className="upload-formats">Formatos: JPG, PNG, WEBP (Máx. 10MB)</p>
          <p className="upload-note success">
            <strong>✅ Conexión real:</strong> Las imágenes se guardan en Cloudinary
          </p>
          
          <label className="file-input-label">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <span className="file-input-button">
              {uploading ? '📤 Subiendo a la nube...' : '☁️ Subir a la Nube'}
            </span>
          </label>
        </div>
      </div>

      {/* Mostrar progreso de subida REAL */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="upload-progress">
          <h4>📊 Progreso de Subida a la Nube:</h4>
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="progress-item">
              <div className="progress-info">
                <span className="filename">{filename}</span>
                <span className="progress-percent">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-status">
                {progress === 100 ? '✅ Completado' : 
                 progress >= 50 ? '☁️ Subiendo a cloud...' : 
                 '🔄 Procesando...'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mostrar imágenes subidas recientemente */}
      {uploadedImages.length > 0 && (
        <div className="recent-uploads">
          <h4>✅ {uploadedImages.length} imagen(es) en la nube:</h4>
          <div className="uploaded-grid">
            {uploadedImages.map((image, index) => (
              <div key={index} className="uploaded-item">
                <img 
                  src={image.url} 
                  alt={image.filename}
                  onError={(e) => {
                    console.error('Error cargando imagen:', image.url)
                    e.target.src = '/placeholder-image.jpg'
                  }}
                />
                <div className="uploaded-info">
                  <span className="filename">{image.filename}</span>
                  <span className="url">ID: {image.unique_url}</span>
                  <span className="file-size">
                    {(image.file_size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <span className="cloud-badge">☁️ Cloudinary</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageUploader