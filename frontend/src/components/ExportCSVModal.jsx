import { useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import './ExportCSVModal.css';

const ExportCSVModal = ({ project, photos, normalImages, onClose }) => {
  // Combinar todas las fotos e imágenes
  const allItems = [
    ...photos.map(p => ({ ...p, source: 'foto360' })),
    ...normalImages.map(i => ({ ...i, source: 'imagen' }))
  ];

  // Filtrar solo items con coordenadas
  const itemsWithCoords = allItems.filter(item => {
    const hasProjectCoords = item.project_x !== undefined && item.project_x !== null &&
                             item.project_y !== undefined && item.project_y !== null;
    const hasGeoCoords = item.geo_latitude !== undefined && item.geo_latitude !== null &&
                        item.geo_longitude !== undefined && item.geo_longitude !== null;
    const hasUTMCoords = item.utm_easting !== undefined && item.utm_easting !== null &&
                        item.utm_northing !== undefined && item.utm_northing !== null;
    return hasProjectCoords || hasGeoCoords || hasUTMCoords;
  });

  // Estados para checkboxes
  const [columns, setColumns] = useState({
    nombre: true,
    tipo: true,
    url: true,
    // Coordenadas locales
    local: true,
    localX: true,
    localY: true,
    localZ: true,
    // Coordenadas UTM
    utm: false,
    utmEasting: false,
    utmNorthing: false,
    utmZone: false,
    // Coordenadas geográficas
    geo: false,
    geoLatitude: false,
    geoLongitude: false,
    // Opcionales
    descripcion: false,
    fecha: false,
    origen: false
  });

  const [separator, setSeparator] = useState(';');

  const handleToggleColumn = (column) => {
    setColumns(prev => ({ ...prev, [column]: !prev[column] }));
  };

  const handleToggleGroup = (group) => {
    if (group === 'local') {
      const newValue = !columns.local;
      setColumns(prev => ({
        ...prev,
        local: newValue,
        localX: newValue,
        localY: newValue,
        localZ: newValue
      }));
    } else if (group === 'utm') {
      const newValue = !columns.utm;
      setColumns(prev => ({
        ...prev,
        utm: newValue,
        utmEasting: newValue,
        utmNorthing: newValue,
        utmZone: newValue
      }));
    } else if (group === 'geo') {
      const newValue = !columns.geo;
      setColumns(prev => ({
        ...prev,
        geo: newValue,
        geoLatitude: newValue,
        geoLongitude: newValue
      }));
    }
  };

  const handleExport = () => {
    if (itemsWithCoords.length === 0) {
      toast.error('No hay elementos con coordenadas para exportar');
      return;
    }

    // Construir encabezados según selección
    const headers = [];

    if (columns.nombre) headers.push('nombre_imagen');
    if (columns.tipo) headers.push('tipo');

    // Coordenadas locales
    if (columns.localX) headers.push('x_local');
    if (columns.localY) headers.push('y_local');
    if (columns.localZ) headers.push('z_local');

    // Coordenadas UTM
    if (columns.utmEasting) headers.push('utm_easting');
    if (columns.utmNorthing) headers.push('utm_northing');
    if (columns.utmZone) headers.push('utm_zone');

    // Coordenadas geográficas
    if (columns.geoLatitude) headers.push('latitud');
    if (columns.geoLongitude) headers.push('longitud');

    if (columns.descripcion) headers.push('descripcion');
    if (columns.fecha) headers.push('fecha');
    if (columns.origen) headers.push('origen_coordenadas');
    if (columns.url) headers.push('url');

    // Construir CSV
    let csv = headers.join(separator) + '\n';

    itemsWithCoords.forEach(item => {
      const row = [];

      if (columns.nombre) {
        const nombre = item.title || item.filename || 'sin_nombre';
        row.push(`"${nombre}"`);
      }

      if (columns.tipo) {
        const tipo = item.object_type || item.source || 'desconocido';
        row.push(tipo);
      }

      // Coordenadas locales
      if (columns.localX) row.push(item.project_x !== null && item.project_x !== undefined ? item.project_x.toFixed(6) : '');
      if (columns.localY) row.push(item.project_y !== null && item.project_y !== undefined ? item.project_y.toFixed(6) : '');
      if (columns.localZ) row.push(item.project_z !== null && item.project_z !== undefined ? item.project_z.toFixed(6) : '0.000000');

      // Coordenadas UTM
      if (columns.utmEasting) row.push(item.utm_easting !== null && item.utm_easting !== undefined ? item.utm_easting.toFixed(3) : '');
      if (columns.utmNorthing) row.push(item.utm_northing !== null && item.utm_northing !== undefined ? item.utm_northing.toFixed(3) : '');
      if (columns.utmZone) row.push(item.utm_zone || '');

      // Coordenadas geográficas
      if (columns.geoLatitude) row.push(item.geo_latitude !== null && item.geo_latitude !== undefined ? item.geo_latitude.toFixed(8) : '');
      if (columns.geoLongitude) row.push(item.geo_longitude !== null && item.geo_longitude !== undefined ? item.geo_longitude.toFixed(8) : '');

      if (columns.descripcion) {
        const desc = item.description || '';
        row.push(`"${desc}"`);
      }

      if (columns.fecha) {
        const fecha = item.created_at || item.uploaded_at || '';
        row.push(fecha);
      }

      if (columns.origen) row.push(item.coordinate_source || 'manual');

      if (columns.url) {
        const url = item.url || item.unique_url || '';
        row.push(`"${url}"`);
      }

      csv += row.join(separator) + '\n';
    });

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const downloadUrl = URL.createObjectURL(blob);
    link.setAttribute('href', downloadUrl);
    link.setAttribute('download', `${project.name}_Coordenadas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`✅ Exportado: ${itemsWithCoords.length} elementos`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content export-csv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FileText size={24} /> Exportar a CSV</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="export-info">
            <p>📊 <strong>{itemsWithCoords.length}</strong> elementos con coordenadas</p>
            <p>Selecciona las columnas que deseas exportar:</p>
          </div>

          {/* Columnas básicas */}
          <div className="column-group">
            <h3>Columnas Básicas</h3>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.nombre}
                  onChange={() => handleToggleColumn('nombre')}
                />
                <span>Nombre de imagen</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.tipo}
                  onChange={() => handleToggleColumn('tipo')}
                />
                <span>Tipo (foto360/imagen/incidencia)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.url}
                  onChange={() => handleToggleColumn('url')}
                />
                <span>URL de la imagen</span>
              </label>
            </div>
          </div>

          {/* Coordenadas locales */}
          <div className="column-group">
            <div className="group-header">
              <h3>Coordenadas Locales del Proyecto</h3>
              <label className="checkbox-label main-checkbox">
                <input
                  type="checkbox"
                  checked={columns.local}
                  onChange={() => handleToggleGroup('local')}
                />
                <span>Seleccionar todas</span>
              </label>
            </div>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.localX}
                  onChange={() => handleToggleColumn('localX')}
                />
                <span>X (local)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.localY}
                  onChange={() => handleToggleColumn('localY')}
                />
                <span>Y (local)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.localZ}
                  onChange={() => handleToggleColumn('localZ')}
                />
                <span>Z (local)</span>
              </label>
            </div>
          </div>

          {/* Coordenadas UTM */}
          <div className="column-group">
            <div className="group-header">
              <h3>Coordenadas UTM ETRS89</h3>
              <label className="checkbox-label main-checkbox">
                <input
                  type="checkbox"
                  checked={columns.utm}
                  onChange={() => handleToggleGroup('utm')}
                />
                <span>Seleccionar todas</span>
              </label>
            </div>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.utmEasting}
                  onChange={() => handleToggleColumn('utmEasting')}
                />
                <span>Easting (UTM)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.utmNorthing}
                  onChange={() => handleToggleColumn('utmNorthing')}
                />
                <span>Northing (UTM)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.utmZone}
                  onChange={() => handleToggleColumn('utmZone')}
                />
                <span>Zona UTM</span>
              </label>
            </div>
          </div>

          {/* Coordenadas geográficas */}
          <div className="column-group">
            <div className="group-header">
              <h3>Coordenadas Geográficas WGS84</h3>
              <label className="checkbox-label main-checkbox">
                <input
                  type="checkbox"
                  checked={columns.geo}
                  onChange={() => handleToggleGroup('geo')}
                />
                <span>Seleccionar todas</span>
              </label>
            </div>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.geoLatitude}
                  onChange={() => handleToggleColumn('geoLatitude')}
                />
                <span>Latitud</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.geoLongitude}
                  onChange={() => handleToggleColumn('geoLongitude')}
                />
                <span>Longitud</span>
              </label>
            </div>
          </div>

          {/* Columnas opcionales */}
          <div className="column-group">
            <h3>Columnas Opcionales</h3>
            <div className="checkbox-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.descripcion}
                  onChange={() => handleToggleColumn('descripcion')}
                />
                <span>Descripción</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.fecha}
                  onChange={() => handleToggleColumn('fecha')}
                />
                <span>Fecha de captura</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={columns.origen}
                  onChange={() => handleToggleColumn('origen')}
                />
                <span>Origen de coordenadas</span>
              </label>
            </div>
          </div>

          {/* Separador */}
          <div className="separator-selector">
            <label>
              <strong>Separador:</strong>
              <select value={separator} onChange={(e) => setSeparator(e.target.value)}>
                <option value=";">Punto y coma (;)</option>
                <option value=",">Coma (,)</option>
                <option value="\t">Tabulador (Tab)</option>
              </select>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportCSVModal;
