import { useState, useEffect } from 'react';
import { Users, Crown, Edit, Trash2, Shield, X } from 'lucide-react';
import api from '../config/axios';
import toast from 'react-hot-toast';
import './CollaboratorsList.css';

const CollaboratorsList = ({ projectId, onClose, canManage = false }) => {
  const [collaborators, setCollaborators] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollaborators();
  }, [projectId]);

  const fetchCollaborators = async () => {
    try {
      const response = await api.get(`/projects/${projectId}/collaborators`);  // ✅
      setCollaborators(response.data);
    } catch (error) {
      console.error('Error obteniendo colaboradores:', error);
      toast.error('Error al cargar colaboradores');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (userId, username) => {
    if (!confirm(`¿Estás seguro de eliminar a ${username} del proyecto?`)) {
      return;
    }

    try {
      await api.delete(`/invitations/projects/${projectId}/collaborators/${userId}`);
      toast.success(`${username} eliminado del proyecto`);
      fetchCollaborators();
    } catch (error) {
      console.error('Error eliminando colaborador:', error);
      const errorMsg = error.response?.data?.detail || 'Error al eliminar colaborador';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading">Cargando colaboradores...</div>
        </div>
      </div>
    );
  }

  if (!collaborators) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content collaborators-modal">
        <div className="modal-header">
          <h2>
            <Users size={24} />
            Colaboradores del Proyecto
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="collaborators-list">
          {/* Propietario */}
          <div className="collaborator-item owner">
            <div className="collaborator-avatar">
              <Crown size={24} />
            </div>
            <div className="collaborator-info">
              <div className="collaborator-name">
                {collaborators.owner.username}
                <span className="role-badge owner-badge">Propietario</span>
              </div>
              <div className="collaborator-email">{collaborators.owner.email}</div>
            </div>
            <div className="collaborator-permissions">
              <span className="permission-badge">
                <Shield size={14} />
                Acceso total
              </span>
            </div>
          </div>

          {/* Colaboradores */}
          {collaborators.collaborators.length > 0 ? (
            collaborators.collaborators.map((collab) => (
              <div key={collab.id} className="collaborator-item">
                <div className="collaborator-avatar">
                  <Users size={24} />
                </div>
                <div className="collaborator-info">
                  <div className="collaborator-name">
                    {collab.username}
                    <span className={`role-badge ${collab.permission_level}`}>
                      {collab.permission_level === 'global' ? 'Global' : 'Colaborador'}
                    </span>
                  </div>
                  <div className="collaborator-email">{collab.email}</div>
                  <div className="collaborator-date">
                    Añadido: {new Date(collab.added_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="collaborator-permissions">
                  {collab.can_edit && (
                    <span className="permission-badge">
                      <Edit size={14} />
                      Editar
                    </span>
                  )}
                  {collab.can_delete && (
                    <span className="permission-badge">
                      <Trash2 size={14} />
                      Eliminar
                    </span>
                  )}
                  {collab.can_invite && (
                    <span className="permission-badge">
                      <Users size={14} />
                      Invitar
                    </span>
                  )}
                </div>
                {canManage && (
                  <button
                    className="btn-remove-collaborator"
                    onClick={() => handleRemoveCollaborator(collab.id, collab.username)}
                    title="Eliminar colaborador"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="no-collaborators">
              <Users size={48} color="#cbd5e0" />
              <p>No hay colaboradores en este proyecto</p>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsList;