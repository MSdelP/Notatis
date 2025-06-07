// src/components/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';

const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />

      {/* Area principal (encabezado + contenido) */}
      <div
        style={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--color-content-bg)',
          color: 'var(--color-text)',
          marginLeft: '260px', // coincide con el ancho fijo del sidebar
        }}
      >
        {/* Encabezado superior con toggle de tema */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-sidebar-bg)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text)',
              fontSize: '1.5rem',
            }}
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Contenido principal (rutas hijas) */}
        <main
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '1rem',
            backgroundColor: 'var(--color-content-bg)',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

