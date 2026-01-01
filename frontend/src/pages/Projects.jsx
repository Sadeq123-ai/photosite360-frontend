import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PendingInvitations from '../components/PendingInvitations'
import InviteModal from '../components/InviteModal'
import api from '../config/axios'
import toast from 'react-hot-toast'
import { Plus, Search, Trash2, FolderOpen, X, Users, Database } from 'lucide-react'
import './Projects.css'

const Projects = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showGlobalInviteModal, setShowGlobalInviteModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: ''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/')
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Error al cargar proyectos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto? Se eliminarán TODOS los archivos asociados en Cloudinary.')) return

    try {
      const response = await api.delete(`/projects/${id}`)
      
      // Mostrar información de la eliminación
      if (response.data.cloudinary_cleanup) {
        const cleanup = response.data.cloudinary_cleanup
        toast.success(
          `✅ Proyecto eliminado: ${cleanup.deleted_count} archivos eliminados de Cloudinary`,
          { duration: 5000 }
        )
      } else {
        toast.success('Proyecto eliminado')
      }
      
      setProjects(projects.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Error al eliminar proyecto')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio')
      return
    }

    setCreating(true)

    try {
      const response = await api.post('/projects/', formData)
      setProjects([response.data, ...projects])
      toast.success('¡Proyecto creado exitosamente!')
      setShowModal(false)
      setFormData({ name: '', description: '', location: '' })
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Error al crear proyecto')
    } finally {
      setCreating(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="page">
      <Navbar />
      
      <div className="container projects-content">
        <div className="projects-header">
          <div>
            <h1>Mis Proyectos</h1>
            <p>Gestiona tus proyectos de construcción</p>
          </div>
          <div className="projects-header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/admin/database')}
              title="Administrador de Base de Datos"
              style={{ background: '#6366f1' }}
            >
              <Database size={20} />
              Base de Datos
            </button>
            <button
              className="btn btn-success"
              onClick={() => setShowGlobalInviteModal(true)}
              title="Invitar colaborador global"
            >
              <Users size={20} />
              Invitar Colaborador Global
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <Plus size={20} />
              Nuevo Proyecto
            </button>
          </div>
        </div>

        {/* Invitaciones pendientes */}
        <PendingInvitations />

        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <div className="loading">Cargando proyectos...</div>
        ) : filteredProjects.length > 0 ? (
          <div className="projects-grid">
            {filteredProjects.map(project => (
              <div 
                key={project.id} 
                className="project-card project-card-clickable"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="project-card-header">
                  <FolderOpen size={24} color="#667eea" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                    className="btn-icon-danger"
                    title="Eliminar proyecto y todos sus archivos"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h3>{project.name}</h3>
                <p className="project-description">
                  {project.description || 'Sin descripción'}
                </p>
                
                {project.location && (
                  <div className="project-location">
                    📍 {project.location}
                  </div>
                )}
                
                <div className="project-footer">
                  <span className="project-date">
                    Creado: {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FolderOpen size={64} color="#cbd5e0" />
            <h3>No hay proyectos</h3>
            <p>
              {searchTerm
                ? 'No se encontraron proyectos con ese término'
                : 'Crea tu primer proyecto para empezar'}
            </p>
            {!searchTerm && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={20} />
                Crear Proyecto
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal crear proyecto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Proyecto</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Nombre del proyecto *</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: Edificio Torre Norte"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  className="input textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe el proyecto..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Ubicación</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Ej: Madrid, España"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creando...' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal invitación global */}
      {showGlobalInviteModal && (
        <InviteModal
          isGlobal={true}
          onClose={() => setShowGlobalInviteModal(false)}
          onInviteSent={() => {
            setShowGlobalInviteModal(false);
            toast.success('Invitación enviada exitosamente');
          }}
        />
      )}
    </div>
  )
}

export default Projects