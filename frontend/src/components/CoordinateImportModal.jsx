import { useState } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../config/axios';
import toast from 'react-hot-toast';
import './CoordinateImportModal.css';

const CoordinateImportModal = ({ project, onClose, onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [coordinateType, setCoordinateType] = useState('');
  const [objectType, setObjectType] = useState('foto360');
  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extension = file.name.toLowerCase().split('.').pop();
    if (!['csv', 'txt', 'xlsx', 'xls'].includes(extension)) {
      toast.error('Formato no soportado. Use CSV, TXT o Excel');
      return;
    }

    setSelectedFile(file);
    setImportResult(null);

    // Leer y mostrar vista previa
    if (extension === 'csv' || extension === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').slice(0, 6); // Primeras 6 líneas
        setPreviewData({
          type: 'text',
          content: lines.join('\n')
        });
      };
      reader.readAsText(file);
    } else {
      setPreviewData({
        type: 'excel',
        content: `Archivo Excel: ${file.name}\nTamaño: ${(file.size / 1024).toFixed(2)} KB`
      });
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo');
      return;
    }

    if (!coordinateType) {
      toast.error('Selecciona el tipo de coordenadas');
      return;
    }

    setImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('coordinate_type', coordinateType);
      formData.append('object_type', objectType);

      const response = await api.post(
        `/projects/${project.id}/import-coordinates`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = response.data;
      setImportResult(result);

      if (result.errors && result.errors.length > 0) {
        toast.success(`Importación parcial: ${result.updated} actualizadas, ${result.errors.length} errores`);
      } else {
        toast.success(`¡Importación exitosa! ${result.updated} elementos actualizados`);
      }

      // Llamar callback para refrescar datos
      if (onImportSuccess) {
        setTimeout(() => {
          onImportSuccess();
        }, 1500);
      }
    } catch (error) {
      console.error('Error importing coordinates:', error);
      toast.error(error.response?.data?.detail || 'Error al importar coordenadas');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content coordinate-import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Importar Coordenadas</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          {/* Paso 1: Selección de archivo */}
          <div className="import-step">
            <h3>1. Selecciona el archivo</h3>
            <p className="step-description">
              Formatos soportados: CSV, TXT, Excel (.xlsx, .xls)
            </p>

            <div className="file-input-wrapper">
              <input
                type="file"
                id="coordinate-file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleFileSelect}
                disabled={importing}
              />
              <label htmlFor="coordinate-file" className="btn btn-secondary">
                <Upload size={18} />
                {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
              </label>
            </div>

            {previewData && (
              <div className="file-preview">
                <h4><FileText size={16} /> Vista previa:</h4>
                <pre>{previewData.content}</pre>
              </div>
            )}
          </div>

          {/* Paso 2: Tipo de coordenadas */}
          <div className="import-step">
            <h3>2. Tipo de coordenadas del archivo</h3>
            <p className="step-description">
              Indica qué tipo de coordenadas contiene el archivo
            </p>

            <div className="coordinate-type-selector">
              <label className={`coordinate-type-option ${coordinateType === 'local' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="coordinate_type"
                  value="local"
                  checked={coordinateType === 'local'}
                  onChange={(e) => setCoordinateType(e.target.value)}
                  disabled={importing}
                />
                <div className="option-content">
                  <strong>Coordenadas Locales del Proyecto</strong>
                  <small>X, Y, Z relativos (origen arbitrario)</small>
                </div>
              </label>

              <label className={`coordinate-type-option ${coordinateType === 'utm' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="coordinate_type"
                  value="utm"
                  checked={coordinateType === 'utm'}
                  onChange={(e) => setCoordinateType(e.target.value)}
                  disabled={importing}
                />
                <div className="option-content">
                  <strong>Coordenadas UTM ETRS89 Reales</strong>
                  <small>Easting, Northing, altitud (coordenadas absolutas)</small>
                </div>
              </label>

              <label className={`coordinate-type-option ${coordinateType === 'geo' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="coordinate_type"
                  value="geo"
                  checked={coordinateType === 'geo'}
                  onChange={(e) => setCoordinateType(e.target.value)}
                  disabled={importing}
                />
                <div className="option-content">
                  <strong>Coordenadas Geográficas WGS84</strong>
                  <small>Latitud, Longitud, altitud</small>
                </div>
              </label>
            </div>
          </div>

          {/* Paso 3: Tipo de objeto */}
          <div className="import-step">
            <h3>3. Tipo de elemento (opcional)</h3>
            <select
              value={objectType}
              onChange={(e) => setObjectType(e.target.value)}
              disabled={importing}
              className="input"
            >
              <option value="foto360">Foto 360°</option>
              <option value="imagen">Imagen Normal</option>
              <option value="incidencia">Incidencia</option>
            </select>
          </div>

          {/* Resultado de importación */}
          {importResult && (
            <div className={`import-result ${importResult.errors ? 'warning' : 'success'}`}>
              {importResult.errors ? (
                <AlertCircle size={20} />
              ) : (
                <CheckCircle size={20} />
              )}
              <div className="result-content">
                <h4>Resultado de la importación</h4>
                <p>Total de filas: {importResult.total_rows}</p>
                <p>Elementos actualizados: {importResult.updated}</p>
                {importResult.errors && importResult.errors.length > 0 && (
                  <details>
                    <summary>Errores ({importResult.errors.length})</summary>
                    <ul>
                      {importResult.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          )}

          {/* Formato esperado */}
          <div className="format-info">
            <h4>Formato esperado del archivo:</h4>
            <pre>
{`nombre_imagen;x;y;z
IMG_001.jpg;-8.11285;-90.52344;19.05760
IMG_002.jpg;-8.15432;-91.23456;19.12345

O también:
nombre,x,y,z,tipo
foto1.jpg,10.5,20.3,1.5,foto360`}
            </pre>
            <small>
              * Las columnas pueden tener nombres alternativos<br />
              * El separador puede ser ; , o tab (se detecta automáticamente)
            </small>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={importing}
          >
            {importResult ? 'Cerrar' : 'Cancelar'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleImport}
            disabled={!selectedFile || !coordinateType || importing}
          >
            {importing ? 'Importando...' : 'Importar Coordenadas'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoordinateImportModal;
