import React, { useState, useEffect } from 'react';
import './MobileCaptureModal.css';

const MobileCaptureModal = ({ position, onSave, onClose }) => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [level, setLevel] = useState('');
    const [room, setRoom] = useState('');
    const [pk, setPk] = useState('');
    const [comment, setComment] = useState('');
    const [availableLevels, setAvailableLevels] = useState([]);
    const [availableRooms, setAvailableRooms] = useState([]);

    // Cargar etiquetas al iniciar
    useEffect(() => {
        loadAvailableTags();
    }, []);

    const loadAvailableTags = () => {
        try {
            const levels = ['', 'P00', 'P01', 'P02', 'P03', 'P04', 'S01', 'S02', 'S03'];
            const rooms = ['', 'Salon', 'Cocina', 'Baño', 'Dormitorio', 'Oficina', 'Terraza', 'Garaje', 'Fachada', 'Jardin', 'Piscina'];
            
            setAvailableLevels(levels);
            setAvailableRooms(rooms);
        } catch (error) {
            console.error('Error cargando etiquetas:', error);
            setAvailableLevels(['', 'P00', 'P01', 'P02']);
            setAvailableRooms(['', 'Salon', 'Cocina', 'Baño']);
        }
    };

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

    const handleSave = async () => {
        if (!capturedImage) {
            alert('Primero captura una imagen');
            return;
        }

        const cloudinaryResult = await uploadToCloudinary(capturedImage);
        
        if (cloudinaryResult) {
            const imageData = {
                file: capturedImage,
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

            onSave(imageData);
        }
    };

    return (
        <div className="mobile-modal-overlay">
            <div className="mobile-modal-content">
                <div className="modal-header">
                    <h3>📸 Capturar Imagen</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {!capturedImage && (
                    <div className="camera-section">
                        <button className="camera-btn" onClick={openNativeCamera}>
                            📷 Abrir Cámara
                        </button>
                        <p className="help-text">Toca para abrir la cámara de tu móvil</p>
                    </div>
                )}

                {capturedImage && (
                    <div className="image-preview">
                        <img 
                            src={URL.createObjectURL(capturedImage)} 
                            alt="Capturada" 
                        />
                        <p className="image-size">✅ Imagen lista para subir</p>
                    </div>
                )}

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

                <div className="location-info">
                    <h4>📍 Ubicación Seleccionada</h4>
                    <p>Lat: {position?.lat.toFixed(6)}</p>
                    <p>Lng: {position?.lng.toFixed(6)}</p>
                </div>

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