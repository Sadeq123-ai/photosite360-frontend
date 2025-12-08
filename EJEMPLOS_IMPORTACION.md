# Ejemplos de Importación de Coordenadas

Esta carpeta contiene archivos de ejemplo para importar coordenadas en PhotoSite360.

## 📁 Archivos Incluidos

### 1. `ejemplos_coordenadas_locales.csv`
**Tipo de Coordenadas**: Locales del Proyecto

**Uso**: Para proyectos donde tienes coordenadas relativas a un origen arbitrario (como las generadas por software de fotogrametría).

**Columnas**:
- `nombre_imagen`: Nombre del archivo de imagen (debe coincidir exactamente)
- `x`: Coordenada X en metros (Este/Oeste relativo)
- `y`: Coordenada Y en metros (Norte/Sur relativo)
- `z`: Coordenada Z en metros (altura)
- `tipo`: Tipo de objeto (`foto360`, `imagen`, `incidencia`)

**Ejemplo de uso**:
1. Abre tu proyecto en PhotoSite360
2. Haz clic en "Importar Coordenadas"
3. Selecciona el archivo `ejemplos_coordenadas_locales.csv`
4. Elige la opción **"Coordenadas Locales del Proyecto"**
5. Haz clic en "Importar"

---

### 2. `ejemplos_coordenadas_utm.csv`
**Tipo de Coordenadas**: UTM ETRS89

**Uso**: Para proyectos con coordenadas UTM (típicas en topografía y GIS en España).

**Columnas**:
- `nombre_imagen`: Nombre del archivo de imagen
- `utm_easting`: Coordenada Este UTM en metros
- `utm_northing`: Coordenada Norte UTM en metros
- `utm_zone`: Zona UTM (28, 29, 30, o 31 para España)
- `tipo`: Tipo de objeto

**Ejemplo de uso**:
1. Abre tu proyecto en PhotoSite360
2. Haz clic en "Importar Coordenadas"
3. Selecciona el archivo `ejemplos_coordenadas_utm.csv`
4. Elige la opción **"Coordenadas UTM ETRS89"**
5. Haz clic en "Importar"

**Nota**: Las zonas UTM en España son:
- Zona 28: Canarias occidental
- Zona 29: Canarias oriental, Galicia
- Zona 30: La mayor parte de España peninsular
- Zona 31: Cataluña, Valencia, Baleares

---

### 3. `ejemplos_coordenadas_geograficas.csv`
**Tipo de Coordenadas**: WGS84 Geográficas

**Uso**: Para proyectos con coordenadas de GPS estándar (latitud/longitud).

**Columnas**:
- `nombre_imagen`: Nombre del archivo de imagen
- `latitud`: Latitud en grados decimales (ej: 40.416775)
- `longitud`: Longitud en grados decimales (ej: -3.703790)
- `tipo`: Tipo de objeto

**Ejemplo de uso**:
1. Abre tu proyecto en PhotoSite360
2. Haz clic en "Importar Coordenadas"
3. Selecciona el archivo `ejemplos_coordenadas_geograficas.csv`
4. Elige la opción **"Coordenadas Geográficas WGS84"**
5. Haz clic en "Importar"

**Nota**: Los valores del ejemplo corresponden a ubicaciones en Madrid, España.

---

## 🔧 Formatos Soportados

PhotoSite360 acepta archivos en los siguientes formatos:
- **CSV** (`.csv`) con separadores: `;` (punto y coma), `,` (coma), o `\t` (tabulador)
- **Excel** (`.xlsx`, `.xls`)
- **Texto plano** (`.txt`) con separadores

El sistema detecta automáticamente el separador utilizado.

---

## 📝 Nombres de Columnas Aceptados

El sistema es flexible con los nombres de columnas. Estos son algunos ejemplos aceptados:

### Para Coordenadas Locales:
- X: `x`, `X`, `project_x`, `coord_x`, `local_x`
- Y: `y`, `Y`, `project_y`, `coord_y`, `local_y`
- Z: `z`, `Z`, `project_z`, `coord_z`, `altura`, `height`

### Para Coordenadas UTM:
- Easting: `utm_easting`, `easting`, `este`, `x_utm`
- Northing: `utm_northing`, `northing`, `norte`, `y_utm`
- Zona: `utm_zone`, `zone`, `zona`

### Para Coordenadas Geográficas:
- Latitud: `latitud`, `latitude`, `lat`, `geo_latitude`
- Longitud: `longitud`, `longitude`, `lng`, `lon`, `geo_longitude`

### Nombre de Imagen:
- `nombre_imagen`, `nombre`, `filename`, `image_name`, `archivo`

### Tipo de Objeto:
- `tipo`, `type`, `object_type`

---

## ✅ Consejos para una Importación Exitosa

1. **Nombres exactos**: Asegúrate de que los nombres en el CSV coincidan **exactamente** con los nombres de los archivos subidos (incluyendo extensión: `.jpg`, `.png`, etc.)

2. **Formato decimal**: Usa punto (`.`) como separador decimal, no coma
   - ✅ Correcto: `40.416775`
   - ❌ Incorrecto: `40,416775`

3. **Tipos válidos**: Los valores aceptados para la columna `tipo` son:
   - `foto360` - Para fotos 360°
   - `imagen` - Para imágenes normales
   - `incidencia` - Para fotos de incidencias

4. **Codificación**: Guarda tus archivos CSV con codificación **UTF-8** para evitar problemas con caracteres especiales

5. **Columnas mínimas**:
   - Locales: `nombre_imagen`, `x`, `y` (z es opcional)
   - UTM: `nombre_imagen`, `utm_easting`, `utm_northing`, `utm_zone`
   - Geográficas: `nombre_imagen`, `latitud`, `longitud`

---

## 🔄 Transformaciones Automáticas

Cuando importas coordenadas, PhotoSite360 automáticamente:

- **Si importas Locales** y tu proyecto tiene origen configurado → Calcula UTM y Geográficas
- **Si importas UTM** → Calcula Geográficas
- **Si importas Geográficas** → Calcula UTM

Esto significa que puedes exportar en cualquier sistema de coordenadas, sin importar cuál hayas importado originalmente.

---

## 📤 Exportación Personalizada

Después de importar, puedes exportar tus datos con las columnas que necesites:

1. Haz clic en "Exportar CSV"
2. Selecciona las columnas que quieres incluir
3. Elige el separador (`;`, `,`, o tabulador)
4. Descarga tu archivo personalizado

Puedes exportar un solo sistema de coordenadas o varios a la vez.

---

## 🆘 Solución de Problemas

### "No se encontraron coincidencias"
- Verifica que los nombres de archivo en el CSV coincidan exactamente con los archivos subidos
- Revisa que estés usando la extensión correcta (`.jpg` vs `.JPG`)

### "Error al procesar archivo"
- Comprueba que el archivo no esté corrupto
- Verifica que estés usando punto (`.`) como separador decimal
- Asegúrate de que el archivo tenga las columnas necesarias

### "Coordenadas inválidas"
- Para UTM: Los valores deben ser números positivos grandes (ej: 440250)
- Para Geográficas: Latitud debe estar entre -90 y 90, Longitud entre -180 y 180
- Para Locales: Cualquier número decimal es válido

---

## 📞 Más Información

Para una guía completa del sistema de coordenadas, consulta el archivo `COORDINATE_SYSTEM_GUIDE.md`.
