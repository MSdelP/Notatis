// Notitas_Web/src/api/permissions.ts
import axios from 'axios';

export interface Permission {
  _id: string;
  resourceType: 'page' | 'database';
  resourceId: string;
  user: {
    _id: string;
    email: string;
  };
  role: 'owner' | 'edit' | 'view';
}

// Obtener permisos de un recurso (resourceType + resourceId en query)
// Ejemplo: GET /api/permissions?resourceType=database&resourceId=629abf...
export const getPermissions = (resourceType: string, resourceId: string) =>
  axios
    .get<Permission[]>(`/api/permissions`, {
      params: { resourceType, resourceId }
    })
    .then((r) => r.data);

// Asignar o actualizar permiso (POST /api/permissions)
// body: { resourceType, resourceId, email, role }
export const assignPermission = (
  resourceType: string,
  resourceId: string,
  email: string,
  role: 'owner' | 'edit' | 'view'
) =>
  axios
    .post<Permission>(`/api/permissions`, { resourceType, resourceId, email, role })
    .then((r) => r.data);

// Revocar permiso (DELETE /api/permissions/:id)
export const removePermission = (permissionId: string) =>
  axios.delete(`/api/permissions/${permissionId}`);
