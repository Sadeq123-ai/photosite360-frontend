import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Viewer360 from '../components/Viewer360'
import api from '../config/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Home } from 'lucide-react'
import './ProjectPhotoView.css'

const ProjectPhotoView = () => {
  const { id: projectId, photoId } = useParams()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)
  const [project, setProject] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [projectId, photoId])

  const loadData = async () => {
    try {
      const [projectResponse, photosResponse] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/photos`)
      ])
      
      setProject(projectResponse.data)
      setPhotos(photosResponse.data)
      
      const currentPhoto = photosResponse.data.find(p => p.id === parseInt(photoId))
      if (currentPhoto) {
        setPhoto(currentPhoto)
      } else {
        toast.error('Foto no encontrada')
        navigate(`/projects/${projectId}`)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos')
      navigate(`/projects/${projectId}`)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigatePhoto = (newPhotoId) => {
    navigate(`/projects/${projectId}/view/${newPhotoId}`)
  }

  const handleClose = () => {
    navigate(`/projects/${projectId}`)
  }

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando imagen 360°...</p>
        </div>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="page">
        <Navbar />
        <div className="error-container">
          <h2>Foto no encontrada</h2>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Volver al proyecto
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page project-photo-view">
      <Navbar />
      
      <div className="project-photo-header">
        <div className="breadcrumb">
          <button 
            className="btn-back"
            onClick={() => navigate('/projects')}  // ✅ CORREGIDO: Dashboard → Proyectos
          >
            <Home size={18} />
            Proyectos
          </button>
          <span className="separator">/</span>
          <button 
            className="btn-back"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            {project?.name}
          </button>
          <span className="separator">/</span>
          <span className="current">{photo.title}</span>
        </div>
        
        <button className="btn-close-viewer" onClick={handleClose}>
          <ArrowLeft size={20} />
          Volver al proyecto
        </button>
      </div>

      <div className="project-photo-content">
        <Viewer360
          photo={photo}
          photos={photos}
          onClose={handleClose}
          onNavigate={handleNavigatePhoto}
          showHeader={false}
        />
      </div>
    </div>
  )
}

export default ProjectPhotoView