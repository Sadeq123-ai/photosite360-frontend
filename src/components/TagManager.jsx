import { useState, useEffect } from 'react'
import './TagManager.css'

const TagManager = ({ projectId, onTagsUpdate }) => {
  const [tags, setTags] = useState([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3b82f6')
  const [editingTag, setEditingTag] = useState(null)

  // Etiquetas predefinidas
  const predefinedTags = [
    // Plantas
    { id: 'p00', name: 'P00', color: '#3b82f6', predefined: true, category: 'Planta' },
    { id: 'p01', name: 'P01', color: '#3b82f6', predefined: true, category: 'Planta' },
    { id: 'p02', name: 'P02', color: '#3b82f6', predefined: true, category: 'Planta' },
    { id: 'p03', name: 'P03', color: '#3b82f6', predefined: true, category: 'Planta' },
    { id: 'p04', name: 'P04', color: '#3b82f6', predefined: true, category: 'Planta' },
    
    // Secciones
    { id: 's01', name: 'S01', color: '#10b981', predefined: true, category: 'Sección' },
    { id: 's02', name: 'S02', color: '#10b981', predefined: true, category: 'Sección' },
    { id: 's03', name: 'S03', color: '#10b981', predefined: true, category: 'Sección' },
    
    // Espacios
    { id: 'salon', name: 'Salon', color: '#f59e0b', predefined: true, category: 'Espacio' },
    { id: 'cocina', name: 'Cocina', color: '#f59e0b', predefined: true, category: 'Espacio' },
    { id: 'baño', name: 'Baño', color: '#f59e0b', predefined: true, category: 'Espacio' },
    { id: 'dormitorio', name: 'Dormitorio', color: '#f59e0b', predefined: true, category: 'Espacio' },
    { id: 'oficina', name: 'Oficina', color: '#f59e0b', predefined: true, category: 'Espacio' },
    { id: 'terraza', name: 'Terraza', color: '#f59e0b', predefined: true, category: 'Espacio' },
    { id: 'garaje', name: 'Garaje', color: '#f59e0b', predefined: true, category: 'Espacio' },
    
    // Exteriores
    { id: 'fachada', name: 'Fachada', color: '#ef4444', predefined: true, category: 'Exterior' },
    { id: 'jardin', name: 'Jardin', color: '#ef4444', predefined: true, category: 'Exterior' },
    { id: 'piscina', name: 'Piscina', color: '#ef4444', predefined: true, category: 'Exterior' },
  ]

  // Colores predefinidos para nuevas etiquetas
  const colorOptions = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280'
  ]

  useEffect(() => {
    // Cargar etiquetas predefinidas + personalizadas del localStorage
    const savedTags = JSON.parse(localStorage.getItem(`project_${projectId}_tags`) || '[]')
    setTags([...predefinedTags, ...savedTags])
  }, [projectId])

  const createTag = () => {
    if (!newTagName.trim()) return

    const newTag = {
      id: `custom_${Date.now()}`,
      name: newTagName.trim(),
      color: newTagColor,
      predefined: false,
      category: 'Personalizada',
      created_at: new Date().toISOString()
    }

    const updatedTags = [...tags, newTag]
    setTags(updatedTags)
    saveTags(updatedTags)
    setNewTagName('')
    setNewTagColor('#3b82f6')
    
    if (onTagsUpdate) {
      onTagsUpdate(updatedTags)
    }
  }

  const updateTag = (tagId, updates) => {
    const updatedTags = tags.map(tag => 
      tag.id === tagId ? { ...tag, ...updates } : tag
    )
    setTags(updatedTags)
    saveTags(updatedTags)
    
    if (onTagsUpdate) {
      onTagsUpdate(updatedTags)
    }
  }

  const deleteTag = (tagId) => {
    const tagToDelete = tags.find(tag => tag.id === tagId)
    if (tagToDelete?.predefined) {
      alert('No se pueden eliminar etiquetas predefinidas')
      return
    }

    const updatedTags = tags.filter(tag => tag.id !== tagId)
    setTags(updatedTags)
    saveTags(updatedTags)
    
    if (onTagsUpdate) {
      onTagsUpdate(updatedTags)
    }
  }

  const saveTags = (tagsToSave) => {
    const customTags = tagsToSave.filter(tag => !tag.predefined)
    localStorage.setItem(`project_${projectId}_tags`, JSON.stringify(customTags))
  }

  const startEditing = (tag) => {
    if (tag.predefined) {
      alert('No se pueden editar etiquetas predefinidas')
      return
    }
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
  }

  const saveEdit = () => {
    if (!newTagName.trim() || !editingTag) return

    updateTag(editingTag.id, {
      name: newTagName.trim(),
      color: newTagColor
    })

    setEditingTag(null)
    setNewTagName('')
    setNewTagColor('#3b82f6')
  }

  const cancelEdit = () => {
    setEditingTag(null)
    setNewTagName('')
    setNewTagColor('#3b82f6')
  }

  const addPredefinedTag = (predefinedTag) => {
    // Verificar si ya existe
    if (!tags.find(tag => tag.id === predefinedTag.id)) {
      const updatedTags = [...tags, predefinedTag]
      setTags(updatedTags)
      saveTags(updatedTags)
      
      if (onTagsUpdate) {
        onTagsUpdate(updatedTags)
      }
    }
  }

  return (
    <div className="tag-manager">
      {/* Crear nueva etiqueta */}
      <div className="create-tag-section">
        <h4>{editingTag ? 'Editar Etiqueta' : 'Crear Nueva Etiqueta'}</h4>
        <div className="tag-form">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Ej: 01_P01, Ventana_Norte, Instalaciones..."
            className="tag-input"
          />
          
          <div className="color-picker">
            {colorOptions.map(color => (
              <button
                key={color}
                className={`color-option ${newTagColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setNewTagColor(color)}
              />
            ))}
          </div>

          <div className="tag-actions">
            {editingTag ? (
              <>
                <button className="btn btn-success" onClick={saveEdit}>
                  💾 Guardar
                </button>
                <button className="btn btn-secondary" onClick={cancelEdit}>
                  ❌ Cancelar
                </button>
              </>
            ) : (
              <button 
                className="btn btn-primary" 
                onClick={createTag}
                disabled={!newTagName.trim()}
              >
                ➕ Crear Etiqueta
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Etiquetas predefinidas */}
      <div className="predefined-tags-section">
        <h4>🏷️ Etiquetas Predefinidas</h4>
        <p>Haz clic para añadir a tu proyecto:</p>
        <div className="predefined-tags-grid">
          {predefinedTags.map(tag => (
            <button
              key={tag.id}
              className={`predefined-tag ${tags.find(t => t.id === tag.id) ? 'added' : ''}`}
              style={{ 
                '--tag-color': tag.color,
                backgroundColor: tags.find(t => t.id === tag.id) ? tag.color : 'transparent'
              }}
              onClick={() => addPredefinedTag(tag)}
            >
              <span className="tag-badge" style={{ backgroundColor: tag.color }}>
                {tag.category.charAt(0)}
              </span>
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de etiquetas del proyecto */}
      <div className="project-tags-section">
        <h4>📁 Etiquetas de tu Proyecto ({tags.length})</h4>
        <div className="tags-grid">
          {tags.map(tag => (
            <div key={tag.id} className="tag-item">
              <span 
                className="tag-preview"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
              
              <div className="tag-info">
                <span className="tag-name">{tag.name}</span>
                <span className="tag-category">{tag.category}</span>
              </div>

              <div className="tag-actions">
                {!tag.predefined && (
                  <>
                    <button 
                      className="btn-edit"
                      onClick={() => startEditing(tag)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => deleteTag(tag.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </>
                )}
                {tag.predefined && (
                  <span className="predefined-badge" title="Predefinida">⭐</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="tags-stats">
        <div className="stat">
          <span className="stat-number">{tags.length}</span>
          <span className="stat-label">Total Etiquetas</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {tags.filter(t => t.predefined).length}
          </span>
          <span className="stat-label">Predefinidas</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {tags.filter(t => !t.predefined).length}
          </span>
          <span className="stat-label">Personalizadas</span>
        </div>
      </div>
    </div>
  )
}

export default TagManager