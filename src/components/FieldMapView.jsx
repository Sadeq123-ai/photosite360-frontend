import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './FieldMapView.css';

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FieldMapView = ({ photos, project }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [userLocation, setUserLocation] = useState(null);
  const [activeBaseLayer, setActiveBaseLayer] = useState('osm');

  // Capas base disponibles
  const baseLayers = {
    osm: {
      name: 'OpenStreetMap',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap'
    },
    satellite: {
      name: 'Satélite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri'
    },
    hybrid: {
      name: 'Híbrido',
      url: 'https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
      attribution: '© Google'
    }
  };

  // Convertir coordenadas de tus fotos a lat/lng (Écija, Spain)
  const convertToLatLng = (x, y) => {
    const baseLat = 37.5425; // Écija, Spain
    const baseLng = -5.0825;
    const scale = 100000;
    return [baseLat + (parseFloat(y) * scale), baseLng + (parseFloat(x) * scale)];
  };

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // Inicializar mapa centrado en Écija
      const initialCenter = [37.5425, -5.0825];
      mapInstance.current = L.map(mapRef.current).setView(initialCenter, 16);
      
      // Añadir capa base inicial
      addBaseLayer(activeBaseLayer);
    }

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Añadir marcadores para fotos con coordenadas
    const photosWithCoords = photos.filter(photo => photo.latitude && photo.longitude);
    
    if (photosWithCoords.length > 0) {
      photosWithCoords.forEach((photo, index) => {
        // Convertir coordenadas de tu sistema a lat/lng
        const [lat, lng] = convertToLatLng(photo.latitude, photo.longitude);
        
        // Crear icono personalizado para puntos 360°
        const customIcon = L.divIcon({
          className: 'field-marker',
          html: `
            <div class="marker-pin field-marker-360">
              <span class="marker-number">${index + 1}</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        // Crear URL completa de la imagen
        const imageUrl = photo.url.startsWith('http') 
          ? photo.url 
          : `http://localhost:8001${photo.url}`;

        const marker = L.marker([lat, lng], { icon: customIcon })
          .bindPopup(`
            <div class="field-popup">
              <h4>${photo.title}</h4>
              <img src="${imageUrl}" alt="${photo.title}" 
                   style="max-width: 250px; max-height: 180px; border-radius: 6px; margin: 8px 0;" />
              <div class="popup-info">
                <p><strong>Coordenadas originales:</strong></p>
                <p>X: ${photo.latitude}</p>
                <p>Y: ${photo.longitude}</p>
                ${photo.description ? `<p><strong>Descripción:</strong> ${photo.description}</p>` : ''}
              </div>
              <div class="popup-actions">
                <a href="/projects/${project?.id}/view/${photo.id}" class="popup-btn">
                  🔍 Ver Imagen 360°
                </a>
                <button onclick="navigator.clipboard.writeText('${imageUrl}'); alert('URL copiada')" class="popup-btn">
                  📋 Copiar URL
                </button>
              </div>
            </div>
          `)
          .addTo(mapInstance.current);

        markersRef.current.push(marker);
      });

      // Ajustar vista para mostrar todos los marcadores
      if (mapInstance.current && markersRef.current.length > 0) {
        const group = new L.featureGroup(markersRef.current);
        mapInstance.current.fitBounds(group.getBounds().pad(0.1));
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [photos, project]);

  // Función para añadir/actualizar capa base
  const addBaseLayer = (layerKey) => {
    if (!mapInstance.current) return;
    
    // Remover capas existentes
    mapInstance.current.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        mapInstance.current.removeLayer(layer);
      }
    });

    const layer = baseLayers[layerKey];
    L.tileLayer(layer.url, {
      attribution: layer.attribution,
      maxZoom: 19
    }).addTo(mapInstance.current);

    setActiveBaseLayer(layerKey);
  };

  // Geolocalización del usuario
  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude, accuracy });
          
          // Remover marcador anterior de usuario
          markersRef.current = markersRef.current.filter(marker => {
            if (marker.options.icon?.options?.className === 'user-marker') {
              marker.remove();
              return false;
            }
            return true;
          });

          // Crear icono para ubicación del usuario
          const userIcon = L.divIcon({
            className: 'user-marker',
            html: `
              <div class="marker-pin user-location">
                <span class="location-dot">📍</span>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 28]
          });

          // Añadir marcador de ubicación
          const userMarker = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapInstance.current)
            .bindPopup(`
              <div class="user-popup">
                <h4>📍 Tu Ubicación Actual</h4>
                <p><strong>Precisión:</strong> ±${Math.round(accuracy)} metros</p>
                <p><strong>Coordenadas:</strong></p>
                <p>Lat: ${latitude.toFixed(6)}</p>
                <p>Lng: ${longitude.toFixed(6)}</p>
              </div>
            `)
            .openPopup();

          markersRef.current.push(userMarker);
          
          // Centrar mapa en ubicación del usuario
          mapInstance.current.setView([latitude, longitude], 17);
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          let errorMessage = 'No se pudo obtener la ubicación.';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permiso de ubicación denegado.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Información de ubicación no disponible.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado.';
              break;
          }
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('La geolocalización no es compatible con este navegador.');
    }
  };

  // Ajustar vista para mostrar todos los puntos
  const fitToBounds = () => {
    if (markersRef.current.length > 0 && mapInstance.current) {
      const group = new L.featureGroup(markersRef.current);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  const photosWithCoords = photos.filter(photo => photo.latitude && photo.longitude);

  return (
    <div className="field-map-view">
      {/* Controles del mapa */}
      <div className="field-map-controls">
        <div className="control-group">
          <button 
            className="control-btn location-btn"
            onClick={locateUser}
            title="Mi ubicación actual"
          >
            📍
          </button>
          <button 
            className="control-btn fit-btn"
            onClick={fitToBounds}
            title="Ajustar a todos los puntos"
            disabled={photosWithCoords.length === 0}
          >
            🎯
          </button>
        </div>

        <div className="control-group">
          <button 
            className={`control-btn ${activeBaseLayer === 'osm' ? 'active' : ''}`}
            onClick={() => addBaseLayer('osm')}
            title="Mapa Callejero"
          >
            🗺️
          </button>
          <button 
            className={`control-btn ${activeBaseLayer === 'satellite' ? 'active' : ''}`}
            onClick={() => addBaseLayer('satellite')}
            title="Vista Satélite"
          >
            🛰️
          </button>
          <button 
            className={`control-btn ${activeBaseLayer === 'hybrid' ? 'active' : ''}`}
            onClick={() => addBaseLayer('hybrid')}
            title="Vista Híbrida"
          >
            🌍
          </button>
        </div>
      </div>

      {/* Información del proyecto */}
      <div className="field-map-info">
        <div className="project-summary">
          <h4>{project?.name}</h4>
          <div className="project-stats">
            <span className="stat">
              📸 {photosWithCoords.length} de {photos.length} fotos con coordenadas
            </span>
            {userLocation && (
              <span className="stat">
                📍 Ubicación activa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Leyenda */}
      <div className="field-map-legend">
        <div className="legend-title">Leyenda:</div>
        <div className="legend-item">
          <div className="legend-color field-marker-360"></div>
          <span>Fotos 360°</span>
        </div>
        <div className="legend-item">
          <div className="legend-color user-location"></div>
          <span>Tu ubicación</span>
        </div>
      </div>

      {/* Contenedor del mapa */}
      <div ref={mapRef} className="field-map-container" />

      {/* Mensaje si no hay fotos con coordenadas */}
      {photosWithCoords.length === 0 && (
        <div className="no-coordinates-message">
          <div className="message-content">
            <h4>📡 No hay fotos con coordenadas</h4>
            <p>Las fotos con coordenadas GPS aparecerán automáticamente en el mapa</p>
            <p>
              <strong>Fotos totales:</strong> {photos.length} | 
              <strong> Con coordenadas:</strong> {photosWithCoords.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldMapView;