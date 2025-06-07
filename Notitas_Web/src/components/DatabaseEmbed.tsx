// src/components/DatabaseEmbed.tsx

import React, { useEffect, useState } from 'react';
import {
  Database,
  getDatabase,
  createEntry,
  updateEntry,
  deleteEntry,
  Entry,
} from '../api/databases';
import TableView from './TableView';
import KanbanView from './KanbanView';

interface DatabaseEmbedProps {
  databaseId: string;
  defaultView?: 'table' | 'kanban';
}

const DatabaseEmbed: React.FC<DatabaseEmbedProps> = ({
  databaseId,
  defaultView = 'table',
}) => {
  const [db, setDb] = useState<Database | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>(defaultView);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDatabase();
  }, [databaseId]);

  const fetchDatabase = async () => {
    setLoading(true);
    try {
      const data = await getDatabase(databaseId);
      setDb(data);
    } catch (err) {
      console.error('Error fetching embedded database:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmbeddedEntry = async (entryData: { [key: string]: any }) => {
    if (!db) return;
    try {
      const newEntry = await createEntry(db._id, entryData);
      setDb({ ...db, entries: [...db.entries, newEntry] });
    } catch (err) {
      console.error('Error adding embedded entry:', err);
      alert('No se pudo agregar la tarea en el proyecto embebido.');
    }
  };

  const handleUpdateEmbeddedEntry = async (
    entryId: string,
    newData: { [key: string]: any }
  ) => {
    if (!db) return;
    try {
      const updated = await updateEntry(db._id, entryId, newData);
      setDb({
        ...db,
        entries: db.entries.map((e) => (e._id === entryId ? updated : e)),
      });
    } catch (err) {
      console.error('Error updating embedded entry:', err);
      alert('No se pudo actualizar la tarea en el proyecto embebido.');
    }
  };

  const handleDeleteEmbeddedEntry = async (entryId: string) => {
    if (!db) return;
    if (!window.confirm('¿Seguro que quieres borrar esta tarea?')) return;
    try {
      await deleteEntry(db._id, entryId);
      setDb({
        ...db,
        entries: db.entries.filter((e) => e._id !== entryId),
      });
    } catch (err) {
      console.error('Error deleting embedded entry:', err);
      alert('No se pudo borrar la tarea en el proyecto embebido.');
    }
  };

  if (loading || !db) {
    return (
      <p style={{ padding: '8px', fontStyle: 'italic', color: '#555' }}>
        Cargando base de datos embebida…
      </p>
    );
  }

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: '8px',
        margin: '8px 0',
        backgroundColor: '#fafafa',
      }}
    >
      <div style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}>
        <button
          onClick={() => setViewMode('table')}
          style={{
            padding: '4px 8px',
            backgroundColor: viewMode === 'table' ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Tabla
        </button>
        <button
          onClick={() => setViewMode('kanban')}
          style={{
            padding: '4px 8px',
            backgroundColor: viewMode === 'kanban' ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Kanban
        </button>
      </div>

      {viewMode === 'table' ? (
        <TableView
          schema={db.schema}
          entries={db.entries}
          onAdd={handleAddEmbeddedEntry}
          onUpdate={handleUpdateEmbeddedEntry}
          onDelete={handleDeleteEmbeddedEntry}
        />
      ) : (
        <KanbanView db={db} onEntryUpdate={handleUpdateEmbeddedEntry} />
      )}
    </div>
  );
};

export default DatabaseEmbed;
