# 📐 Guía Completa del Sistema de Coordenadas - PhotoSite360

## 📋 Índice
1. [Introducción](#introducción)
2. [Sistemas de Coordenadas Soportados](#sistemas-de-coordenadas-soportados)
3. [Importación de Coordenadas](#importación-de-coordenadas)
4. [Exportación de Coordenadas](#exportación-de-coordenadas)
5. [Transformaciones Automáticas](#transformaciones-automáticas)
6. [Posicionamiento del Proyecto](#posicionamiento-del-proyecto)
7. [Ejemplos de Uso](#ejemplos-de-uso)
8. [API Endpoints](#api-endpoints)

---

## 🎯 Introducción

PhotoSite360 ahora incluye un **sistema profesional de gestión de coordenadas** que permite:

- ✅ Importar coordenadas desde **CSV, Excel o TXT**
- ✅ Trabajar con **3 sistemas de coordenadas** simultáneamente
- ✅ **Transformaciones automáticas** entre sistemas
- ✅ **Exportación flexible** con selección de columnas
- ✅ **Posicionamiento del proyecto** en ubicación real

---

## 📍 Sistemas de Coordenadas Soportados

### 1. **Coordenadas Locales del Proyecto**
**Uso**: Coordenadas relativas a un origen arbitrario (ej: esquina del edificio)

**Campos**:
- `project_x`: Coordenada X en metros
- `project_y`: Coordenada Y en metros
- `project_z`: Coordenada Z en metros (altura)

**Ventajas**:
- Simples de medir y entender
- Ideales para obras de construcción
- Exportables desde AutoCAD, Revit

**Ejemplo**:
```
X: -8.11285, Y: -90.52344, Z: 19.05760
```

### 2. **Coordenadas UTM ETRS89**
**Uso**: Coordenadas proyectadas métricas (España)

**Campos**:
- `utm_easting`: Coordenada Este en metros
- `utm_northing`: Coordenada Norte en metros
- `utm_zone`: Zona UTM (28-31 para España)
- `utm_hemisphere`: Hemisferio (siempre 'N' para España)
- `utm_datum`: Sistema de referencia ('ETRS89')

**Ventajas**:
- Precisión métrica
- Estándar profesional topográfico
- Compatible con GPS de alta precisión

**Zonas UTM en España**:
- **Zona 28N**: Canarias occidental
- **Zona 29N**: Canarias oriental, Galicia
- **Zona 30N**: Casi toda España peninsular
- **Zona 31N**: Cataluña, Valencia, Baleares

**Ejemplo**:
```
Easting: 234567.890, Northing: 4567890.123, Zona: 30N
```

### 3. **Coordenadas Geográficas WGS84**
**Uso**: Latitud/Longitud (GPS, Google Maps)

**Campos**:
- `geo_latitude`: Latitud en grados decimales
- `geo_longitude`: Longitud en grados decimales

**Ventajas**:
- Universal
- Compatible con GPS
- Fácil visualización en mapas web

**Ejemplo**:
```
Latitud: 37.38863889, Longitud: -5.98233333
```

---

## 📥 Importación de Coordenadas

### Formatos Soportados
- **CSV** (separador: `;` `,` o `tab`)
- **TXT** (delimitado)
- **Excel** (`.xlsx` o `.xls`)

### Nombres de Columnas Aceptados

| Dato | Nombres Válidos |
|------|-----------------|
| **Nombre imagen** | nombre_imagen, nombre, imagen, filename, file, name, photo |
| **X** | x, easting, longitude, lon, lng, project_x |
| **Y** | y, northing, latitude, lat, project_y |
| **Z** | z, altura, elevation, altitud, height, project_z, cota |
| **Tipo** | tipo, type, object_type, categoria |

### Ejemplo de Archivo CSV

**Con separador `;`:**
```csv
nombre_imagen;x;y;z;tipo
IMG_001.jpg;-8.11285;-90.52344;19.05760;foto360
IMG_002.jpg;-8.15432;-91.23456;19.12345;foto360
IMG_003.jpg;-7.98765;-89.87654;18.98765;foto360
plano_01.jpg;0;0;0;imagen
incidente_01.jpg;5.5;10.3;1.2;incidencia
```

**Con separador `,`:**
```csv
nombre,x,y,z
IMG_001.jpg,-8.11285,-90.52344,19.05760
IMG_002.jpg,-8.15432,-91.23456,19.12345
```

### Proceso de Importación

1. **Clic en "Importar Coordenadas"** en la página del proyecto
2. **Seleccionar archivo** CSV/Excel/TXT
3. **Ver vista previa** del contenido
4. **Seleccionar tipo de coordenadas**:
   - ☑️ **Locales**: Si son X, Y, Z relativos
   - ☑️ **UTM**: Si son Easting, Northing reales
   - ☑️ **Geo**: Si son Latitud, Longitud
5. **Clic en "Importar"**
6. **Ver resultado**: Cuántas actualizadas, errores si los hay

### Validaciones Automáticas
- ✅ Detección de separador
- ✅ Validación de columnas requeridas
- ✅ Detección de valores numéricos
- ✅ Búsqueda de imágenes por nombre (match parcial)
- ✅ Reporte de errores por fila

---

## 📤 Exportación de Coordenadas

### Características
- ✅ Selección flexible de columnas
- ✅ Múltiples sistemas simultáneamente
- ✅ Separador personalizable
- ✅ Incluye fotos 360°, imágenes e incidencias

### Columnas Disponibles

**Básicas**:
- Nombre de imagen
- Tipo (foto360/imagen/incidencia)
- URL de la imagen

**Coordenadas Locales**:
- X (local)
- Y (local)
- Z (local)

**Coordenadas UTM**:
- Easting (UTM)
- Northing (UTM)
- Zona UTM

**Coordenadas Geográficas**:
- Latitud
- Longitud

**Opcionales**:
- Descripción
- Fecha de captura
- Origen de coordenadas (local/utm/geo/manual)

### Proceso de Exportación

1. **Clic en "Exportar CSV"**
2. **Seleccionar columnas** deseadas con checkboxes
3. **Elegir separador**: `;` `,` o `tab`
4. **Clic en "Exportar CSV"**
5. **Descargar archivo**: `NombreProyecto_Coordenadas_2025-12-08.csv`

### Ejemplo de Archivo Exportado

**Con todas las columnas**:
```csv
nombre_imagen;tipo;x_local;y_local;z_local;utm_easting;utm_northing;utm_zone;latitud;longitud;origen_coordenadas;url
IMG_001.jpg;foto360;-8.112850;-90.523440;19.057600;234567.890;4567890.123;30;37.38863889;-5.98233333;local;https://...
IMG_002.jpg;foto360;-8.154320;-91.234560;19.123450;234560.123;4567885.456;30;37.38859123;-5.98240567;local;https://...
```

**Solo coordenadas UTM**:
```csv
nombre_imagen;utm_easting;utm_northing;utm_zone
IMG_001.jpg;234567.890;4567890.123;30
IMG_002.jpg;234560.123;4567885.456;30
```

---

## 🔄 Transformaciones Automáticas

### Librería Utilizada
**pyproj 3.6.1** - Biblioteca profesional de transformaciones cartográficas

### Transformaciones Soportadas

```
┌──────────────┐
│   LOCALES    │ ◄──┐
│  (X, Y, Z)   │    │
└──────┬───────┘    │
       │            │
   (origen +        │
    rotación)       │
       │            │
       ▼            │
┌──────────────┐    │
│     UTM      │    │
│ (E, N, Zona) │ ───┤
└──────┬───────┘    │
       │            │
  (proyección)      │
       │            │
       ▼            │
┌──────────────┐    │
│     GEO      │ ───┘
│ (Lat, Lng)   │
└──────────────┘
```

### Cuando se Aplican

**Automáticamente**:
- Al **importar** coordenadas con tipo especificado
- Al **posicionar** el proyecto en el mapa
- Al **recalcular** coordenadas

**Reglas de Transformación**:

1. **Si importas LOCALES**:
   - Necesitas posicionar proyecto después
   - Sistema calculará UTM y Geo cuando definas origen

2. **Si importas UTM**:
   - Sistema calcula Geo automáticamente
   - Sistema calcula Locales si hay origen definido

3. **Si importas GEO**:
   - Sistema calcula UTM automáticamente
   - Sistema calcula Locales si hay origen definido

---

## 🗺️ Posicionamiento del Proyecto

### ¿Qué es el Posicionamiento?

El posicionamiento define:
1. **Origen**: Punto (Lat, Lng) que corresponde a (0, 0) en coordenadas locales
2. **Rotación**: Ángulo en grados (0° = norte arriba, positivo = sentido horario)

### ¿Para Qué Sirve?

- Convertir coordenadas **locales → UTM → geográficas**
- Posicionar fotos con coordenadas locales en **ubicación real**
- Alinear proyecto con **orientación real del edificio**

### API de Posicionamiento

**Endpoint**: `PUT /api/projects/{id}/positioning`

**Parámetros**:
```json
{
  "map_origin_lat": 37.3886,
  "map_origin_lng": -5.9823,
  "map_rotation": 15.0,
  "recalculate_coordinates": true
}
```

**Respuesta**:
```json
{
  "message": "Posicionamiento actualizado",
  "origin": {"lat": 37.3886, "lng": -5.9823},
  "rotation": 15.0,
  "items_updated": 25
}
```

### Endpoint de Recalculo

**Endpoint**: `POST /api/projects/{id}/recalculate-coordinates`

**Uso**: Recalcula todas las coordenadas con el origen actual

**Respuesta**:
```json
{
  "message": "Coordenadas recalculadas",
  "total_items": 30,
  "updated": 25,
  "errors": null
}
```

---

## 💡 Ejemplos de Uso

### Caso 1: Proyecto de Construcción con Coordenadas Locales

**Situación**: Tienes planos de AutoCAD con coordenadas locales (X, Y, Z)

**Flujo**:
1. Exportar coordenadas desde AutoCAD a CSV
2. Importar en PhotoSite360 → Tipo: **Locales**
3. Posicionar proyecto en mapa (definir origen y rotación)
4. Sistema calcula automáticamente UTM y Geo
5. Exportar con todos los sistemas para compartir con topógrafo

**Archivo AutoCAD.csv**:
```csv
nombre;x;y;z
fachada_norte.jpg;0;0;0
esquina_NE.jpg;25.50;0;0
esquina_SE.jpg;25.50;-15.30;0
```

**Después del posicionamiento**:
```csv
nombre;x;y;z;utm_easting;utm_northing;latitud;longitud
fachada_norte.jpg;0;0;0;234567.890;4567890.123;37.38863889;-5.98233333
esquina_NE.jpg;25.50;0;0;234593.390;4567890.123;37.38863889;-5.98200123
```

### Caso 2: Levantamiento Topográfico con GPS

**Situación**: Topógrafo te proporciona coordenadas UTM reales

**Flujo**:
1. Recibir archivo Excel con coordenadas UTM
2. Importar en PhotoSite360 → Tipo: **UTM**
3. Sistema calcula automáticamente Geo y Locales
4. Proyecto se posiciona automáticamente en ubicación real
5. Exportar coordenadas locales para equipo de construcción

**Archivo topografo.xlsx**:
```
nombre      | easting   | northing  | zona
punto_01.jpg| 234567.890| 4567890.12| 30
punto_02.jpg| 234593.450| 4567885.67| 30
```

**Después de importar**:
```csv
nombre;x_local;y_local;utm_easting;utm_northing;latitud;longitud
punto_01.jpg;0;0;234567.890;4567890.12;37.38863889;-5.98233333
punto_02.jpg;25.56;-4.45;234593.450;4567885.67;37.38859444;-5.98199456
```

### Caso 3: Inspección con GPS de Smartphone

**Situación**: Tomas fotos con smartphone que captura lat/lng

**Flujo**:
1. Exportar metadatos GPS de fotos a CSV
2. Importar en PhotoSite360 → Tipo: **Geo**
3. Sistema calcula automáticamente UTM y Locales
4. Visualizar en mapa profesional con coordenadas UTM

**Archivo gps_smartphone.csv**:
```csv
nombre;latitud;longitud
foto_01.jpg;37.38863889;-5.98233333
foto_02.jpg;37.38859444;-5.98199456
```

**Después de importar**:
```csv
nombre;latitud;longitud;utm_easting;utm_northing;x_local;y_local
foto_01.jpg;37.38863889;-5.98233333;234567.890;4567890.12;0;0
foto_02.jpg;37.38859444;-5.98199456;234593.450;4567885.67;25.56;-4.45
```

---

## 🔌 API Endpoints

### Importación

**Endpoint**: `POST /api/projects/{project_id}/import-coordinates`

**Content-Type**: `multipart/form-data`

**Parámetros**:
- `file`: Archivo CSV/Excel/TXT
- `coordinate_type`: 'local' | 'utm' | 'geo'
- `object_type`: 'foto360' | 'imagen' | 'incidencia'

**Ejemplo (curl)**:
```bash
curl -X POST \
  https://photosite360-api-cx3k.onrender.com/api/projects/1/import-coordinates \
  -H "Authorization: Bearer {token}" \
  -F "file=@coordenadas.csv" \
  -F "coordinate_type=local" \
  -F "object_type=foto360"
```

**Respuesta**:
```json
{
  "message": "Importación completada",
  "imported": 0,
  "updated": 15,
  "total_rows": 15,
  "errors": null,
  "coordinate_type": "local"
}
```

### Posicionamiento

**Endpoint**: `PUT /api/projects/{project_id}/positioning`

**Content-Type**: `application/json`

**Body**:
```json
{
  "map_origin_lat": 37.3886,
  "map_origin_lng": -5.9823,
  "map_rotation": 15.0,
  "recalculate_coordinates": true
}
```

**Respuesta**:
```json
{
  "message": "Posicionamiento actualizado",
  "origin": {"lat": 37.3886, "lng": -5.9823},
  "rotation": 15.0,
  "coordinates_recalculated": true,
  "items_updated": 25
}
```

### Recalculo

**Endpoint**: `POST /api/projects/{project_id}/recalculate-coordinates`

**Content-Type**: `application/json`

**Respuesta**:
```json
{
  "message": "Coordenadas recalculadas",
  "total_items": 30,
  "updated": 25,
  "errors": null
}
```

---

## 📊 Precisión y Exactitud

### Coordenadas Locales
- **Precisión**: 6 decimales (micrómetros)
- **Rango**: Ilimitado
- **Uso**: Construcción, BIM, CAD

### Coordenadas UTM
- **Precisión**: 3 decimales (milímetros)
- **Rango**: Zona específica (España: 28-31N)
- **Uso**: Topografía profesional

### Coordenadas Geográficas
- **Precisión**: 8 decimales (±1.1mm)
- **Rango**: Global
- **Uso**: GPS, mapas web

---

## ⚠️ Consideraciones Importantes

### Zona UTM
- España continental usa principalmente **zona 30N**
- Canarias usa zonas **28N** y **29N**
- Cataluña y Valencia usan **zona 31N**
- El sistema detecta la zona automáticamente desde longitud

### Rotación del Proyecto
- **0°**: Norte hacia arriba del plano
- **Positivo**: Sentido horario
- **Ejemplo**: Si el edificio está orientado 15° hacia el este, usa rotación = 15°

### Importación vs. Creación Manual
- **Importación**: Más rápido para muchas fotos
- **Manual**: Útil para correcciones individuales
- **Mixto**: Importar base + ajustes manuales

---

## 🎓 Glosario

- **ETRS89**: European Terrestrial Reference System 1989 (datum europeo)
- **WGS84**: World Geodetic System 1984 (datum GPS global)
- **UTM**: Universal Transverse Mercator (proyección métrica)
- **Easting**: Coordenada Este en UTM
- **Northing**: Coordenada Norte en UTM
- **Datum**: Sistema de referencia geodésico
- **Proyección**: Transformación de coordenadas esféricas a planas

---

## 📞 Soporte

Si tienes dudas sobre el sistema de coordenadas:

1. Revisa esta guía
2. Consulta los ejemplos de uso
3. Prueba con el archivo de ejemplo: `ejemplo_coordenadas.csv`

---

**Desarrollado con**:
- pyproj 3.6.1
- pandas 2.1.4
- FastAPI 0.104.1
- React + Vite

**Última actualización**: Diciembre 2025
