// Notitas_Web/src/components/VersionHistory.tsx

import React, { useEffect, useState } from 'react';
import {
  getPageVersions,
  getPageVersion,
  revertPageVersion,
  PageVersion
} from '../api/pages';

interface VersionHistoryProps {
  pageId: string;
  onClose: () => void;
  onReverted: () => void; // para notificar que se revirtió y recargar
}

/**
 * Componente que muestra el historial de versiones de una página.
 * Permite:
 *  - Listar todas las versiones (fecha y título).
 *  - Consultar detalle (para previsualizar bloques) de una versión.
 *  - Revertir a una versión (confirmar con el usuario).
 */
const VersionHistory: React.FC<VersionHistoryProps> = ({
  pageId,
  onClose,
  onReverted
}) => {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [versionDetail, setVersionDetail] = useState<PageVersion | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar listado de versiones
  useEffect(() => {
    setLoading(true);
    getPageVersions(pageId)
      .then((data) => {
        setVersions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Error cargando versiones');
        setLoading(false);
      });
  }, [pageId]);

  // Cuando el usuario selecciona una versión en la lista, cargamos su detalle
  useEffect(() => {
    if (!selectedVersion) {
      setVersionDetail(null);
      return;
    }
    getPageVersion(pageId, selectedVersion)
      .then((data) => {
        setVersionDetail(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Error cargando detalle de versión');
      });
  }, [selectedVersion, pageId]);

  const handleRevert = async (versionId: string) => {
    if (!window.confirm('¿Seguro que quieres revertir a esta versión? Se creará un snapshot antes de sobrescribir.')) {
      return;
    }
    try {
      setLoading(true);
      await revertPageVersion(pageId, versionId);
      setLoading(false);
      onReverted(); // para que Página padre recargue su contenido
    } catch (err) {
      console.error(err);
      setError('Error revirtiendo la página');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '800px',
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
        <h2>Historial de versiones</h2>

        {loading && <p>Cargando...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {/* Columna Izquierda: lista de versiones */}
          <div style={{ flex: 1, borderRight: '1px solid #ddd', paddingRight: '1rem' }}>
            {versions.length === 0 && !loading && <p>No hay versiones disponibles.</p>}
            {versions.length > 0 && (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {versions.map((ver) => (
                  <li
                    key={ver._id}
                    onClick={() => setSelectedVersion(ver._id)}
                    style={{
                      cursor: 'pointer',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #eee',
                      backgroundColor: selectedVersion === ver._id ? '#f5f5f5' : 'transparent'
                    }}
                  >
                    <strong>{new Date(ver.createdAt).toLocaleString()}</strong>
                    <br />
                    <span style={{ fontStyle: 'italic' }}>{ver.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Columna Derecha: detalle y botón de revertir */}
          <div style={{ flex: 2, paddingLeft: '1rem' }}>
            {!selectedVersion && <p>Selecciona una versión para ver los detalles.</p>}

            {versionDetail && (
              <>
                <h3>Previsualización de la versión</h3>
                <p>
                  <strong>Título:</strong> {versionDetail.title}
                </p>
                <div>
                  <strong>Bloques:</strong>
                  {versionDetail.blocks.map((blk, idx) => {
                    if (blk.type === 'heading') {
                      return (
                        <h3 key={idx} style={{ margin: '0.5rem 0' }}>
                          {blk.data.content}
                        </h3>
                      );
                    }
                    if (blk.type === 'text') {
                      return (
                        <p key={idx} style={{ margin: '0.3rem 0' }}>
                          {blk.data.content}
                        </p>
                      );
                    }
                    if (blk.type === 'databaseEmbed') {
                      return (
                        <p key={idx} style={{ margin: '0.3rem 0', color: '#555' }}>
                          🔗 Base de datos incrustada: {blk.data.databaseId}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handleRevert(versionDetail._id)}
                  style={{
                    marginTop: '1rem',
                    backgroundColor: '#E53935',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Revertir a esta versión
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
