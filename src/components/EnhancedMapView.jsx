import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EnhancedMapView.css';
import MobileCaptureModal from './MobileCaptureModal';
import LevelManager from './LevelManager';

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EnhancedMapView = ({ photos = [], project, onClose, onPhotoCapture }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  
  // Estados principales
  const [userLocation, setUserLocation] = useState(null);
  const [activeBaseLayer, setActiveBaseLayer] = useState('satellite');
  const [mapMode, setMapMode] = useState('view');
  const [projectOrigin, setProjectOrigin] = useState(() => {
    const saved = localStorage.getItem(`project_origin_${project?.id}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [projectRotation, setProjectRotation] = useState(() => {
    const saved = localStorage.getItem(`project_rotation_${project?.id}`);
    return saved ? parseFloat(saved) : 0;
  });
  
  // Estados para captura móvil
  const [showMobileCapture, setShowMobileCapture] = useState(false);
  const [mobileCapturePosition, setMobileCapturePosition] = useState(null);
  
  // Estados para rotación
  const [rotationAngle, setRotationAngle] = useState('');
  const [isRotating, setIsRotating] = useState(false);
  const [tempRotation, setTempRotation] = useState(0);

  // ✅ NUEVOS ESTADOS
  const [showFileImport, setShowFileImport] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImageForMap, setSelectedImageForMap] = useState(null);
  const [levels, setLevels] = useState([]);
  const [showLevelManager, setShowLevelManager] = useState(false);

  // Referencias para las capas base
  const baseLayersRef = useRef({});

  // ✅ FUNCIÓN DE NOTIFICACIÓN
  const showNotification = useCallback((message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = 'map-notification';
    notification.textContent = message;
    
    const backgroundColor = type === 'success' ? '#2ecc71' : 
                           type === 'warning' ? '#f39c12' : 
                           '#e74c3c';
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${backgroundColor};
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      z-index: 10002;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }, []);

  // Detectar si es dispositivo móvil
  const isMobileDevice = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Inicializar capas base
  const initializeBaseLayers = useCallback(() => {
    if (!mapInstance.current) return;

    // Capa Satélite (Esri)
    baseLayersRef.current.satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, Maxar, Earthstar Geographics',
        maxZoom: 22,
        minZoom: 1
      }
    );

    // Capa OSM (OpenStreetMap)
    baseLayersRef.current.osm = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 22,
        minZoom: 1
      }
    );

    // Capa Híbrida (Google)
    baseLayersRef.current.hybrid = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        attribution: '© Google',
        maxZoom: 22,
        minZoom: 1,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }
    );
  }, []);

  // Cambiar capa base
  const changeBaseLayer = useCallback((layerKey) => {
    if (!mapInstance.current || !baseLayersRef.current[layerKey]) return;

    Object.values(baseLayersRef.current).forEach(layer => {
      if (layer && mapInstance.current.hasLayer(layer)) {
        mapInstance.current.removeLayer(layer);
      }
    });

    try {
      baseLayersRef.current[layerKey].addTo(mapInstance.current);
      setActiveBaseLayer(layerKey);
      showNotification(`Mapa cambiado a ${layerKey}`);
    } catch (error) {
      console.error('Error añadiendo capa:', error);
      showNotification('Error al cambiar mapa', 'error');
    }
  }, [showNotification]);

  // ✅ FUNCIÓN: Subir imagen desde portátil y colocarla en mapa
  const handleImageUploadForMap = useCallback((e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setSelectedImageForMap(file);
    setShowImageUpload(false);
    
    showNotification('📸 Imagen seleccionada. Haz clic en el mapa para colocarla');
  }, [showNotification]);

  // ✅ FUNCIÓN: Convertir coordenadas reales a coordenadas de proyecto
  const convertRealToProjectCoords = useCallback((lat, lng, rotation = projectRotation) => {
    if (!projectOrigin) return { x: 0, y: 0 };

    const deltaLat = lat - projectOrigin[0];
    const deltaLng = lng - projectOrigin[1];

    const angleRad = (rotation * Math.PI) / 180;
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);

    // Rotar inversamente
    const x = (deltaLng * cosAngle - deltaLat * sinAngle) * 100000;
    const y = (deltaLng * sinAngle + deltaLat * cosAngle) * 100000;

    return { x: Math.round(x), y: Math.round(y) };
  }, [projectOrigin, projectRotation]);

  // ✅ FUNCIÓN CORREGIDA: Colocar imagen en mapa con etiquetas
  const handlePlaceImageOnMap = useCallback(async (e) => {
    if (!selectedImageForMap) return;

    const { lat, lng } = e.latlng;
    
    // ✅ ABRIR MODAL DE ETIQUETAS (igual que en móvil)
    setMobileCapturePosition({ lat, lng });
    setShowMobileCapture(true);
    
  }, [selectedImageForMap]);

  // ✅ FUNCIÓN CORREGIDA: Guardar captura (móvil Y portátil)
  const handleMobileCaptureSave = useCallback(async (imageData) => {
    try {
      console.log('💾 Guardando imagen con coordenadas:', imageData);
      
      // ✅ CALCULAR COORDENADAS DEL PROYECTO
      const projectCoords = convertRealToProjectCoords(
        imageData.latitude, 
        imageData.longitude
      );
      
      // ✅ SI ES PORTÁTIL: Subir a Cloudinary
      if (selectedImageForMap && !imageData.file) {
        const formData = new FormData();
        formData.append('file', selectedImageForMap);
        formData.append('upload_preset', 'photosite360');

        const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dryuzad8w/image/upload', {
          method: 'POST',
          body: formData
        });
        
        const cloudinaryData = await cloudinaryResponse.json();

        if (cloudinaryData.secure_url) {
          imageData = {
            ...imageData,
            file: selectedImageForMap,
            url: cloudinaryData.secure_url,
            latitude: mobileCapturePosition.lat,
            longitude: mobileCapturePosition.lng,
            // ✅ AÑADIR COORDENADAS DEL PROYECTO
            projectX: projectCoords.x,
            projectY: projectCoords.y,
            projectZ: imageData.finalZ || 0,
            filename: selectedImageForMap.name,
            uploaded_at: new Date().toISOString(),
            type: 'normal',
            // ✅ MARCADOR EDITABLE
            editable: true
          };
        }
      }

      // ✅ AÑADIR COORDENADAS A TODAS LAS IMÁGENES
      imageData = {
        ...imageData,
        projectX: projectCoords.x,
        projectY: projectCoords.y,
        projectZ: imageData.finalZ || 0,
        editable: true
      };

      if (onPhotoCapture) {
        await onPhotoCapture(imageData);
      }
      
      showNotification(`✅ Imagen guardada - X:${projectCoords.x}, Y:${projectCoords.y}, Z:${imageData.finalZ || 0}`);
      setShowMobileCapture(false);
      setSelectedImageForMap(null);
      
    } catch (error) {
      console.error('❌ Error guardando imagen:', error);
      showNotification('❌ Error al guardar la imagen', 'error');
    }
  }, [onPhotoCapture, showNotification, selectedImageForMap, mobileCapturePosition, convertRealToProjectCoords]);

  // ✅ FUNCIÓN: Hacer marcador editable/movible
  const makeMarkerEditable = useCallback((marker, photo) => {
    if (!photo.editable) return;

    marker.dragging?.enable();
    
    marker.on('dragend', function(e) {
      const newLatLng = e.target.getLatLng();
      const newCoords = convertRealToProjectCoords(newLatLng.lat, newLatLng.lng);
      
      showNotification(`📍 Marcador movido - Nuevas coord: X:${newCoords.x}, Y:${newCoords.y}`);
      
      // ✅ ACTUALIZAR COORDENADAS EN LA BASE DE DATOS
      if (onPhotoCapture) {
        onPhotoCapture({
          ...photo,
          latitude: newLatLng.lat,
          longitude: newLatLng.lng,
          projectX: newCoords.x,
          projectY: newCoords.y,
          updatePosition: true
        });
      }
    });
  }, [convertRealToProjectCoords, showNotification, onPhotoCapture]);

  // ✅ FUNCIÓN ÚNICA: Manejar click en el mapa
  const handleMapClick = useCallback((e) => {
    const { lat, lng } = e.latlng;
    
    if (mapMode === 'placeOrigin') {
      setProjectOrigin([lat, lng]);
      setMapMode('view');
      showNotification('✅ Origen del proyecto guardado correctamente');
    } else if (mapMode === 'capturePhoto') {
      if (isMobileDevice()) {
        setMobileCapturePosition({ lat, lng });
        setShowMobileCapture(true);
        showNotification('📱 Modo móvil: Abriendo cámara...');
      } else {
        // ✅ NUEVO: En portátil, abrir selector de imagen
        setMobileCapturePosition({ lat, lng });
        setShowImageUpload(true);
        showNotification('🖥️ Selecciona una imagen para colocar en el mapa');
      }
    } else if (selectedImageForMap) {
      // ✅ NUEVO: Colocar imagen seleccionada
      handlePlaceImageOnMap(e);
    }
  }, [mapMode, isMobileDevice, selectedImageForMap, handlePlaceImageOnMap, showNotification]);

  // Convertir coordenadas del proyecto a coordenadas reales
  const convertToRealLatLng = useCallback((x, y, rotation = projectRotation) => {
    if (!projectOrigin) {
      return [40.4168 + (parseFloat(y) / 1000), -3.7038 + (parseFloat(x) / 1000)];
    }

    const angleRad = (-rotation * Math.PI) / 180;
    const cosAngle = Math.cos(angleRad);
    const sinAngle = Math.sin(angleRad);
    
    const rotatedX = (parseFloat(x) * cosAngle - parseFloat(y) * sinAngle) / 100000;
    const rotatedY = (parseFloat(x) * sinAngle + parseFloat(y) * cosAngle) / 100000;

    return [
      projectOrigin[0] + rotatedY,
      projectOrigin[1] + rotatedX
    ];
  }, [projectOrigin, projectRotation]);

  // ✅ FUNCIÓN COMPLETA CORREGIDA: Actualizar marcadores
  const updateMarkers = useCallback(() => {
    if (!mapInstance.current) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => {
      if (marker && mapInstance.current) {
        mapInstance.current.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Marcador de origen del proyecto
    if (projectOrigin) {
      const currentRotation = isRotating ? tempRotation : projectRotation;
      
      const originIcon = L.divIcon({
        className: 'origin-marker',
        html: `
          <div class="marker-pin origin-pin" style="transform: rotate(${currentRotation}deg)">
            <span>🏁</span>
            <div class="rotation-line"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });

      const originMarker = L.marker(projectOrigin, { 
        icon: originIcon,
        draggable: mapMode === 'moveProject'
      })
      .bindPopup(`
        <div class="origin-popup">
          <h4>📍 Origen del Proyecto</h4>
          <p><strong>Proyecto:</strong> ${project?.name}</p>
          <p><strong>Rotación:</strong> ${currentRotation.toFixed(1)}°</p>
          <p><strong>Coordenadas:</strong></p>
          <p>Lat: ${projectOrigin[0].toFixed(6)}</p>
          <p>Lng: ${projectOrigin[1].toFixed(6)}</p>
        </div>
      `)
      .addTo(mapInstance.current)
      .on('dragend', (e) => {
        if (mapMode === 'moveProject') {
          const newOrigin = e.target.getLatLng();
          setProjectOrigin([newOrigin.lat, newOrigin.lng]);
          showNotification('📍 Origen movido - Guarda los cambios');
        }
      });

      markersRef.current.push(originMarker);

      // Línea de dirección
      const angleRad = (currentRotation * Math.PI) / 180;
      const endPoint = L.latLng(
        projectOrigin[0] + Math.cos(angleRad) * 0.001,
        projectOrigin[1] + Math.sin(angleRad) * 0.001
      );

      const directionLine = L.polyline([projectOrigin, endPoint], {
        color: '#e74c3c',
        weight: 3,
        opacity: 0.7,
        dashArray: '5, 10'
      }).addTo(mapInstance.current);

      markersRef.current.push(directionLine);
    }

    // Marcadores de fotos
    photos.forEach((photo, index) => {
      if (!photo.latitude || !photo.longitude) return;

      // ✅ DECLARAR isNormalImage FUERA del try para evitar errores
      const isNormalImage = photo.type === 'normal';
      
      try {
        let photoLatLng;
        
        if (photo.type === 'normal' && photo.realLocation) {
          // Imágenes normales con ubicación real
          photoLatLng = [photo.realLocation.lat, photo.realLocation.lng];
        } else {
          // Fotos 360° con coordenadas del proyecto
          const currentRotation = isRotating ? tempRotation : projectRotation;
          photoLatLng = convertToRealLatLng(photo.latitude, photo.longitude, currentRotation);
        }
        
        const markerNumber = index + 1;
        
        const photoIcon = L.divIcon({
          className: `photo-marker ${isNormalImage ? 'normal-photo' : 'photo-360'}`,
          html: `
            <div class="marker-pin ${isNormalImage ? 'normal-pin' : 'photo-pin'}">
              <span class="marker-number">${markerNumber}</span>
              <div class="marker-badge">${isNormalImage ? '🖼️' : '📸'}</div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 36]
        });

        const imageUrl = photo.url?.startsWith('http') 
          ? photo.url 
          : `${import.meta.env.VITE_API_URL}${photo.url || ''}`;

        // ✅ AHORA isNormalImage ESTÁ DISPONIBLE
        const popupContent = isNormalImage ? `
          <div class="photo-popup">
            <h4>🖼️ ${photo.title || 'Imagen'}</h4>
            <img src="${imageUrl}" alt="${photo.title}" 
                 style="max-width: 200px; max-height: 150px; border-radius: 6px; margin: 6px 0;" />
            <div class="popup-info">
              <p><strong>Nivel:</strong> ${photo.level || 'No especificado'}</p>
              <p><strong>Habitación:</strong> ${photo.room || 'No especificado'}</p>
              <p><strong>PK:</strong> ${photo.pk || 'No especificado'}</p>
              <p><strong>Coordenadas:</strong> ${photoLatLng[0].toFixed(6)}, ${photoLatLng[1].toFixed(6)}</p>
              ${photo.comment ? `<p><strong>Comentario:</strong> ${photo.comment}</p>` : ''}
            </div>
            <div class="popup-actions">
              <button onclick="window.open('${imageUrl}', '_blank')" class="popup-btn">
                🔍 Ver Imagen
              </button>
            </div>
          </div>
        ` : `
          <div class="photo-popup">
            <h4>📸 ${photo.title || 'Foto 360°'}</h4>
            <img src="${imageUrl}" alt="${photo.title}" 
                 style="max-width: 200px; max-height: 150px; border-radius: 6px; margin: 6px 0;" />
            <div class="popup-info">
              <p><strong>Coordenadas Proyecto:</strong> ${photo.latitude}, ${photo.longitude}</p>
              <p><strong>Coordenadas Reales:</strong> ${photoLatLng[0].toFixed(6)}, ${photoLatLng[1].toFixed(6)}</p>
              ${photo.description ? `<p><strong>Descripción:</strong> ${photo.description}</p>` : ''}
            </div>
            <div class="popup-actions">
              <a href="/projects/${project?.id}/view/${photo.id}" class="popup-btn" target="_blank">
                🔍 Ver 360°
              </a>
            </div>
          </div>
        `;

        const marker = L.marker(photoLatLng, { 
          icon: photoIcon,
          draggable: photo.editable || false  // ✅ HACER EDITABLE SI CORRESPONDE
        })
        .bindPopup(popupContent)
        .addTo(mapInstance.current);

        // ✅ HACER MOVIBLE SI ES EDITABLE
        if (photo.editable) {
          makeMarkerEditable(marker, photo);
        }

        markersRef.current.push(marker);

      } catch (error) {
        console.error('Error creando marcador para foto:', error, photo);
        // Continuar con la siguiente foto sin bloquear toda la función
      }
    });

    // Ajustar vista si hay marcadores
    if (markersRef.current.length > 0 && mapInstance.current) {
      const group = L.featureGroup(markersRef.current);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [photos, project, projectOrigin, projectRotation, isRotating, tempRotation, mapMode, convertToRealLatLng, makeMarkerEditable]);

  // Efecto principal: Inicializar mapa
  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      const initialCenter = projectOrigin || [40.4168, -3.7038];
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: true,
        maxZoom: 22,
        minZoom: 1,
        zoomSnap: 0.1,
        zoomDelta: 0.5
      }).setView(initialCenter, projectOrigin ? 18 : 6);
      
      initializeBaseLayers();
      
      if (baseLayersRef.current.satellite) {
        baseLayersRef.current.satellite.addTo(mapInstance.current);
      }
      
      mapInstance.current.on('click', handleMapClick);
    }

    updateMarkers();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.off('click', handleMapClick);
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [projectOrigin, projectRotation, isRotating, tempRotation, handleMapClick, initializeBaseLayers, updateMarkers]);

  // Efectos para persistencia
  useEffect(() => {
    if (projectOrigin) {
      localStorage.setItem(`project_origin_${project?.id}`, JSON.stringify(projectOrigin));
    }
  }, [projectOrigin, project?.id]);

  useEffect(() => {
    localStorage.setItem(`project_rotation_${project?.id}`, projectRotation.toString());
  }, [projectRotation, project?.id]);

  // ✅ FUNCIÓN MEJORADA: Ubicación en tiempo real
  const locateUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          const userIcon = L.divIcon({
            className: 'user-marker',
            html: `
              <div class="marker-pin user-pin">
                <span>📍</span>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 28]
          });

          const userMarker = L.marker([latitude, longitude], { icon: userIcon })
            .bindPopup(`
              <div class="user-popup">
                <h4>📍 Tu Ubicación Actual</h4>
                <p>Lat: ${latitude.toFixed(6)}</p>
                <p>Lng: ${longitude.toFixed(6)}</p>
              </div>
            `)
            .addTo(mapInstance.current);

          markersRef.current.push(userMarker);
          
          // Centrar mapa en ubicación
          mapInstance.current.setView([latitude, longitude], 18);
          
          showNotification('📍 Ubicación encontrada');
        },
        (error) => {
          console.error('Error ubicación:', error);
          showNotification('❌ No se pudo obtener la ubicación', 'error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      showNotification('❌ Geolocalización no soportada', 'error');
    }
  }, [showNotification]);

  // Funciones de rotación
  const rotateProject = useCallback((degrees) => {
    if (isRotating) {
      setTempRotation(prev => (prev + degrees) % 360);
    } else {
      setProjectRotation(prev => (prev + degrees) % 360);
    }
  }, [isRotating]);

  const applyRotation = useCallback(() => {
    const angle = parseFloat(rotationAngle);
    if (!isNaN(angle)) {
      if (isRotating) {
        setTempRotation(angle % 360);
      } else {
        setProjectRotation(angle % 360);
      }
      setRotationAngle('');
      showNotification(`🔄 Rotación aplicada: ${angle}°`);
    }
  }, [rotationAngle, isRotating, showNotification]);

  const startRotation = useCallback(() => {
    setIsRotating(true);
    setTempRotation(projectRotation);
    setMapMode('rotateProject');
    showNotification('🔄 Modo rotación activado - Gira el proyecto manualmente');
  }, [projectRotation, showNotification]);

  const saveRotation = useCallback(() => {
    setProjectRotation(tempRotation);
    setIsRotating(false);
    setMapMode('view');
    showNotification('💾 Rotación guardada correctamente');
  }, [tempRotation, showNotification]);

  const cancelRotation = useCallback(() => {
    setIsRotating(false);
    setMapMode('view');
    showNotification('❌ Rotación cancelada');
  }, [showNotification]);

  const startMoveProject = useCallback(() => {
    setMapMode('moveProject');
    showNotification('🚀 Modo mover proyecto activado - Arrastra el marcador de origen');
  }, [showNotification]);

  const saveMoveProject = useCallback(() => {
    setMapMode('view');
    showNotification('💾 Ubicación del proyecto guardada');
  }, [showNotification]);

  const cancelMoveProject = useCallback(() => {
    setMapMode('view');
    showNotification('❌ Movimiento cancelado');
  }, [showNotification]);

  // Memoizar la rotación actual
  const currentRotation = useMemo(() => {
    return isRotating ? tempRotation : projectRotation;
  }, [isRotating, tempRotation, projectRotation]);

  return (
    <div className="enhanced-map-view">
      <div className="map-header">
        <div className="map-title">
          <h2>🗺️ Mapa Avanzado - {project?.name}</h2>
          <p>Gestiona tu proyecto en el mapa real {isMobileDevice() && '📱'}</p>
        </div>
        <button className="btn-close-map" onClick={onClose}>
          ✕ Cerrar
        </button>
      </div>

      <div className="map-controls-top">
        <div className="control-section">
          <h4>Modo de Trabajo</h4>
          <div className="control-group">
            <button 
              className={`control-btn ${mapMode === 'view' ? 'active' : ''}`}
              onClick={() => setMapMode('view')}
            >
              👁️ Navegar
            </button>
            <button 
              className={`control-btn ${mapMode === 'placeOrigin' ? 'active' : ''}`}
              onClick={() => setMapMode('placeOrigin')}
            >
              🏁 Colocar Origen
            </button>
            <button 
              className={`control-btn ${mapMode === 'capturePhoto' ? 'active' : ''}`}
              onClick={() => setMapMode('capturePhoto')}
            >
              📸 Capturar Foto
              {isMobileDevice() && <span style={{fontSize: '10px', display: 'block'}}>(Modo Móvil)</span>}
            </button>
          </div>
        </div>

        <div className="control-section">
          <h4>Mapa Base</h4>
          <div className="control-group">
            <button
              className={`control-btn ${activeBaseLayer === 'satellite' ? 'active' : ''}`}
              onClick={() => changeBaseLayer('satellite')}
            >
              🛰️ Satélite
            </button>
            <button
              className={`control-btn ${activeBaseLayer === 'osm' ? 'active' : ''}`}
              onClick={() => changeBaseLayer('osm')}
            >
              🗺️ OSM
            </button>
            <button
              className={`control-btn ${activeBaseLayer === 'hybrid' ? 'active' : ''}`}
              onClick={() => changeBaseLayer('hybrid')}
            >
              🌍 Híbrido
            </button>
          </div>
        </div>

        {/* ✅ NUEVA SECCIÓN: Herramientas Avanzadas */}
        <div className="control-section">
          <h4>Herramientas Avanzadas</h4>
          <div className="control-group">
            <button className="control-btn" onClick={locateUser}>
              📍 Mi Ubicación
            </button>
            <button 
              className="control-btn"
              onClick={() => setShowFileImport(true)}
            >
              🗂️ Importar GIS/CAD
            </button>
            <button 
              className="control-btn"
              onClick={() => setShowImageUpload(true)}
              disabled={selectedImageForMap}
            >
              📸 Colocar Imagen
            </button>
            <button 
              className="control-btn"
              onClick={() => setShowLevelManager(true)}
            >
              🏗️ Gestionar Niveles
            </button>
          </div>
        </div>
      </div>

      {projectOrigin && (
        <div className="map-controls-bottom">
          <div className="project-controls">
            <h4>Control del Proyecto</h4>
            <div className="control-group">
              <div className="coord-display">
                <span>Origen: {projectOrigin[0].toFixed(6)}, {projectOrigin[1].toFixed(6)}</span>
                <span>Rotación: {currentRotation.toFixed(1)}°</span>
              </div>
              
              <div className="rotation-controls">
                <div className="rotation-input-group">
                  <input
                    type="number"
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(e.target.value)}
                    placeholder="Ángulo (0-360)"
                    min="0"
                    max="360"
                    step="0.1"
                    className="rotation-input"
                  />
                  <button className="control-btn small" onClick={applyRotation}>
                    Aplicar
                  </button>
                </div>
                
                {!isRotating && mapMode !== 'moveProject' && (
                  <>
                    <button className="control-btn small" onClick={startRotation}>
                      🔄 Girar
                    </button>
                    <button className="control-btn small" onClick={startMoveProject}>
                      🚀 Mover
                    </button>
                  </>
                )}
                
                {isRotating && (
                  <>
                    <button className="control-btn small" onClick={() => rotateProject(-15)}>
                      ↶ -15°
                    </button>
                    <button className="control-btn small" onClick={() => rotateProject(-5)}>
                      ↶ -5°
                    </button>
                    <button className="control-btn small" onClick={() => rotateProject(5)}>
                      ↷ +5°
                    </button>
                    <button className="control-btn small" onClick={() => rotateProject(15)}>
                      ↷ +15°
                    </button>
                    <button className="control-btn small success" onClick={saveRotation}>
                      💾 Guardar
                    </button>
                    <button className="control-btn small danger" onClick={cancelRotation}>
                      ❌ Cancelar
                    </button>
                  </>
                )}
                
                {mapMode === 'moveProject' && (
                  <>
                    <button className="control-btn small success" onClick={saveMoveProject}>
                      💾 Guardar
                    </button>
                    <button className="control-btn small danger" onClick={cancelMoveProject}>
                      ❌ Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="map-mode-info">
        {mapMode === 'placeOrigin' && (
          <div className="mode-alert">
            <span>🎯 Haz clic en el mapa para colocar el origen de tu proyecto</span>
          </div>
        )}
        {mapMode === 'capturePhoto' && (
          <div className="mode-alert">
            <span>
              {isMobileDevice() 
                ? '📱 Modo móvil: Toca el mapa para abrir la cámara y capturar una foto' 
                : '📸 Modo desktop: Usa el botón "Colocar Imagen" para añadir imágenes al mapa'}
            </span>
          </div>
        )}
        {mapMode === 'rotateProject' && (
          <div className="mode-alert warning">
            <span>🔄 Modo rotación activo - Usa los controles para girar el proyecto</span>
          </div>
        )}
        {mapMode === 'moveProject' && (
          <div className="mode-alert warning">
            <span>🚀 Modo mover activo - Arrastra el marcador de origen</span>
          </div>
        )}
        {selectedImageForMap && (
          <div className="mode-alert warning">
            <span>📸 Modo colocar imagen activo - Haz clic en el mapa para colocar "{selectedImageForMap.name}"</span>
            <button 
              className="btn-cancel-small"
              onClick={() => setSelectedImageForMap(null)}
            >
              ✕ Cancelar
            </button>
          </div>
        )}
        {!projectOrigin && (
          <div className="mode-alert warning">
            <span>⚠️ Primero coloca el origen de tu proyecto en el mapa</span>
          </div>
        )}
      </div>

      <div ref={mapRef} className="enhanced-map-container" />

      {/* Modal de captura móvil */}
      {showMobileCapture && (
        <MobileCaptureModal
          position={mobileCapturePosition}
          onSave={handleMobileCaptureSave}
          onClose={() => {
            setShowMobileCapture(false);
            setSelectedImageForMap(null);
          }}
          selectedImage={selectedImageForMap}
          levels={levels}
        />
      )}

      {/* ✅ MODAL IMPORTAR GIS/CAD */}
      {showFileImport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🗂️ Importar Archivos GIS/CAD</h3>
              <button className="close-btn" onClick={() => setShowFileImport(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Funcionalidad en desarrollo...</p>
              <p>Próximamente podrás importar:</p>
              <ul>
                <li>📁 <strong>KML/KMZ</strong> - Datos de Google Earth</li>
                <li>📐 <strong>DWG</strong> - Planos de AutoCAD</li>
                <li>🗺️ <strong>Shapefile</strong> - Datos GIS profesionales</li>
              </ul>
              <div className="modal-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowFileImport(false)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL SUBIR IMAGEN PARA MAPA */}
      {showImageUpload && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📸 Colocar Imagen en el Mapa</h3>
              <button className="close-btn" onClick={() => setShowImageUpload(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Selecciona una imagen para colocar en el mapa:</p>
              <label className="file-input-label large">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadForMap}
                />
                <span className="file-input-button">
                  📁 Seleccionar Imagen
                </span>
              </label>
              <p className="help-text">
                Después de seleccionar, haz clic en el mapa donde quieras colocar la imagen
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MODAL GESTIÓN DE NIVELES */}
      {showLevelManager && (
        <LevelManager
          projectId={project?.id}
          onLevelsUpdate={setLevels}
          onClose={() => setShowLevelManager(false)}
        />
      )}

      <div className="map-legend">
        <div className="legend-title">Leyenda</div>
        <div className="legend-item">
          <div className="legend-color origin-pin"></div>
          <span>Origen Proyecto</span>
        </div>
        <div className="legend-item">
          <div className="legend-color photo-pin"></div>
          <span>Fotos 360°</span>
        </div>
        <div className="legend-item">
          <div className="legend-color normal-pin"></div>
          <span>Imágenes Normales</span>
        </div>
        <div className="legend-item">
          <div className="legend-color user-pin"></div>
          <span>Tu Ubicación</span>
        </div>
        <div className="legend-item">
          <div className="legend-color editable-pin"></div>
          <span>Marcadores Editables</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedMapView;