import React, { useState, useEffect } from 'react';
import Viewer360 from './Viewer360';
import Map2D from './Map2D';
import PlanViewer from './PlanViewer';
import MobileCapture from './MobileCapture';
import '../styles/ViewerEnhanced.css';

const ViewerEnhanced = ({ project }) => {
  const [viewMode, setViewMode] = useState('3d');
  const [showMobileCapture, setShowMobileCapture] = useState(false);
  const [uploadedPlans, setUploadedPlans] = useState([]);

  // Detectar si es móvil
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Efecto para cargar planos guardados
  useEffect(() => {
    // Aquí cargarías los planos desde tu API
    const savedPlans = JSON.parse(localStorage.getItem(`project_${project.id}_plans`) || '[]');
    setUploadedPlans(savedPlans);
  }, [project.id]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newPlans = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.name.split('.').pop().toLowerCase(),
      file: file,
      url: URL.createObjectURL(file)
    }));

    const updatedPlans = [...uploadedPlans, ...newPlans];
    setUploadedPlans(updatedPlans);
    localStorage.setItem(`project_${project.id}_plans`, JSON.stringify(updatedPlans));
    event.target.value = ''; // Reset input
  };

  const exportToRevit = () => {
    // Preparar datos para exportación
    const exportData = {
      project: project.name,
      timestamp: new Date().toISOString(),
      points: project.images.map(img => ({
        name: img.name,
        x: img.x * 100000, // Convertir a coordenadas reales
        y: img.y * 100000,
        z: img.z * 100000,
        image_url: img.url,
        type: '360_photo'
      }))
    };

    // Crear y descargar CSV
    const csvContent = "Name,X,Y,Z,Image_URL,Type\n" +
      exportData.points.map(point => 
        `"${point.name}",${point.x},${point.y},${point.z},"${point.image_url}","${point.type}"`
      ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `revit_export_${project.name}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert('✅ CSV exportado para Revit');
  };

  return (
    <div className="viewer-enhanced">
      {/* Barra de herramientas superior */}
      <div className="viewer-toolbar">
        <div className="view-mode-selector">
          <button 
            className={viewMode === '3d' ? 'active' : ''}
            onClick={() => setViewMode('3d')}
            title="Vista 3D"
          >
            🌐 3D
          </button>
          <button 
            className={viewMode === '2d' ? 'active' : ''}
            onClick={() => setViewMode('2d')}
            title="Mapa 2D"
          >
            🗺️ Mapa
          </button>
          <button 
            className={viewMode === 'planos' ? 'active' : ''}
            onClick={() => setViewMode('planos')}
            title="Planos y documentos"
          >
            📋 Planos
          </button>
        </div>

        <div className="toolbar-actions">
          {/* Solo mostrar en móvil */}
          {isMobile && (
            <button 
              className="capture-btn"
              onClick={() => setShowMobileCapture(!showMobileCapture)}
              title="Capturar foto en obra"
            >
              📸 Capturar
            </button>
          )}
          
          {/* Selector de archivos */}
          <label className="file-upload-btn" title="Cargar planos (PDF/DWG/IFC)">
            📁 Cargar Planos
            <input 
              type="file" 
              multiple 
              accept=".pdf,.dwg,.ifc,.jpg,.png,.dxf"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>

          {/* Exportación */}
          <button 
            className="export-btn"
            onClick={exportToRevit}
            title="Exportar a Revit"
          >
            📤 Exportar
          </button>
        </div>
      </div>

      {/* Contenedor principal de visualización */}
      <div className="viewer-container">
        {viewMode === '3d' && <Viewer360 project={project} />}
        
        {viewMode === '2d' && (
          <Map2D 
            project={project} 
            onPointSelect={(point) => console.log('Point selected:', point)}
          />
        )}
        
        {viewMode === 'planos' && (
          <PlanViewer 
            plans={uploadedPlans}
            onPlanSelect={(plan) => console.log('Plan selected:', plan)}
          />
        )}
      </div>

      {/* Panel de captura móvil (solo en móvil) */}
      {isMobile && showMobileCapture && (
        <MobileCapture 
          projectId={project.id}
          onCaptureComplete={(photoData) => {
            console.log('Foto capturada:', photoData);
            setShowMobileCapture(false);
            // Aquí integrarías con tu API para guardar la foto
          }}
          onClose={() => setShowMobileCapture(false)}
        />
      )}

      {/* Información del proyecto */}
      <div className="project-info">
        <h3>{project.name}</h3>
        <p>{project.images.length} puntos de captura</p>
        <p>{uploadedPlans.length} planos cargados</p>
      </div>
    </div>
  );
};

export default ViewerEnhanced;