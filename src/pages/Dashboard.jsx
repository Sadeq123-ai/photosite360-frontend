import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import api from '../config/axios'
import { FolderOpen, Camera, Clock } from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalPhotos: 0,
    recentProjects: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/projects/')
      const projects = response.data
      
      const totalPhotos = projects.reduce((sum, project) => 
        sum + (project.photos?.length || 0), 0
      )

      setStats({
        totalProjects: projects.length,
        totalPhotos: totalPhotos,
        recentProjects: projects.slice(0, 5)
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <Navbar />
      
      <div className="container dashboard-content">
        <div className="dashboard-header">
          <h1>Bienvenido, {user?.full_name}</h1>
          <p>Gestiona tus proyectos y fotos 360°</p>
        </div>

        {loading ? (
          <div className="loading">Cargando estadísticas...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{background: '#667eea'}}>
                  <FolderOpen size={32} color="white" />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalProjects}</h3>
                  <p>Proyectos Totales</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{background: '#10b981'}}>
                  <Camera size={32} color="white" />
                </div>
                <div className="stat-info">
                  <h3>{stats.totalPhotos}</h3>
                  <p>Fotos 360°</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{background: '#f59e0b'}}>
                  <Clock size={32} color="white" />
                </div>
                <div className="stat-info">
                  <h3>{stats.recentProjects.length}</h3>
                  <p>Proyectos Recientes</p>
                </div>
              </div>
            </div>

            <div className="recent-section">
              <h2>Proyectos Recientes</h2>
              {stats.recentProjects.length > 0 ? (
                <div className="projects-grid">
                  {stats.recentProjects.map(project => (
                    <div key={project.id} className="project-card-mini">
                      <h4>{project.name}</h4>
                      <p>{project.description || 'Sin descripción'}</p>
                      <span className="project-location">{project.location || 'Sin ubicación'}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <FolderOpen size={48} color="#cbd5e0" />
                  <p>No tienes proyectos aún</p>
                  <a href="/projects" className="btn btn-primary">Crear primer proyecto</a>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
