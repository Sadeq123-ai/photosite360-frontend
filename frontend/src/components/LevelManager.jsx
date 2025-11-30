import React, { useState, useEffect } from 'react';
import './LevelManager.css';

const LevelManager = ({ projectId, onLevelsUpdate, onClose }) => {
    const [levels, setLevels] = useState([]);
    const [newLevel, setNewLevel] = useState({ name: '', height: 0, type: 'piso' });

    // Niveles predefinidos
    const predefinedLevels = [
        { name: 'P00', height: 0, type: 'piso' },
        { name: 'P01', height: 3, type: 'piso' },
        { name: 'P02', height: 6, type: 'piso' },
        { name: 'P03', height: 9, type: 'piso' },
        { name: 'S01', height: -3, type: 'sotano' },
        { name: 'S02', height: -6, type: 'sotano' },
        { name: 'C01', height: 0, type: 'cubierta' }
    ];

    useEffect(() => {
        loadLevels();
    }, [projectId]);

    const loadLevels = () => {
        const saved = localStorage.getItem(`project_levels_${projectId}`);
        if (saved) {
            setLevels(JSON.parse(saved));
        } else {
            setLevels(predefinedLevels);
        }
    };

    const saveLevels = (updatedLevels) => {
        setLevels(updatedLevels);
        localStorage.setItem(`project_levels_${projectId}`, JSON.stringify(updatedLevels));
        if (onLevelsUpdate) onLevelsUpdate(updatedLevels);
    };

    const addLevel = () => {
        if (newLevel.name && !levels.find(l => l.name === newLevel.name)) {
            const updated = [...levels, { ...newLevel, height: parseFloat(newLevel.height) }];
            saveLevels(updated);
            setNewLevel({ name: '', height: 0, type: 'piso' });
        }
    };

    const updateLevel = (index, field, value) => {
        const updated = [...levels];
        updated[index][field] = field === 'height' ? parseFloat(value) : value;
        saveLevels(updated);
    };

    const deleteLevel = (index) => {
        const updated = levels.filter((_, i) => i !== index);
        saveLevels(updated);
    };

    const importFromCSV = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const importedLevels = [];

            lines.forEach((line, index) => {
                if (index === 0 || !line.trim()) return; // Saltar header y líneas vacías
                
                const [name, height, type] = line.split(';');
                if (name && height) {
                    importedLevels.push({
                        name: name.trim(),
                        height: parseFloat(height.trim()),
                        type: type?.trim() || 'piso'
                    });
                }
            });

            if (importedLevels.length > 0) {
                saveLevels(importedLevels);
            }
        };
        reader.readAsText(file);
    };

    const exportToCSV = () => {
        let csv = 'Nivel;Altura;Tipo\n';
        levels.forEach(level => {
            csv += `${level.name};${level.height};${level.type}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `niveles_proyecto_${projectId}.csv`);
        link.click();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content level-manager">
                <div className="modal-header">
                    <h3>🏗️ Gestión de Niveles y Alturas</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {/* Importar/Exportar */}
                    <div className="import-export-section">
                        <h4>📁 Importar/Exportar Configuración</h4>
                        <div className="import-export-buttons">
                            <label className="btn btn-secondary">
                                📥 Importar CSV
                                <input
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={importFromCSV}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            <button className="btn btn-secondary" onClick={exportToCSV}>
                                📤 Exportar CSV
                            </button>
                        </div>
                    </div>

                    {/* Añadir nuevo nivel */}
                    <div className="add-level-section">
                        <h4>➕ Añadir Nuevo Nivel</h4>
                        <div className="add-level-form">
                            <input
                                type="text"
                                placeholder="Nombre (ej: P04, S03)"
                                value={newLevel.name}
                                onChange={(e) => setNewLevel({...newLevel, name: e.target.value.toUpperCase()})}
                            />
                            <input
                                type="number"
                                placeholder="Altura (m)"
                                step="0.1"
                                value={newLevel.height}
                                onChange={(e) => setNewLevel({...newLevel, height: parseFloat(e.target.value) || 0})}
                            />
                            <select
                                value={newLevel.type}
                                onChange={(e) => setNewLevel({...newLevel, type: e.target.value})}
                            >
                                <option value="piso">Piso</option>
                                <option value="sotano">Sótano</option>
                                <option value="cubierta">Cubierta</option>
                            </select>
                            <button className="btn btn-primary" onClick={addLevel}>
                                ➕ Añadir
                            </button>
                        </div>
                    </div>

                    {/* Lista de niveles */}
                    <div className="levels-list-section">
                        <h4>📊 Niveles Configurados</h4>
                        <div className="levels-table">
                            <div className="table-header">
                                <span>Nivel</span>
                                <span>Altura (m)</span>
                                <span>Tipo</span>
                                <span>Acciones</span>
                            </div>
                            {levels.map((level, index) => (
                                <div key={index} className="table-row">
                                    <input
                                        type="text"
                                        value={level.name}
                                        onChange={(e) => updateLevel(index, 'name', e.target.value.toUpperCase())}
                                    />
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={level.height}
                                        onChange={(e) => updateLevel(index, 'height', e.target.value)}
                                    />
                                    <select
                                        value={level.type}
                                        onChange={(e) => updateLevel(index, 'type', e.target.value)}
                                    >
                                        <option value="piso">Piso</option>
                                        <option value="sotano">Sótano</option>
                                        <option value="cubierta">Cubierta</option>
                                    </select>
                                    <button 
                                        className="btn-danger small"
                                        onClick={() => deleteLevel(index)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={onClose}>
                        ✅ Guardar y Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LevelManager;