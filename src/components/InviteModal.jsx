import { useState } from 'react';
import { X, Mail, Send, UserPlus, Users } from 'lucide-react';
import api from '../config/axios';
import toast from 'react-hot-toast';
import './InviteModal.css';

const InviteModal = ({ 
  projectId = null, 
  projectName = null,
  isGlobal = false,
  onClose, 
  onInviteSent 
}) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [permissionLevel, setPermissionLevel] = useState('PROJECT_COLLABORATOR');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isGlobal 
        ? '/invitations/invite-global'
        : `/projects/${projectId}/invite`;

      const payload = {
        invitee_email: email,
        message: message || null,
        ...(isGlobal 
          ? { permission_level: 'GLOBAL_COLLABORATOR' }
          : { permission_level: permissionLevel }
        )
      };

      console.log('📤 Enviando invitación:', { endpoint, payload });

      const response = await api.post(endpoint, payload);

      console.log('✅ Respuesta:', response.data);
      toast.success('✅ Invitación enviada exitosamente');
      
      if (onInviteSent) {
        onInviteSent();
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Error enviando invitación:', error);
      
      const errorMessage = error.response?.data?.detail 
        || error.message 
        || 'Error al enviar invitación';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {isGlobal ? (
              <>
                <Users size={24} color="#667eea" />
                <h2>Invitar Colaborador Global</h2>
              </>
            ) : (
              <>
                <UserPlus size={24} color="#667eea" />
                <h2>Invitar al Proyecto</h2>
              </>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="invite-form">
          {!isGlobal && projectName && (
            <div className="project-info">
              <strong>Proyecto:</strong> {projectName}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              Email del colaborador *
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colaborador@ejemplo.com"
              required
              autoFocus
            />
          </div>

          {!isGlobal && (
            <div className="form-group">
              <label htmlFor="permissionLevel">Nivel de permisos</label>
              <select
                id="permissionLevel"
                className="input"
                value={permissionLevel}
                onChange={(e) => setPermissionLevel(e.target.value)}
              >
                <option value="VIEWER">👁️ Visualizador (solo ver)</option>
                <option value="PROJECT_COLLABORATOR">✏️ Colaborador (ver y editar)</option>
              </select>
            </div>
          )}

          {isGlobal && (
            <div className="info-box">
              <p>
                <strong>ℹ️ Colaborador Global:</strong> Tendrá acceso a todos tus proyectos 
                con permisos de visualización y edición.
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="message">Mensaje personalizado (opcional)</label>
            <textarea
              id="message"
              className="input textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje para el colaborador..."
              rows="4"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !email}
            >
              <Send size={18} />
              {loading ? 'Enviando...' : 'Enviar Invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteModal;