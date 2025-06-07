// Notitas_Web/src/pages/DatabaseDetail.tsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getDatabase,
  Database,
  updateEntry,
  deleteEntry,
  createEntry
} from '../api/databases';
import { getPermissions, Permission } from '../api/permissions';
import TableView from '../components/TableView';
import KanbanView from '../components/KanbanView';
import CalendarView from '../components/CalendarView';
import PermissionList from '../components/PermissionList';
import ShareModal from '../components/ShareModal';
import { AuthContext } from '../context/AuthContext';

const DatabaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [db, setDb] = useState<Database | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estado para edición in-place de name/description
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Estado para permisos (miembros)
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  // Vista activa: 'table' | 'kanban' | 'calendar'
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'calendar'>('table');

  useEffect(() => {
    if (id) {
      fetchDatabase(id);
    }
  }, [id]);

  // Traer la DB desde el backend
  const fetchDatabase = async (dbId: string) => {
    setLoading(true);
    try {
      const data = await getDatabase(dbId);
      setDb(data);
      setNewName(data.name);
      setNewDesc(data.description);
      fetchPermissions(data._id);
    } catch (err: any) {
      console.error('Error fetching database:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Traer permisos (miembros)
  const fetchPermissions = async (dbId: string) => {
    setLoadingPerms(true);
    try {
      const perms = await getPermissions('database', dbId);
      setPermissions(perms);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setPermissions([]);
    } finally {
      setLoadingPerms(false);
    }
  };

  // Handler para iniciar edición in-place
  const startEditing = () => {
    if (!db) return;
    setNewName(db.name);
    setNewDesc(db.description);
    setEditing(true);
  };

  // Handler para cancelar edición
  const cancelEditing = () => {
    setEditing(false);
    if (db) {
      setNewName(db.name);
      setNewDesc(db.description);
    }
  };

  // Handler para guardar nombre/description (PATCH /api/databases/:id)
  const saveEdits = async () => {
    if (!db) return;
    try {
      const patchBody: any = { name: newName, description: newDesc };
      // Hacemos PATCH a la DB para actualizar name y/o description
      const updatedDb = await fetch(
        `/api/databases/${db._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(patchBody)
        }
      ).then((res) => {
        if (!res.ok) throw new Error('Error actualizando proyecto');
        return res.json();
      });
      setDb(updatedDb);
      setEditing(false);
    } catch (err) {
      console.error('Error updating database:', err);
      alert('No se pudo actualizar el proyecto.');
    }
  };

  // Handler para crear nueva tarea
  const handleAddEntry = async (entryData: { [key: string]: any }) => {
    if (!db) return;
    try {
      const newEntry = await createEntry(db._id, entryData);
      setDb({ ...db, entries: [...db.entries, newEntry] });
    } catch (err) {
      console.error('Error adding entry:', err);
      alert('No se pudo agregar la tarea.');
    }
  };

  // Handler para actualizar tarea
  const handleUpdateEntry = async (entryId: string, entryData: { [key: string]: any }) => {
    if (!db) return;
    try {
      const updated = await updateEntry(db._id, entryId, entryData);
      setDb({
        ...db,
        entries: db.entries.map((e) => (e._id === entryId ? updated : e))
      });
    } catch (err) {
      console.error('Error updating entry:', err);
      alert('No se pudo actualizar la tarea.');
    }
  };

  // Handler para borrar tarea
  const handleDeleteEntry = async (entryId: string) => {
    if (!db) return;
    if (!window.confirm('¿Seguro que quieres borrar esta tarea?')) return;
    try {
      await deleteEntry(db._id, entryId);
      setDb({
        ...db,
        entries: db.entries.filter((e) => e._id !== entryId)
      });
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('No se pudo borrar la tarea.');
    }
  };

  // Validamos token; si no existe, redirigimos a login
  if (!token) {
    navigate('/login');
    return null;
  }

  if (loading || !db) {
    return <p>Cargando proyecto…</p>;
  }

  // Detectar si el user actual es “owner” de la database
  const myPermission = permissions.find((p) => p.user._id === user?.id);
  const isOwner = myPermission?.role === 'owner';

  return (
    <div style={{ padding: '1rem' }}>
      {/* ======== HEADER DEL PROYECTO ======== */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Icono fijo por defecto; podrías permitir cambiarlo en fases posteriores */}
          <span style={{ fontSize: '2rem' }}>📋</span>

          <div>
            {/* Nombre y descripción, con soporte in-place si es owner */}
            {editing && isOwner ? (
              <>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    fontSize: '1.5rem',
                    padding: '4px 8px',
                    marginBottom: '4px',
                    width: '100%'
                  }}
                />
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  style={{ width: '100%', padding: '6px' }}
                />
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={saveEdits}
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={cancelEditing}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 style={{ margin: 0 }}>{db.name}</h1>
                <p style={{ margin: 0, color: '#555' }}>
                  {db.description || 'Sin descripción'}
                </p>
                {isOwner && (
                  <button
                    onClick={startEditing}
                    style={{
                      marginTop: '4px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#2196F3',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Editar nombre/descr.
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Lista de miembros + botón Compartir */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {loadingPerms ? (
            <p>Cargando...</p>
          ) : (
            <PermissionList
              resourceType="database"
              resourceId={db._id}
              isOwner={isOwner}
            />
          )}
          {isOwner && (
            <ShareModal
              resourceType="database"
              resourceId={db._id}
              onShared={() => fetchPermissions(db._id)}
            />
          )}
        </div>
      </div>

      {/* ======== PESTAÑAS DE VISTA ======== */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setViewMode('table')}
          style={{
            padding: '6px 12px',
            backgroundColor: viewMode === 'table' ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tabla
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          style={{
            padding: '6px 12px',
            backgroundColor: viewMode === 'kanban' ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Kanban
        </button>
        <button
          onClick={() => setViewMode('calendar')}
          style={{
            padding: '6px 12px',
            backgroundColor: viewMode === 'calendar' ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Calendario
        </button>
      </div>

      {/* ======== RENDERIZADO DE LA VISTA ACTIVA ======== */}
      {viewMode === 'table' && (
        <TableView
          schema={db.schema}
          entries={db.entries}
          onAdd={handleAddEntry}
          onUpdate={handleUpdateEntry}
          onDelete={handleDeleteEntry}
        />
      )}
      {viewMode === 'kanban' && (
        <KanbanView db={db} onEntryUpdate={handleUpdateEntry} />
      )}
      {viewMode === 'calendar' && <CalendarView db={db} />}
    </div>
  );
};

export default DatabaseDetail;
