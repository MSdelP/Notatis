// Notitas_Web/src/components/PermissionList.tsx

import React, { useEffect, useState } from 'react';
import { getPermissions, removePermission, Permission } from '../api/permissions';

interface PermissionListProps {
  resourceType: 'page' | 'database';
  resourceId: string;
  isOwner: boolean;
}

const PermissionList: React.FC<PermissionListProps> = ({
  resourceType,
  resourceId,
  isOwner
}) => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const perms = await getPermissions(resourceType, resourceId);
      setPermissions(perms);
    } catch (err: any) {
      console.error('Error fetching permissions:', err);
      setError('No se pudieron cargar los colaboradores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [resourceType, resourceId]);

  const handleRemove = async (permId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este permiso?')) return;
    try {
      await removePermission(permId);
      setPermissions((prev) => prev.filter((p) => p._id !== permId));
    } catch (err) {
      console.error('Error removing permission:', err);
      alert('No se pudo revocar el permiso');
    }
  };

  if (loading) return <p>Cargando colaboradores…</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (permissions.length === 0) return <p>No hay colaboradores aún.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {permissions.map((perm) => (
        <li
          key={perm._id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f9f9f9',
            padding: '4px 8px',
            borderRadius: '4px',
            marginBottom: '4px'
          }}
        >
          <span>
            {perm.user.email} ({perm.role})
          </span>
          {isOwner && perm.role !== 'owner' && (
            <button
              onClick={() => handleRemove(perm._id)}
              style={{
                backgroundColor: '#f44336',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Revocar
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export default PermissionList;
