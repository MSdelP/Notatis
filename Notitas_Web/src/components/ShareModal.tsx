// Notitas_Web/src/components/ShareModal.tsx

import React, { useState } from 'react';
import { assignPermission } from '../api/permissions';

interface ShareModalProps {
  resourceType: 'page' | 'database';
  resourceId: string;
  onShared?: () => void; // callback opcional para recargar la lista de permisos
}

const ShareModal: React.FC<ShareModalProps> = ({
  resourceType,
  resourceId,
  onShared
}) => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'edit' | 'view'>('view');
  const [loading, setLoading] = useState(false);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await assignPermission(resourceType, resourceId, email.trim(), role);
      setEmail('');
      setRole('view');
      setOpen(false);
      if (onShared) onShared();
      alert('Permiso asignado correctamente.');
    } catch (err: any) {
      console.error('Error assigning permission:', err);
      alert(err.response?.data?.message || 'No se pudo asignar permiso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          padding: '6px 12px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Compartir
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '8px',
              minWidth: '300px'
            }}
          >
            <h3>Compartir este {resourceType === 'database' ? 'Proyecto' : 'Recurso'}</h3>
            <form onSubmit={handleShare} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="email"
                placeholder="Email del colaborador"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: '6px', fontSize: '1rem' }}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'edit' | 'view')}
                style={{ padding: '6px', fontSize: '1rem' }}
              >
                <option value="edit">Editar</option>
                <option value="view">Ver</option>
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ccc',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Compartiendo…' : 'Compartir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareModal;
