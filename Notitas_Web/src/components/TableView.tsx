// src/components/TableView.tsx

import React, { useState } from 'react';
import { Field, Entry } from '../api/databases';

interface TableViewProps {
  schema: Field[];
  entries: Entry[];
  onAdd: (data: { [key: string]: any }) => void;
  onUpdate: (entryId: string, data: { [key: string]: any }) => void;
  onDelete: (entryId: string) => void;
}

const TableView: React.FC<TableViewProps> = ({
  schema,
  entries,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const [newData, setNewData] = useState<{ [key: string]: any }>(
    schema.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {})
  );

  const handleChangeNew = (key: string, value: any) => {
    setNewData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveNew = () => {
    onAdd(newData);
    setNewData(schema.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {}));
  };

  const formatDateForInput = (raw: any) => {
    if (!raw) return '';
    const d = new Date(raw);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
      <thead>
        <tr>
          {schema.map((f) => (
            <th
              key={f.key}
              style={{
                border: '1px solid #e2e2e2',
                padding: '8px',
                backgroundColor: '#f0f0f0',
                textAlign: 'left',
              }}
            >
              {f.label}
            </th>
          ))}
          <th
            style={{
              border: '1px solid #e2e2e2',
              padding: '8px',
              backgroundColor: '#f0f0f0',
              textAlign: 'left',
            }}
          >
            Acciones
          </th>
        </tr>
        <tr>
          {schema.map((f) => (
            <td key={f.key} style={{ border: '1px solid #e2e2e2', padding: '4px' }}>
              {f.type === 'text' ? (
                <input
                  type="text"
                  value={newData[f.key] || ''}
                  onChange={(e) => handleChangeNew(f.key, e.target.value)}
                  style={{ width: '100%', padding: '4px' }}
                />
              ) : f.type === 'date' ? (
                <input
                  type="date"
                  value={newData[f.key] || ''}
                  onChange={(e) => handleChangeNew(f.key, e.target.value)}
                  style={{ width: '100%', padding: '4px' }}
                />
              ) : f.type === 'select' ? (
                <select
                  value={newData[f.key] || (f.options ? f.options[0] : '')}
                  onChange={(e) => handleChangeNew(f.key, e.target.value)}
                  style={{ width: '100%', padding: '4px' }}
                >
                  {f.options?.map((opt) => (
                    <option value={opt} key={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : null}
            </td>
          ))}
          <td style={{ border: '1px solid #e2e2e2', padding: '4px', textAlign: 'center' }}>
            <button
              onClick={handleSaveNew}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Guardar
            </button>
          </td>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry._id}>
            {schema.map((f) => (
              <td key={f.key} style={{ border: '1px solid #e2e2e2', padding: '4px' }}>
                {f.type === 'text' ? (
                  <input
                    type="text"
                    value={entry.data[f.key] || ''}
                    onChange={(e) =>
                      onUpdate(entry._id, { ...entry.data, [f.key]: e.target.value })
                    }
                    style={{ width: '100%', padding: '4px' }}
                  />
                ) : f.type === 'date' ? (
                  <input
                    type="date"
                    value={formatDateForInput(entry.data[f.key])}
                    onChange={(e) =>
                      onUpdate(entry._id, { ...entry.data, [f.key]: e.target.value })
                    }
                    style={{ width: '100%', padding: '4px' }}
                  />
                ) : f.type === 'select' ? (
                  <select
                    value={entry.data[f.key] || (f.options ? f.options[0] : '')}
                    onChange={(e) =>
                      onUpdate(entry._id, { ...entry.data, [f.key]: e.target.value })
                    }
                    style={{ width: '100%', padding: '4px' }}
                  >
                    {f.options?.map((opt) => (
                      <option value={opt} key={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : null}
              </td>
            ))}
            <td style={{ border: '1px solid #e2e2e2', padding: '4px', textAlign: 'center' }}>
              <button
                onClick={() => onDelete(entry._id)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f44336',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
                title="Borrar tarea"
              >
                🗑️
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableView;

