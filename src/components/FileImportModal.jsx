import React, { useState } from 'react';
import './FileImportModal.css';

const FileImportModal = ({ projectId, onClose, onImportComplete }) => {
  const [importing, setImporting] = useState(false);
  const [importType, setImportType] = useState('kml');

  const handleFileImport = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('type', importType);

      let endpoint = '';
      switch (importType) {
        case 'kml':
        case 'kmz':
          endpoint = `/projects/${projectId}/import/kml`;
          break;
        case 'dwg':
          endpoint = `/projects/${projectId}/import/dwg`;
          break;
        default:
          throw new Error('Tipo de archivo no soportado');
      }

      const response = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success(`✅ ${importType.toUpperCase()} importado correctamente`);
      if (onImportComplete) onImportComplete(response.data);
      
    } catch (error) {
      console.error('Error importando archivo:', error);
      toast.error(`❌ Error al importar ${importType.toUpperCase()}`);
    } finally {
      setImporting(false);
      onClose();
    }
  };

  return (
    <div className="file-import-overlay">
      <div className="file-import-modal">
        <div className="modal-header">
          <h3>🗂️ Importar Archivos GIS/CAD</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="import-options">
          <div className="option-group">
            <label>Tipo de Archivo:</label>
            <select 
              value={importType} 
              onChange={(e) => setImportType(e.target.value)}
            >
              <option value="kml">KML (Google Earth)</option>
              <option value="kmz">KMZ (Google Earth comprimido)</option>
              <option value="dwg">DWG (AutoCAD)</option>
            </select>
          </div>

          <div className="file-info">
            <h4>Formatos Soportados:</h4>
            <ul>
              <li>📁 <strong>KML/KMZ</strong> - Datos de Google Earth</li>
              <li>📐 <strong>DWG</strong> - Planos de AutoCAD</li>
            </ul>
            <p>Los archivos se procesarán y mostrarán en el mapa.</p>
          </div>

          <label className="file-input-label">
            <input
              type="file"
              accept={importType === 'dwg' ? '.dwg' : '.kml,.kmz'}
              onChange={handleFileImport}
              disabled={importing}
            />
            <span className="file-input-button">
              {importing ? '📤 Importando...' : `📁 Importar ${importType.toUpperCase()}`}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FileImportModal;