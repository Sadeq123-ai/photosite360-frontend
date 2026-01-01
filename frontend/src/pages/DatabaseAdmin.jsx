import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Database, Table, FileJson, BarChart3, ArrowLeft, RefreshCw } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function DatabaseAdmin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Datos
  const [overview, setOverview] = useState(null)
  const [projectsExtended, setProjectsExtended] = useState([])
  const [projectObjects, setProjectObjects] = useState([])
  const [tableTemplates, setTableTemplates] = useState([])
  const [projectStats, setProjectStats] = useState([])

  // Filtros para project_objects
  const [filters, setFilters] = useState({
    project_id: '',
    object_type: '',
    level: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const config = { headers: { Authorization: `Bearer ${token}` } }

      // Cargar overview
      const overviewRes = await axios.get(`${API_URL}/api/admin/database-overview`, config)
      setOverview(overviewRes.data)

      // Cargar todas las tablas
      const [extendedRes, objectsRes, templatesRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/projects-extended`, config),
        axios.get(`${API_URL}/api/admin/project-objects?limit=50`, config),
        axios.get(`${API_URL}/api/admin/table-templates`, config),
        axios.get(`${API_URL}/api/admin/project-stats`, config)
      ])

      setProjectsExtended(extendedRes.data)
      setProjectObjects(objectsRes.data)
      setTableTemplates(templatesRes.data)
      setProjectStats(statsRes.data)

    } catch (error) {
      console.error('Error cargando datos:', error)
      toast.error('Error al cargar datos de la base de datos')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      }

      const res = await axios.get(`${API_URL}/api/admin/project-objects`, config)
      setProjectObjects(res.data)
      toast.success('Filtros aplicados')
    } catch (error) {
      toast.error('Error al aplicar filtros')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando base de datos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/projects')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-7 h-7 text-blue-600" />
                  Administrador de Base de Datos
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Sistema GIS/BIM - Tablas extendidas y configuración
                </p>
              </div>
            </div>
            <button
              onClick={loadData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            {[
              { id: 'overview', label: 'Vista General', icon: Database },
              { id: 'projects_extended', label: 'Proyectos Extendidos', icon: Table },
              { id: 'project_objects', label: 'Objetos', icon: FileJson },
              { id: 'table_templates', label: 'Plantillas', icon: Table },
              { id: 'project_stats', label: 'Estadísticas', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && overview && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tablas Originales */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Tablas Originales</h2>
                <div className="space-y-3">
                  {Object.entries(overview.tablas_originales).map(([tabla, count]) => (
                    <div key={tabla} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{tabla}</span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tablas Extendidas */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Tablas Extendidas (GIS/BIM)</h2>
                <div className="space-y-3">
                  {Object.entries(overview.tablas_extendidas).map(([tabla, count]) => (
                    <div key={tabla} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium text-gray-700">{tabla}</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total de Registros en Base de Datos</p>
                  <p className="text-4xl font-bold">{overview.total_registros.toLocaleString()}</p>
                </div>
                <Database className="w-16 h-16 text-blue-300 opacity-50" />
              </div>
            </div>
          </div>
        )}

        {/* Projects Extended Tab */}
        {activeTab === 'projects_extended' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Configuraciones Extendidas de Proyectos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {projectsExtended.length} configuraciones
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveles</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivos BIM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projectsExtended.map(config => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{config.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{config.project_name}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          config.project_type === 'edificacion'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {config.project_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {config.level_config?.levels?.length || 0} niveles
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {config.revit_file_id || config.civil3d_file_path || config.ifc_file_url ? 'Sí' : 'No'}
                      </td>
                    </tr>
                  ))}
                  {projectsExtended.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No hay configuraciones extendidas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Project Objects Tab */}
        {activeTab === 'project_objects' && (
          <div className="space-y-4">
            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">Filtros</h3>
              <div className="grid md:grid-cols-4 gap-3">
                <input
                  type="number"
                  placeholder="ID Proyecto"
                  value={filters.project_id}
                  onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={filters.object_type}
                  onChange={(e) => setFilters({ ...filters, object_type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Todos los tipos</option>
                  <option value="foto360">Foto 360</option>
                  <option value="imagen">Imagen</option>
                  <option value="incidencia">Incidencia</option>
                  <option value="punto_control">Punto Control</option>
                </select>
                <input
                  type="text"
                  placeholder="Nivel (ej: P00)"
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Aplicar Filtros
                </button>
              </div>
            </div>

            {/* Tabla de Objetos */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Objetos del Proyecto</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Mostrando {projectObjects.length} objetos
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coordenadas UTM</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Atributos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projectObjects.map(obj => (
                      <tr key={obj.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{obj.id}</td>
                        <td className="px-4 py-3 text-sm font-medium">{obj.name}</td>
                        <td className="px-4 py-3 text-sm">{obj.project_name}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            obj.object_type === 'foto360' ? 'bg-purple-100 text-purple-700' :
                            obj.object_type === 'imagen' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {obj.object_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{obj.level || '-'}</td>
                        <td className="px-4 py-3 text-sm font-mono text-xs">
                          {obj.coordinates.utm_easting.toFixed(2)}, {obj.coordinates.utm_northing.toFixed(2)}
                          <br />
                          <span className="text-gray-500">Z: {obj.coordinates.elevation.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {Object.keys(obj.attributes).length} campos
                        </td>
                      </tr>
                    ))}
                    {projectObjects.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No hay objetos
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Table Templates Tab */}
        {activeTab === 'table_templates' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Plantillas de Tablas</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {tableTemplates.length} plantillas
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pública</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tableTemplates.map(template => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{template.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{template.name}</td>
                      <td className="px-4 py-3 text-sm">{template.project_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{template.description || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {template.is_public ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Sí</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(template.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {tableTemplates.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No hay plantillas de tablas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Project Stats Tab */}
        {activeTab === 'project_stats' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Estadísticas de Proyectos</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {projectStats.length} proyectos con estadísticas
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Objetos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fotos 360</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imágenes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Incidencias</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Críticas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projectStats.map(stat => (
                    <tr key={stat.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{stat.project_name}</td>
                      <td className="px-4 py-3 text-sm">{stat.total_objects}</td>
                      <td className="px-4 py-3 text-sm">{stat.total_fotos360}</td>
                      <td className="px-4 py-3 text-sm">{stat.total_imagenes}</td>
                      <td className="px-4 py-3 text-sm">{stat.total_incidencias}</td>
                      <td className="px-4 py-3 text-sm">
                        {stat.incidencias_criticas > 0 && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            {stat.incidencias_criticas}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {projectStats.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No hay estadísticas disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
