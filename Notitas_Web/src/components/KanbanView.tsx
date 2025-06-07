// Notitas_Web/src/components/KanbanView.tsx

import React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided
} from 'react-beautiful-dnd';
import { Database, Entry } from '../api/databases';

interface KanbanViewProps {
  db: Database;
  onEntryUpdate: (entryId: string, newData: { [key: string]: any }) => Promise<void>;
}

const KanbanView: React.FC<KanbanViewProps> = ({ db, onEntryUpdate }) => {
  // 1) Extraer las opciones del campo “status” del schema
  const statusField = db.schema.find((f) => f.key === 'status');
  const columns: string[] = statusField?.options || [];

  // 2) Agrupar las entries por su estado
  const entriesByStatus: Record<string, Entry[]> = {};
  columns.forEach((col) => {
    entriesByStatus[col] = [];
  });
  db.entries.forEach((entry) => {
    const s = (entry.data.status as string) || columns[0];
    if (!entriesByStatus[s]) {
      entriesByStatus[s] = [];
    }
    entriesByStatus[s].push(entry);
  });

  // 3) Función que se lanza al soltar (drag end)
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;             // Soltado fuera de una columna
    if (source.droppableId === destination.droppableId) return; // Misma columna

    const newStatus = destination.droppableId;
    const entry = db.entries.find((e) => e._id === draggableId);
    if (!entry) return;

    const updatedData = {
      ...entry.data,
      status: newStatus
    };
    try {
      await onEntryUpdate(draggableId, updatedData);
      // DatabaseDetail se encargará de actualizar el estado global y re-renderizar
    } catch (err) {
      console.error('Error actualizando status en KanbanView:', err);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
        {columns.map((col) => (
          <Droppable key={col} droppableId={col}>
            {(provided: DroppableProvided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  background: '#f4f5f7',
                  padding: '8px',
                  borderRadius: '4px',
                  width: '260px',
                  minHeight: '400px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>{col}</h3>
                <div style={{ flexGrow: 1 }}>
                  {entriesByStatus[col].map((entry, index) => (
                    <Draggable
                      key={entry._id}
                      draggableId={entry._id}
                      index={index}
                    >
                      {(prov: DraggableProvided) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          {...prov.dragHandleProps}
                          style={{
                            userSelect: 'none',
                            padding: '12px',
                            margin: '0 0 8px 0',
                            backgroundColor: '#fff',
                            borderRadius: '4px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            cursor: 'grab',
                            ...prov.draggableProps.style
                          }}
                        >
                          <strong>{entry.data.taskName}</strong>
                          <div style={{ fontSize: '0.85rem', color: '#555' }}>
                            {entry.data.assignee || 'Sin asignar'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                            {entry.data.dueDate
                              ? new Date(entry.data.dueDate).toLocaleDateString()
                              : ''}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanView;
