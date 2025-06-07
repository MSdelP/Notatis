// src/components/Sidebar.tsx

import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getPages, Page } from '../api/pages';
import { getDatabases, Database, deleteDatabase } from '../api/databases';
import { AuthContext } from '../context/AuthContext';
import { useDatabaseContext } from '../context/DatabaseContext';

const Sidebar: React.FC = () => {
  // Estado local para páginas y proyectos
  const [pages, setPages] = useState<Page[]>([]);
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [loadingDBs, setLoadingDBs] = useState(false);

  // Context de autenticación (usuario, token, logout)
  const { user, token, logout } = useContext(AuthContext);

  // Context de bases de datos (contador de refresco + función para incrementarlo)
  const { refreshCounter, triggerRefresh } = useDatabaseContext();

  const navigate = useNavigate();
  const location = useLocation();

  // ─── CARGAR PÁGINAS UNA SOLA VEZ ───────────────────────────────
  useEffect(() => {
    const fetchPages = async () => {
      setLoadingPages(true);
      try {
        const all = await getPages();
        setPages(all);
      } catch (err: any) {
        console.error('Error fetching pages in Sidebar:', err);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoadingPages(false);
      }
    };
    fetchPages();
  }, [logout, navigate]);

  // ─── CARGAR PROYECTOS CADA VEZ QUE cambie refreshCounter ─────────
  useEffect(() => {
    const fetchDatabases = async () => {
      setLoadingDBs(true);
      try {
        const all = await getDatabases();
        setDatabases(all);
      } catch (err: any) {
        console.error('Error fetching databases in Sidebar:', err);
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        }
      } finally {
        setLoadingDBs(false);
      }
    };
    fetchDatabases();
  }, [refreshCounter, logout, navigate]);

  // ─── HANDLER: BORRAR PROYECTO ───────────────────────────────────
  const handleDeleteDatabase = async (dbId: string) => {
    if (!window.confirm('¿Seguro que quieres borrar este proyecto?')) return;
    try {
      await deleteDatabase(dbId);
      // Incrementamos el contador de refresco para que el useEffect recargue la lista
      triggerRefresh();
    } catch (err) {
      console.error('Error borrando proyecto:', err);
      alert('No se pudo borrar el proyecto.');
    }
  };

  // Si no hay token, no mostramos nada (la app redirigirá a /login)
  if (!token) {
    return null;
  }

  return (
    <aside
      className="sidebar-container"
      style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: 'var(--color-sidebar-bg)',
        borderRight: '1px solid var(--color-sidebar-border)',
        height: '100vh',
        overflowY: 'auto',
        padding: '16px',
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
      }}
    >
      {/* ─── BLOQUE DE USUARIO ────────────────────────────────── */}
      <div
        className="sidebar-header"
        style={{ textAlign: 'center', marginBottom: '24px' }}
      >
        {user && (
          <>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text)',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '8px',
                fontSize: '0.95rem',
              }}
              title="Hacer clic para cerrar sesión"
            >
              {user.email}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link
                to="#"
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-text)',
                  fontSize: '0.90rem',
                }}
              >
                🔍 Quick Find
              </Link>
              <Link
                to="#"
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-text)',
                  fontSize: '0.90rem',
                }}
              >
                🕒 All Updates
              </Link>
              <Link
                to="#"
                style={{
                  textDecoration: 'none',
                  color: 'var(--color-text)',
                  fontSize: '0.90rem',
                }}
              >
                ⚙️ Settings & Members
              </Link>
            </div>
          </>
        )}
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--color-border)',
          margin: '8px 0 24px 0',
        }}
      />

      {/* ─── TÍTULO “🚀 Notatis” ──────────────────────────────────── */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-text)' }}>
          🚀 Notatis
        </h2>
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--color-border)',
          margin: '8px 0 24px 0',
        }}
      />

      {/* ─── SECCIÓN “📄 PÁGINAS” ──────────────────────────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <h3
          className="sidebar-section-title"
          style={{
            marginBottom: '8px',
            fontSize: '0.9rem',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          📄 Páginas
        </h3>
        {loadingPages ? (
          <p style={{ fontSize: '0.9rem' }}>Cargando…</p>
        ) : pages.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Sin páginas</p>
        ) : (
          <ul
            className="sidebar-list"
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {pages.map((page) => {
              const isActive = location.pathname === `/pages/${page._id}`;
              return (
                <li key={page._id} style={{ marginBottom: '4px' }}>
                  <Link
                    to={`/pages/${page._id}`}
                    style={{
                      display: 'block',
                      fontSize: '0.95rem',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                      fontWeight: isActive ? 600 : 400,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                    }}
                  >
                    {page.title || 'Untitled'}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
        <div style={{ marginTop: '8px' }}>
          <Link
            to="/pages"
            className="sidebar-view-all"
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            Ver todas…
          </Link>
        </div>
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid var(--color-border)',
          margin: '8px 0 24px 0',
        }}
      />

      {/* ─── SECCIÓN “📋 PROYECTOS” ───────────────────────────────── */}
      <div>
        <h3
          className="sidebar-section-title"
          style={{
            marginBottom: '8px',
            fontSize: '0.9rem',
            color: 'var(--color-text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          📋 Proyectos
        </h3>
        {loadingDBs ? (
          <p style={{ fontSize: '0.9rem' }}>Cargando…</p>
        ) : databases.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Sin proyectos</p>
        ) : (
          <ul
            className="sidebar-list"
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            {databases.map((db) => {
              const isActive = location.pathname === `/databases/${db._id}`;
              return (
                <li
                  key={db._id}
                  style={{
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Link
                    to={`/databases/${db._id}`}
                    style={{
                      display: 'block',
                      fontSize: '0.95rem',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                      fontWeight: isActive ? 600 : 400,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      flexGrow: 1,
                    }}
                  >
                    {db.name || 'Nuevo proyecto'}
                  </Link>
                  <button
                    onClick={() => handleDeleteDatabase(db._id)}
                    style={{
                      marginLeft: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--color-text)',
                      fontSize: '1rem',
                      cursor: 'pointer',
                    }}
                    title="Borrar proyecto"
                  >
                    🗑️
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <div style={{ marginTop: '8px' }}>
          <Link
            to="/databases"
            className="sidebar-view-all"
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            Ver todos…
          </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
