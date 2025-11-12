import { useState, useEffect } from 'react';
import './MobileCaptureModal.css';

const MobileCaptureModal = ({ position, onSave, onClose }) => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [level, setLevel] = useState('');
    const [room, setRoom] = useState('');
    const [pk, setPk] = useState('');
    const [comment, setComment] = useState('');
    const [availableLevels, setAvailableLevels] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);

    // ✅ CARGAR ETIQUETAS EXISTENTES
    useEffect(() => {
        loadAvailableTags();
    }, []);

    const loadAvailableTags = () => {
        try {
            // Cargar etiquetas del localStorage (mismo sistema que TagManager)
            const savedTags = JSON.parse(localStorage.getItem(`project_tags`) || '[]');
            const predefinedTags = [
                { id: 'p00', name: 'P00', category: 'Planta' },
                { id: 'p01', name: 'P01', category: 'Planta' },
                { id: 'p02', name: 'P02', category: 'Planta' },
                { id: 'p03', name: 'P03', category: 'Planta' },
                { id: 'p04', name: 'P04', category: 'Planta' },
                { id: 's01', name: 'S01', category: 'Sección' },
                { id: 's02', name: 'S02', category: 'Sección' },
                { id: 's03', name: 'S03', category: 'Sección' },
                { id: 'salon', name: 'Salon', category: 'Espacio' },
                { id: 'cocina', name: 'Cocina', category: 'Espacio' },
                { id: 'baño', name: 'Baño', category: 'Espacio' },
                { id: 'dormitorio', name: 'Dormitorio', category: 'Espacio' },
                { id: 'oficina', name: 'Oficina', category: 'Espacio' },
                { id: 'terraza', name: 'Terraza', category: 'Espacio' },
                { id: 'garaje', name: 'Garaje', category: 'Espacio' },
                { id: 'fachada', name: 'Fachada', category: 'Exterior' },
                { id: 'jardin', name: 'Jardin', category: 'Exterior' },
                { id: 'piscina', name: 'Piscina', category: 'Exterior' },
            ];
            
            const allTags = [...predefinedTags, ...savedTags];
            
            // Separar por categorías
            const levels = allTags.filter(tag => tag.category === 'Planta').map(tag => tag.name);
            const rooms = allTags.filter(tag => tag.category === 'Espacio' || tag.category === 'Exterior').map(tag => tag.name);
            
            setAvailableLevels(['', ...levels]);
            setAvailableRooms(['', ...rooms]);
            
        } catch (error) {
            console.error('Error cargando etiquetas:', error);
            // Valores por defecto
            setAvailableLevels(['', 'P00', 'P01', 'P02', 'P03', 'P04', 'S01', 'S02', 'S03']);
            setAvailableRooms(['', 'Salon', 'Cocina', 'Baño', 'Dormitorio', 'Oficina', 'Terraza', 'Garaje', 'Fachada', 'Jardin', 'Piscina']);
        }
    };

    // Abrir cámara nativa del móvil
    const openNativeCamera = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.style.display = 'none';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setCapturedImage(file);
            }
        };
        
        document.body.appendChild(input);
        input.click();
    };

    // Subir imagen a Cloudinary
    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'photosite360');

        try {
            const response = await fetch('https://api.cloudinary.com/v1_1/dryuzad8w/image/upload', {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            console.error('Error subiendo a Cloudinary:', error);
            return null;
        }
    };

    // Guardar todo
    const handleSave = async () => {
        if (!capturedImage) {
            alert('Primero captura una imagen');
            return;
        }

        // Subir imagen a Cloudinary
        const cloudinaryResult = await uploadToCloudinary(capturedImage);
        
        if (cloudinaryResult) {
            // Preparar datos para guardar
            const imageData = {
                file: capturedImage, // ✅ Imagen real para subir al backend
                url: cloudinaryResult.secure_url,
                latitude: position.lat,
                longitude: position.lng,
                level: level,
                room: room,
                pk: pk,
                comment: comment,
                filename: capturedImage.name,
                uploaded_at: new Date().toISOString(),
                title: `Imagen ${new Date().toLocaleString()}`,
                tags: [level, room, pk].filter(Boolean).join(', '),
                type: 'normal'
            };

            // Llamar función padre para guardar en backend
            onSave(imageData);
        }
    };

    return (
        <div className="mobile-modal-overlay">
            <div className="mobile-modal-content">
                {/* Header */}
                <div className="modal-header">
                    <h3>📸 Capturar Imagen</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Botón de cámara */}
                {!capturedImage && (
                    <div className="camera-section">
                        <button className="camera-btn" onClick={openNativeCamera}>
                            📷 Abrir Cámara
                        </button>
                        <p className="help-text">Toca para abrir la cámara de tu móvil</p>
                    </div>
                )}

                {/* Preview de imagen */}
                {capturedImage && (
                    <div className="image-preview">
                        <img 
                            src={URL.createObjectURL(capturedImage)} 
                            alt="Capturada" 
                        />
                        <p className="image-size">
                            ✅ Imagen lista para subir
                        </p>
                    </div>
                )}

                {/* Formulario de etiquetas MEJORADO */}
                <div className="tagging-form">
                    <div className="form-group">
                        <label>🏗️ Nivel</label>
                        <select 
                            value={level} 
                            onChange={(e) => setLevel(e.target.value)}
                            className="touch-select"
                        >
                            {availableLevels.map((lvl, index) => (
                                <option key={index} value={lvl}>
                                    {lvl || 'Seleccionar nivel'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>🚪 Habitación/Zona</label>
                        <select 
                            value={room} 
                            onChange={(e) => setRoom(e.target.value)}
                            className="touch-select"
                        >
                            {availableRooms.map((rm, index) => (
                                <option key={index} value={rm}>
                                    {rm || 'Seleccionar zona'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>📏 PK (Obra Lineal)</label>
                        <input
                            type="text"
                            value={pk}
                            onChange={(e) => setPk(e.target.value)}
                            placeholder="Ej: 0+250, 1+500"
                            className="touch-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>💬 Comentario</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Describe lo que se ve en la imagen..."
                            rows="3"
                        />
                    </div>
                </div>

                {/* Información de ubicación */}
                <div className="location-info">
                    <h4>📍 Ubicación Seleccionada</h4>
                    <p>Lat: {position?.lat.toFixed(6)}</p>
                    <p>Lng: {position?.lng.toFixed(6)}</p>
                </div>

                {/* Botones de acción */}
                <div className="action-buttons">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancelar
                    </button>
                    <button 
                        className="btn-save" 
                        onClick={handleSave}
                        disabled={!capturedImage}
                    >
                        ✅ Guardar en Nube
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileCaptureModal;