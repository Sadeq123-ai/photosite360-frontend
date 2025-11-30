import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Map2D = ({ project, onPointSelect }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [userLocation, setUserLocation] = useState(null);

  // Convertir coordenadas de tu proyecto a lat/lng
  const convertToLatLng = (x, y) => {
    // Ajusta estos valores según la ubicación real de tu proyecto
    const baseLat = 37.5425; // Ejemplo: Écija, Spain
    const baseLng = -5.0825;
    
    // Escalar las coordenadas (ajusta el factor según necesites)
    const scale = 100000;
    return [baseLat + (y * scale), baseLng + (x * scale)];
  };

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // Inicializar mapa centrado en las coordenadas del primer punto
      const firstPoint = project.images[0];
      const initialCenter = firstPoint ? 
        convertToLatLng(firstPoint.x, firstPoint.y) : 
        [37.5425, -5.0825]; // Écija por defecto

      mapInstance.current = L.map(mapRef.current).setView(initialCenter, 17);
      
      // Capas base
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstance.current);

      // Capa satélite (opcional)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri'
      }).addTo(mapInstance.current);
    }

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Añadir marcadores para cada punto del proyecto
    project.images.forEach((image, index) => {
      const [lat, lng] = convertToLatLng(image.x, image.y);
      
      // Crear icono personalizado
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-pin">
            <span class="marker-number">${index + 1}</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });

      const marker = L.marker([lat, lng], { icon: customIcon })
        .bindPopup(`
          <div class="map-popup">
            <h4>${image.name}</h4>
            <img src="${image.url}" alt="${image.name}" 
                 style="max-width: 200px; max-height: 150px; border-radius: 5px;" />
            <div class="popup-info">
              <p><strong>Coordenadas:</strong></p>
              <p>X: ${image.x.toFixed(6)}</p>
              <p>Y: ${image.y.toFixed(6)}</p>
              <p>Z: ${image.z.toFixed(6)}</p>
            </div>
            <button onclick="window.dispatchEvent(new CustomEvent('pointSelected', 
                     { detail: ${JSON.stringify(image)} }))">
              🔍 Ver en 3D
            </button>
          </div>
        `)
        .addTo(mapInstance.current);

      markersRef.current.push(marker);
    });

    // Escuchar evento de selección desde el popup
    const handlePointSelected = (event) => {
      if (onPointSelect) {
        onPointSelect(event.detail);
      }
    };

    window.addEventListener('pointSelected', handlePointSelected);

    return () => {
      window.removeEventListener('pointSelected', handlePointSelected);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [project, onPointSelect]);

  // Geolocalización del usuario
  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          
          // Añadir marcador de ubicación
          if (userLocation) {
            L.marker([latitude, longitude])
              .addTo(mapInstance.current)
              .bindPopup('📍 Tu ubicación actual')
              .openPopup();
            
            mapInstance.current.setView([latitude, longitude], 17);
          }
        },
        (error) => {
          console.error('Error de geolocalización:', error);
          alert('No se pudo obtener la ubicación. Asegúrate de tener el GPS activado.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  };

  return (
    <div className="map-2d-container">
      <div className="map-controls">
        <button 
          className="location-btn"
          onClick={locateUser}
          title="Centrar en mi ubicación"
        >
          📍 Mi Ubicación
        </button>
        <button 
          className="fit-bounds-btn"
          onClick={() => {
            if (markersRef.current.length > 0 && mapInstance.current) {
              const group = new L.featureGroup(markersRef.current);
              mapInstance.current.fitBounds(group.getBounds());
            }
          }}
          title="Ajustar a todos los puntos"
        >
          🎯 Ajustar Vista
        </button>
      </div>
      
      <div ref={mapRef} className="map-2d" />
      
      <div className="map-legend">
        <h4>Leyenda:</h4>
        <div className="legend-item">
          <div className="marker-pin legend-marker">
            <span className="marker-number">1</span>
          </div>
          <span>Puntos 360°</span>
        </div>
        {userLocation && (
          <div className="legend-item">
            <div className="user-location-marker">📍</div>
            <span>Tu ubicación</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map2D;