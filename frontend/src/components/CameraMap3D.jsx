import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei'
import { X } from 'lucide-react'
import * as THREE from 'three'
import './CameraMap3D.css'

// Convertir cuaternión a ángulos Euler
const quaternionToEuler = (qx, qy, qz, qw) => {
  const sinr_cosp = 2 * (qw * qx + qy * qz)
  const cosr_cosp = 1 - 2 * (qx * qx + qy * qy)
  const roll = Math.atan2(sinr_cosp, cosr_cosp)

  const sinp = 2 * (qw * qy - qz * qx)
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp)

  const siny_cosp = 2 * (qw * qz + qx * qy)
  const cosy_cosp = 1 - 2 * (qy * qy + qz * qz)
  const yaw = Math.atan2(siny_cosp, cosy_cosp)

  return { yaw, pitch, roll }
}

// Extraer orientación del description
const getOrientation = (photo) => {
  if (!photo.description) return null
  
  const orientMatch = photo.description.match(/orientation:\[([-\d.eE+]+),([-\d.eE+]+),([-\d.eE+]+),([-\d.eE+]+)\]/)
  if (orientMatch) {
    const qx = parseFloat(orientMatch[1])
    const qy = parseFloat(orientMatch[2])
    const qz = parseFloat(orientMatch[3])
    const qw = parseFloat(orientMatch[4])
    
    return quaternionToEuler(qx, qy, qz, qw)
  }
  return null
}

const CameraMarker = ({ photo, onClick, isActive }) => {
  const meshRef = useRef()
  const arrowRef = useRef()
  const [hovered, setHovered] = useState(false)

  // ✅ DETECTAR TIPO DE FOTO Y COORDENADAS
  const isNormalImage = photo.type === 'normal' || photo.object_type === 'image'

  // ✅ USAR COORDENADAS NORMALIZADAS si existen (para coordenadas grandes)
  let x, y, z
  if (photo.normalized_x !== undefined) {
    // Usar coordenadas normalizadas (ya centradas en el origen)
    x = photo.normalized_x
    y = photo.normalized_y
    z = photo.normalized_z
  } else if (photo.project_x !== undefined && photo.project_y !== undefined) {
    // Coordenadas del proyecto (nuevo sistema)
    x = parseFloat(photo.project_x) || 0
    y = parseFloat(photo.project_y) || 0
    z = parseFloat(photo.project_z) || 0
  } else {
    // Legacy: usar latitude/longitude para fotos 360
    x = parseFloat(photo.latitude) || 0
    y = parseFloat(photo.longitude) || 0
    z = parseFloat(photo.description?.match(/z:([-\d.]+)/)?.[1] || 0)
  }

  // Obtener orientación (solo para fotos 360°)
  const orientation = isNormalImage ? null : getOrientation(photo)

  useFrame(() => {
    if (meshRef.current && hovered) {
      meshRef.current.rotation.y += 0.02
    }
  })

  return (
    <group position={[x, z, y]}>
      {/* Marcador diferente según tipo */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          onClick(photo)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
        }}
        rotation={orientation ? [orientation.pitch, orientation.yaw, orientation.roll] : [0, 0, 0]}
      >
        {/* ✅ Foto 360: Cono (cámara) | Imagen normal: Esfera */}
        {isNormalImage ? (
          <sphereGeometry args={[0.6, 16, 16]} />
        ) : (
          <coneGeometry args={[0.5, 1.5, 4]} />
        )}
        <meshStandardMaterial
          color={isActive ? '#10b981' : hovered ? '#667eea' : isNormalImage ? '#f59e0b' : '#4a5568'}
          emissive={isActive ? '#10b981' : hovered ? '#667eea' : '#000000'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Flecha que indica dirección */}
      {orientation && (
        <group rotation={[0, orientation.yaw, 0]}>
          <mesh ref={arrowRef} position={[0, 0.5, 1]}>
            <coneGeometry args={[0.3, 0.8, 3]} />
            <meshStandardMaterial 
              color={isActive ? '#10b981' : hovered ? '#667eea' : '#f59e0b'}
              emissive={isActive ? '#10b981' : hovered ? '#667eea' : '#f59e0b'}
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      )}
      
      {hovered && (
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {photo.title}
        </Text>
      )}
    </group>
  )
}

const Ground = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
    </mesh>
  )
}

const GridHelper = () => {
  return (
    <gridHelper args={[200, 20, '#4a5568', '#2d3748']} />
  )
}

const SkyGradient = () => {
  const mesh = useRef()
  
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#2d3748')
    gradient.addColorStop(0.3, '#4a5568')
    gradient.addColorStop(0.6, '#5a7a9e')
    gradient.addColorStop(1, '#87ceeb')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 2, 256)
    
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[150, 32, 32]} />
      <meshBasicMaterial map={gradientTexture} side={THREE.BackSide} />
    </mesh>
  )
}

const Scene = ({ photos, onPhotoClick, activePhotoId }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[20, 20, 20]} />
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={100}
      />
      
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />
      
      <SkyGradient />
      <Ground />
      <GridHelper />
      
      {photos.map(photo => (
        <CameraMarker 
          key={photo.id} 
          photo={photo} 
          onClick={onPhotoClick}
          isActive={photo.id === activePhotoId}
        />
      ))}
    </>
  )
}

const CameraMap3D = ({ photos, onPhotoClick, activePhotoId, onClose, embedded = false }) => {
  // 🔍 DEBUG: Ver todas las fotos que llegan
  console.log('🔍 CameraMap3D - Total photos:', photos.length)
  if (photos.length > 0) {
    console.log('🔍 Primera foto completa:', photos[0])
  }

  // ✅ FILTRAR FOTOS CON COORDENADAS (LEGACY O NUEVO SISTEMA)
  const photosWithCoords = photos.filter(p => {
    // Tiene coordenadas del proyecto (nuevo sistema)
    const hasProjectCoords = p.project_x !== undefined && p.project_x !== null &&
                             p.project_y !== undefined && p.project_y !== null
    // Tiene coordenadas legacy (fotos 360 antiguas) - verificar que no sean null, undefined o strings vacíos
    const hasLegacyCoords = (p.latitude !== undefined && p.latitude !== null && p.latitude !== '' &&
                             p.longitude !== undefined && p.longitude !== null && p.longitude !== '')
    // Tiene coordenadas geo (nuevo sistema)
    const hasGeoCoords = p.geo_latitude !== undefined && p.geo_latitude !== null &&
                         p.geo_longitude !== undefined && p.geo_longitude !== null

    // 🔍 DEBUG por foto
    if (hasProjectCoords || hasLegacyCoords || hasGeoCoords) {
      console.log('✅ Foto CON coords:', {
        id: p.id,
        title: p.title || p.filename,
        project_x: p.project_x,
        project_y: p.project_y,
        latitude: p.latitude,
        longitude: p.longitude,
        geo_latitude: p.geo_latitude,
        geo_longitude: p.geo_longitude
      })
    }

    return hasProjectCoords || hasLegacyCoords || hasGeoCoords
  })

  console.log('🔍 Fotos con coordenadas filtradas:', photosWithCoords.length)

  // ✅ NORMALIZAR COORDENADAS GRANDES (para coordenadas UTM o grandes)
  // Calcular centro de masa para centrar el modelo en el origen
  const normalizedPhotos = useMemo(() => {
    if (photosWithCoords.length === 0) return []

    // Extraer todas las coordenadas VÁLIDAS
    const coords = photosWithCoords.map(p => {
      let x, y, z

      // Prioridad 1: Coordenadas del proyecto (nuevo sistema)
      if (p.project_x !== undefined && p.project_x !== null && p.project_x !== '') {
        const px = parseFloat(p.project_x)
        const py = parseFloat(p.project_y)
        const pz = parseFloat(p.project_z)

        // Verificar que sean números válidos
        if (!isNaN(px) && !isNaN(py)) {
          x = px
          y = py
          z = !isNaN(pz) ? pz : 0
          return { x, y, z, valid: true }
        }
      }

      // Prioridad 2: Coordenadas legacy (latitude/longitude)
      if (p.latitude !== undefined && p.latitude !== null && p.latitude !== '') {
        const lat = parseFloat(p.latitude)
        const lng = parseFloat(p.longitude)

        if (!isNaN(lat) && !isNaN(lng)) {
          x = lat
          y = lng
          z = parseFloat(p.description?.match(/z:([-\d.]+)/)?.[1]) || 0
          return { x, y, z, valid: true }
        }
      }

      // Prioridad 3: Coordenadas geo (nuevo sistema)
      if (p.geo_latitude !== undefined && p.geo_latitude !== null) {
        const lat = parseFloat(p.geo_latitude)
        const lng = parseFloat(p.geo_longitude)

        if (!isNaN(lat) && !isNaN(lng)) {
          x = lat
          y = lng
          z = 0
          return { x, y, z, valid: true }
        }
      }

      // Si no tiene coordenadas válidas, marcar como inválido
      return { x: 0, y: 0, z: 0, valid: false }
    })

    // Filtrar solo coordenadas válidas para calcular el centro
    const validCoords = coords.filter(c => c.valid)

    console.log('🔍 Normalización - Coords válidas:', validCoords.length)
    console.log('🔍 Primera coord válida:', validCoords[0])

    if (validCoords.length === 0) {
      console.log('⚠️ NO hay coordenadas válidas para normalizar')
      return photosWithCoords
    }

    // Calcular el mínimo de cada eje (para coordenadas UTM grandes)
    const minX = Math.min(...validCoords.map(c => c.x))
    const minY = Math.min(...validCoords.map(c => c.y))
    const minZ = Math.min(...validCoords.map(c => c.z))

    console.log('🔍 Centro de normalización (min):', { minX, minY, minZ })

    // Normalizar: restar el mínimo a cada coordenada VÁLIDA
    return photosWithCoords.map((photo, i) => {
      if (!coords[i].valid) {
        // Si la foto no tiene coordenadas válidas, no agregarle normalized
        return photo
      }

      return {
        ...photo,
        normalized_x: coords[i].x - minX,
        normalized_y: coords[i].y - minY,
        normalized_z: coords[i].z - minZ
      }
    })
  }, [photosWithCoords])

  if (embedded) {
    return (
      <div className="camera-map-embedded">
        <Canvas>
          <Scene
            photos={normalizedPhotos}
            onPhotoClick={onPhotoClick}
            activePhotoId={activePhotoId}
          />
        </Canvas>
        <div className="camera-map-info-embedded">
          <span>🖱️ Arrastrar: Rotar | Rueda: Zoom | Click derecho: Mover | 🎯 Flechas amarillas = Dirección de la foto</span>
        </div>
      </div>
    )
  }

  return (
    <div className="camera-map-overlay">
      <div className="camera-map-header">
        <div>
          <h3>Vista 3D del Proyecto</h3>
          <p>{normalizedPhotos.length} fotos con coordenadas</p>
        </div>
        <button className="camera-map-close" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="camera-map-container">
        <Canvas>
          <Scene
            photos={normalizedPhotos}
            onPhotoClick={onPhotoClick}
            activePhotoId={activePhotoId}
          />
        </Canvas>
      </div>

      <div className="camera-map-legend">
        <div className="legend-item">
          <div className="legend-icon" style={{background: '#4a5568'}}></div>
          <span>Foto 360° (Cono)</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon" style={{background: '#f59e0b'}}></div>
          <span>Imagen Normal (Esfera)</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon" style={{background: '#667eea'}}></div>
          <span>Hover</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon" style={{background: '#10b981'}}></div>
          <span>Activa</span>
        </div>
      </div>

      <div className="camera-map-controls-info">
        <p>🖱️ Click izquierdo: Rotar | Rueda: Zoom | Click derecho: Mover | 🎯 Flechas naranjas indican hacia dónde mira cada cámara</p>
      </div>
    </div>
  )
}

export default CameraMap3D
