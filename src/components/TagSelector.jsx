import { useState, useEffect } from 'react'
import './TagSelector.css'

const TagSelector = ({ 
  projectId, 
  selectedTags = [], 
  onTagsChange, 
  availableTags = [],
  maxHeight = 200 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [tags, setTags] = useState([])

  useEffect(() => {
    if (availableTags.length > 0) {
      setTags(availableTags)
    } else {
      // Cargar tags del localStorage si no se proporcionan
      const savedTags = JSON.parse(localStorage.getItem(`project_${projectId}_tags`) || '[]')
      const predefinedTags = [
        { id: 'p00', name: 'P00', color: '#3b82f6', predefined: true, category: 'Planta' },
        { id: 'p01', name: 'P01', color: '#3b82f6', predefined: true, category: 'Planta' },
        { id: 'p02', name: 'P02', color: '#3b82f6', predefined: true, category: 'Planta' },
        { id: 'p03', name: 'P03', color: '#3b82f6', predefined: true, category: 'Planta' },
        { id: 'p04', name: 'P04', color: '#3b82f6', predefined: true, category: 'Planta' },
        { id: 'salon', name: 'Salon', color: '#f59e0b', predefined: true, category: 'Espacio' },
        { id: 'cocina', name: 'Cocina', color: '#f59e0b', predefined: true, category: 'Espacio' },
        { id: 'baño', name: 'Baño', color: '#f59e0b', predefined: true, category: 'Espacio' },
        { id: 'dormitorio', name: 'Dormitorio', color: '#f59e0b', predefined: true, category: 'Espacio' },
      ]
      setTags([...predefinedTags, ...savedTags])
    }
  }, [projectId, availableTags])

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleTag = (tag) => {
    const isSelected = selectedTags.find(t => t.id === tag.id)
    let newSelectedTags

    if (isSelected) {
      newSelectedTags = selectedTags.filter(t => t.id !== tag.id)
    } else {
      newSelectedTags = [...selectedTags, tag]
    }

    if (onTagsChange) {
      onTagsChange(newSelectedTags)
    }
  }

  const removeTag = (tagId, e) => {
    e.stopPropagation()
    const newSelectedTags = selectedTags.filter(t => t.id !== tagId)
    if (onTagsChange) {
      onTagsChange(newSelectedTags)
    }
  }

  const clearAllTags = () => {
    if (onTagsChange) {
      onTagsChange([])
    }
  }

  const categories = [...new Set(tags.map(tag => tag.category))]

  return (
    <div className="tag-selector">
      {/* Campo de selección */}
      <div 
        className="selector-input"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="selected-tags">
          {selectedTags.length > 0 ? (
            selectedTags.map(tag => (
              <span
                key={tag.id}
                className="selected-tag"
                style={{ backgroundColor: tag.color }}
                onClick={(e) => removeTag(tag.id, e)}
              >
                {tag.name}
                <span className="remove-tag">×</span>
              </span>
            ))
          ) : (
            <span className="placeholder">Selecciona etiquetas...</span>
          )}
        </div>
        
        <div className="selector-actions">
          {selectedTags.length > 0 && (
            <span className="tag-count">{selectedTags.length}</span>
          )}
          <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        </div>
      </div>

      {/* Panel desplegable */}
      {isOpen && (
        <div className="dropdown-panel" style={{ maxHeight }}>
          {/* Barra de búsqueda */}
          <div className="search-section">
            <input
              type="text"
              placeholder="Buscar etiquetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
            {selectedTags.length > 0 && (
              <button 
                className="clear-all-btn"
                onClick={clearAllTags}
                title="Quitar todas las etiquetas"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Lista de etiquetas por categoría */}
          <div className="tags-list">
            {categories.map(category => {
              const categoryTags = filteredTags.filter(tag => tag.category === category)
              if (categoryTags.length === 0) return null

              return (
                <div key={category} className="category-section">
                  <div className="category-header">
                    <span className="category-name">{category}</span>
                    <span className="category-count">{categoryTags.length}</span>
                  </div>
                  
                  <div className="category-tags">
                    {categoryTags.map(tag => {
                      const isSelected = selectedTags.find(t => t.id === tag.id)
                      return (
                        <div
                          key={tag.id}
                          className={`tag-option ${isSelected ? 'selected' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          <span 
                            className="tag-color-dot"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="tag-name">{tag.name}</span>
                          {isSelected && (
                            <span className="checkmark">✓</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {filteredTags.length === 0 && (
              <div className="no-results">
                No se encontraron etiquetas
              </div>
            )}
          </div>

          {/* Información rápida */}
          <div className="selection-info">
            <span>{selectedTags.length} etiqueta(s) seleccionada(s)</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TagSelector