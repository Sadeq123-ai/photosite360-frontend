import { useState } from 'react';
import './MobileCaptureModal.css';

const MobileCaptureModal = ({ position, onSave, onClose }) => {
    const [capturedImage, setCapturedImage] = useState(null);
    const [level, setLevel] = useState('');
    const [room, setRoom] = useState('');
    const [pk, setPk] = useState('');
    const [comment, setComment] = useState('');

    // Abrir cámara nativa del móvil
    const openNativeCamera = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Cámara trasera
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

        // Subir imagen
        const cloudinaryResult = await uploadToCloudinary(capturedImage);
        
        if (cloudinaryResult) {
            // Guardar en base de datos
            const imageData = {
                url: cloudinaryResult.secure_url,
                latitude: position.lat,
                longitude: position.lng,
                level: level,
                room: room,
                pk: pk,
                comment: comment,
                filename: capturedImage.name,
                uploaded_at: new Date().toISOString(),
                title: `Foto ${new Date().toLocaleString()}`,
                tags: [level, room].filter(Boolean).join(', ')
            };

            // Llamar función padre para guardar
            onSave(imageData);
            onClose();
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

                {/* Formulario de etiquetas */}
                <div className="tagging-form">
                    <div className="form-group">
                        <label>🏗️ Nivel</label>
                        <select 
                            value={level} 
                            onChange={(e) => setLevel(e.target.value)}
                            className="touch-select"
                        >
                            <option value="">Seleccionar nivel</option>
                            <option value="P00">P00 - Planta Baja</option>
                            <option value="P01">P01 - Primera Planta</option>
                            <option value="P02">P02 - Segunda Planta</option>
                            <option value="S01">S01 - Sótano 1</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>🚪 Habitación/Zona</label>
                        <select 
                            value={room} 
                            onChange={(e) => setRoom(e.target.value)}
                            className="touch-select"
                        >
                            <option value="">Seleccionar zona</option>
                            <option value="Salón">Salón</option>
                            <option value="Cocina">Cocina</option>
                            <option value="Baño">Baño</option>
                            <option value="Dormitorio">Dormitorio</option>
                            <option value="Oficina">Oficina</option>
                            <option value="Garaje">Garaje</option>
                            <option value="Exterior">Exterior</option>
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