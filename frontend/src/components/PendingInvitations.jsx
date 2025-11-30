import { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Clock, Shield, Briefcase } from 'lucide-react';
import api from '../config/axios';
import toast from 'react-hot-toast';
import './PendingInvitations.css';

const PendingInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingInvitations();
  }, []);

  const fetchPendingInvitations = async () => {
    try {
      const response = await api.get('/invitations/pending');  // ✅ BIEN
      setInvitations(response.data);
    } catch (error) {
      console.error('Error obteniendo invitaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (token) => {
    try {
      const response = await api.post(`/invitations/invitations/${token}/accept`);
      toast.success(response.data.message || 'Invitación aceptada');
      fetchPendingInvitations();
      
      // Recargar la página para actualizar la lista de proyectos
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error aceptando invitación:', error);
      const errorMsg = error.response?.data?.detail || 'Error al aceptar la invitación';
      toast.error(errorMsg);
    }
  };

  const handleReject = async (token) => {
    if (!confirm('¿Estás seguro de rechazar esta invitación?')) {
      return;
    }

    try {
      await api.post(`/invitations/invitations/${token}/reject`);
      toast.success('Invitación rechazada');
      fetchPendingInvitations();
    } catch (error) {
      console.error('Error rechazando invitación:', error);
      toast.error('Error al rechazar la invitación');
    }
  };

  if (loading) {
    return (
      <div className="pending-invitations-loading">
        <Clock size={24} />
        <span>Cargando invitaciones...</span>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="pending-invitations-container">
      <div className="pending-invitations-header">
        <Mail size={24} />
        <h3>Invitaciones Pendientes ({invitations.length})</h3>
      </div>

      <div className="invitations-list">
        {invitations.map((invitation) => (
          <div key={invitation.id} className="invitation-card">
            <div className="invitation-icon">
              {invitation.permission_level === 'global' ? (
                <Shield size={32} color="#28a745" />
              ) : (
                <Briefcase size={32} color="#007bff" />
              )}
            </div>

            <div className="invitation-content">
              <div className="invitation-title">
                {invitation.permission_level === 'global' ? (
                  <>
                    <h4>Invitación como Colaborador Global</h4>
                    <span className="badge badge-global">Acceso Completo</span>
                  </>
                ) : (
                  <>
                    <h4>Proyecto: {invitation.project_name}</h4>
                    <span className="badge badge-project">Colaborador</span>
                  </>
                )}
              </div>

              <div className="invitation-details">
                <p>
                  <strong>{invitation.inviter}</strong> te ha invitado a colaborar
                </p>
                {invitation.message && (
                  <p className="invitation-message">"{invitation.message}"</p>
                )}
                <p className="invitation-date">
                  <Clock size={14} />
                  Expira: {new Date(invitation.expires_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="invitation-actions">
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleAccept(invitation.token)}
              >
                <CheckCircle size={18} />
                Aceptar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleReject(invitation.token)}
              >
                <XCircle size={18} />
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingInvitations;