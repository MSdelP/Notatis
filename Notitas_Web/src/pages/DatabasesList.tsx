// src/pages/DatabasesList.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  getDatabases,
  createDatabase,
  deleteDatabase,
  Database,
  Field,
} from '../api/databases';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useDatabaseContext } from '../context/DatabaseContext';

const DatabasesList: React.FC = () => {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token, logout } = useContext(AuthContext);
  const { triggerRefresh } = useDatabaseContext(); // para notificar al Sidebar

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    setLoading(true);
    try {
      const dbs = await getDatabases();
      setDatabases(dbs);
    } catch (err: any) {
      console.error('Error fetching databases:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTaskList = async () => {
    // Preguntamos primero el nombre al usuario
    const nombre = window.prompt('Nombre del nuevo proyecto:');
    if (!nombre || nombre.trim() === '') {
      return; // si el usuario canceló o dejó vacío, no hacemos nada
    }
    const plantillaTasks: Field[] = [
      { key: 'taskName', label: 'Tarea', type: 'text' },
      { key: 'assignee', label: 'Asignado a', type: 'text' },
      { key: 'dueDate', label: 'Vencimiento', type: 'date' },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        options: ['To Do', 'Doing', 'Done'],
      },
    ];
    try {
      const nuevo = await createDatabase(nombre.trim(), plantillaTasks);
      // Alerta de que se creó bien
      // Y notificamos al Sidebar que refresque
      triggerRefresh();
      // Redirigimos al detalle de la nueva base
      navigate(`/databases/${nuevo._id}`);
    } catch (err) {
      console.error('Error creating Task List database:', err);
      alert('No se pudo crear el nuevo proyecto.');
    }
  };

  const handleDeleteDatabase = async (dbId: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este proyecto?')) return;
    try {
      await deleteDatabase(dbId);
      // Actualizamos nuestra propia lista
      setDatabases((prev) => prev.filter((d) => d._id !== dbId));
      // También notificamos al Sidebar
      triggerRefresh();
    } catch (err) {
      console.error('Error deleting database:', err);
      alert('No se pudo borrar el proyecto.');
    }
  };

  // Si no hay token, redirigimos
  if (!token) {
    return <p>Redireccionando…</p>;
  }

  return (
    <div className="databases-list" style={{ padding: '1rem' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0 }}>Proyectos</h1>
        <button
          onClick={handleCreateTaskList}
          style={{
            padding: '8px 12px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          + Nuevo proyecto (Task List)
        </button>
      </header>

      {loading ? (
        <p style={{ marginTop: '1rem' }}>Cargando proyectos...</p>
      ) : databases.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>Sin proyectos aún.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
          {databases.map((db) => (
            <li
              key={db._id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #e2e2e2',
                transition: 'background-color 0.15s',
              }}
            >
              <Link
                to={`/databases/${db._id}`}
                style={{
                  textDecoration: 'none',
                  color: '#333',
                  fontSize: '1.1rem',
                  flexGrow: 1,
                }}
              >
                📋 {db.name}
              </Link>
              <button
                onClick={() => handleDeleteDatabase(db._id)}
                style={{
                  marginLeft: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f44336',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                }}
                title="Borrar proyecto"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DatabasesList;
