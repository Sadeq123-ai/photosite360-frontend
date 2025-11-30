/**
 * Servicio de Conversión de Coordenadas
 * Convierte entre WGS84 (lat/lng) y UTM usando ETRS89
 *
 * Usa proj4js para conversiones precisas
 */

import proj4 from 'proj4';

// Definición de sistemas de coordenadas
const WGS84 = 'EPSG:4326';

// Zonas UTM para España (ETRS89)
const UTM_ZONES_SPAIN = {
  28: '+proj=utm +zone=28 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',  // Canarias oeste
  29: '+proj=utm +zone=29 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',  // Galicia
  30: '+proj=utm +zone=30 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',  // Centro (Madrid, Écija)
  31: '+proj=utm +zone=31 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',  // Este (Barcelona, Valencia)
};

export const CoordinateService = {
  /**
   * Detecta la zona UTM basándose en coordenadas WGS84
   * @param {number} lat - Latitud en grados decimales
   * @param {number} lng - Longitud en grados decimales
   * @returns {{zone: number, hemisphere: string}} Zona UTM y hemisferio
   */
  detectUTMZone(lat, lng) {
    const zone = Math.floor((lng + 180) / 6) + 1;
    const hemisphere = lat >= 0 ? 'N' : 'S';
    return { zone, hemisphere };
  },

  /**
   * Obtiene la definición de proyección UTM para una zona específica
   * @param {number} zone - Número de zona UTM (1-60)
   * @param {string} hemisphere - 'N' o 'S'
   * @returns {string} Definición proj4
   */
  getUTMProj(zone, hemisphere = 'N') {
    // Para España, usar definiciones predefinidas ETRS89
    if (UTM_ZONES_SPAIN[zone]) {
      return UTM_ZONES_SPAIN[zone];
    }

    // Para otras zonas, usar WGS84 genérico
    const south = hemisphere === 'S' ? ' +south' : '';
    return `+proj=utm +zone=${zone}${south} +datum=WGS84 +units=m +no_defs`;
  },

  /**
   * Convierte WGS84 (lat/lng) a coordenadas UTM
   * @param {number} lat - Latitud en grados decimales
   * @param {number} lng - Longitud en grados decimales
   * @param {number} [zone] - Zona UTM (si no se especifica, se detecta automáticamente)
   * @returns {{easting: number, northing: number, zone: number, hemisphere: string, datum: string}}
   */
  wgs84ToUTM(lat, lng, zone = null) {
    try {
      // Detectar zona si no se especifica
      let detectedZone = zone;
      let hemisphere = 'N';

      if (!zone) {
        const detected = this.detectUTMZone(lat, lng);
        detectedZone = detected.zone;
        hemisphere = detected.hemisphere;
      } else {
        hemisphere = lat >= 0 ? 'N' : 'S';
      }

      // Obtener proyección UTM
      const utmProj = this.getUTMProj(detectedZone, hemisphere);

      // Convertir coordenadas
      const [easting, northing] = proj4(WGS84, utmProj, [lng, lat]);

      // Determinar datum
      const datum = UTM_ZONES_SPAIN[detectedZone] ? 'ETRS89' : 'WGS84';

      return {
        easting: Math.round(easting * 100) / 100,  // 2 decimales
        northing: Math.round(northing * 100) / 100,
        zone: detectedZone,
        hemisphere,
        datum
      };
    } catch (error) {
      console.error('Error en conversión WGS84 -> UTM:', error);
      return null;
    }
  },

  /**
   * Convierte coordenadas UTM a WGS84 (lat/lng)
   * @param {number} easting - Coordenada Este en metros
   * @param {number} northing - Coordenada Norte en metros
   * @param {number} zone - Zona UTM
   * @param {string} [hemisphere='N'] - 'N' o 'S'
   * @returns {{lat: number, lng: number}}
   */
  utmToWGS84(easting, northing, zone, hemisphere = 'N') {
    try {
      const utmProj = this.getUTMProj(zone, hemisphere);
      const [lng, lat] = proj4(utmProj, WGS84, [easting, northing]);

      return {
        lat: Math.round(lat * 1000000) / 1000000,  // 6 decimales
        lng: Math.round(lng * 1000000) / 1000000
      };
    } catch (error) {
      console.error('Error en conversión UTM -> WGS84:', error);
      return null;
    }
  },

  /**
   * Formatea coordenadas UTM para visualización
   * @param {number} easting - Coordenada Este
   * @param {number} northing - Coordenada Norte
   * @param {number} zone - Zona UTM
   * @param {string} hemisphere - 'N' o 'S'
   * @param {string} [datum='ETRS89'] - Sistema de referencia
   * @returns {string} Coordenadas formateadas
   */
  formatUTM(easting, northing, zone, hemisphere, datum = 'ETRS89') {
    return `${datum} / UTM zone ${zone}${hemisphere}: ${easting.toFixed(2)}E, ${northing.toFixed(2)}N`;
  },

  /**
   * Formatea coordenadas WGS84 para visualización
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @returns {string} Coordenadas formateadas
   */
  formatWGS84(lat, lng) {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
  },

  /**
   * Obtiene información sobre las zonas UTM de España
   * @returns {Object} Diccionario con zona -> descripción
   */
  getSpainUTMZones() {
    return {
      28: "Islas Canarias occidentales",
      29: "Galicia, Asturias, León (oeste)",
      30: "Centro de España (Madrid, Écija, Toledo)",
      31: "Cataluña, Valencia, Baleares (este)"
    };
  },

  /**
   * Convierte todas las coordenadas de un objeto (WGS84, UTM, proyecto)
   * @param {number} lat - Latitud WGS84
   * @param {number} lng - Longitud WGS84
   * @param {Function} convertToProjectCoords - Función para convertir a coordenadas del proyecto
   * @returns {Object} Objeto con todos los sistemas de coordenadas
   */
  convertAllCoordinates(lat, lng, convertToProjectCoords) {
    const utm = this.wgs84ToUTM(lat, lng);
    const project = convertToProjectCoords ? convertToProjectCoords(lat, lng) : null;

    return {
      geo: {
        latitude: lat,
        longitude: lng
      },
      utm: utm ? {
        easting: utm.easting,
        northing: utm.northing,
        zone: utm.zone,
        hemisphere: utm.hemisphere,
        datum: utm.datum
      } : null,
      project: project ? {
        x: project.x,
        y: project.y,
        z: 0
      } : null
    };
  },

  /**
   * Valida coordenadas UTM
   * @param {number} easting - Coordenada Este
   * @param {number} northing - Coordenada Norte
   * @param {number} zone - Zona UTM
   * @returns {boolean} True si las coordenadas son válidas
   */
  validateUTM(easting, northing, zone) {
    // Easting debe estar entre 0 y 1,000,000
    if (easting < 0 || easting > 1000000) {
      return false;
    }

    // Northing debe estar entre 0 y 10,000,000
    if (northing < 0 || northing > 10000000) {
      return false;
    }

    // Zona debe estar entre 1 y 60
    if (zone < 1 || zone > 60) {
      return false;
    }

    return true;
  },

  /**
   * Calcula la distancia entre dos puntos UTM (en metros)
   * @param {number} e1 - Easting del punto 1
   * @param {number} n1 - Northing del punto 1
   * @param {number} e2 - Easting del punto 2
   * @param {number} n2 - Northing del punto 2
   * @returns {number} Distancia en metros
   */
  calculateDistanceUTM(e1, n1, e2, n2) {
    const dx = e2 - e1;
    const dy = n2 - n1;
    return Math.sqrt(dx * dx + dy * dy);
  }
};

export default CoordinateService;
