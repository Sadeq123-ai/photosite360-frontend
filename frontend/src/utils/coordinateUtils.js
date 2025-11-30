/**
 * Constantes de conversión.
 * Esta es una aproximación para proyectos locales (distancias cortas).
 * Para mayor precisión, se recomienda usar una biblioteca de proyección como 'proj4'.
 */
const METERS_PER_DEGREE_LATITUDE = 111320; // ~111.32 km/grado

/**
 * Convierte coordenadas GPS (lat, lng) a coordenadas de proyecto (X, Y en metros) 
 * relativas al Origen del Proyecto.
 * * @param {number} lat - Latitud de la foto (GPS).
 * @param {number} lng - Longitud de la foto (GPS).
 * @param {number} originLat - Latitud del origen del proyecto.
 * @param {number} originLng - Longitud del origen del proyecto.
 * @returns {{x: number, y: number}} Coordenadas X e Y en metros.
 */
export const convertToProjectCoords = (lat, lng, originLat, originLng) => {
  // ⚠️ Validación crucial: Si no hay origen, no se puede calcular.
  if (!originLat || !originLng) {
    console.warn("Project Origin is undefined. Cannot convert to project coordinates.");
    return { x: 0, y: 0 };
  }
  
  const targetLat = parseFloat(lat);
  const targetLng = parseFloat(lng);
  
  // 1. Calcular la diferencia en grados
  const deltaLat = targetLat - originLat;
  const deltaLng = targetLng - originLng;

  // 2. Calcular el factor de longitud (Ajuste por la curvatura de la Tierra)
  // Se usa la latitud del origen para el cálculo del coseno.
  const cosLat = Math.cos(originLat * (Math.PI / 180));
  const metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * cosLat;

  // 3. Conversión a metros
  // Eje Y (Norte/Sur) = Latitud * factor
  const y = deltaLat * METERS_PER_DEGREE_LATITUDE; 
  
  // Eje X (Este/Oeste) = Longitud * factor
  const x = deltaLng * metersPerDegreeLongitude; 

  // Devolver X (Este) e Y (Norte)
  return { 
    x: parseFloat(x.toFixed(3)), 
    y: parseFloat(y.toFixed(3)) 
  };
};

/**
 * Función inversa: Convierte coordenadas de proyecto (X, Y) a GPS (lat, lng).
 * Necesaria si el EnhancedMapView permite arrastrar marcadores y guardar su nueva posición GPS.
 */
export const convertToGPS = (x, y, originLat, originLng) => {
    if (!originLat || !originLng) {
      return { lat: 0, lng: 0 };
    }
    
    const cosLat = Math.cos(originLat * (Math.PI / 180));
    const metersPerDegreeLongitude = METERS_PER_DEGREE_LATITUDE * cosLat;
    
    const deltaLat = y / METERS_PER_DEGREE_LATITUDE;
    const deltaLng = x / metersPerDegreeLongitude;
    
    const lat = originLat + deltaLat;
    const lng = originLng + deltaLng;
    
    return { 
      lat: parseFloat(lat.toFixed(6)), 
      lng: parseFloat(lng.toFixed(6)) 
    };
};