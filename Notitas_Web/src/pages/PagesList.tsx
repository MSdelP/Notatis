// Notitas_Web/src/pages/PagesList.tsx

import React, { useEffect, useState, useContext } from 'react';
import { getPages, Page } from '../api/pages';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PagesList: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(false);
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const all = await getPages();
      setPages(all);
    } catch (err: any) {
      console.error('Error fetching pages:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Páginas</h1>
      <Link
        to="/pages/new"
        style={{
          display: 'inline-block',
          marginBottom: '1rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          textDecoration: 'none'
        }}
      >
        + Nueva página
      </Link>

      {loading ? (
        <p>Cargando páginas…</p>
      ) : pages.length === 0 ? (
        <p>No hay páginas creadas.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {pages.map((page) => (
            <li key={page._id} style={{ marginBottom: '0.5rem' }}>
              <Link
                to={`/pages/${page._id}`}
                style={{ textDecoration: 'none', color: '#333', fontSize: '1.1rem' }}
              >
                📄 {page.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PagesList;
