// Notitas_Web/src/pages/PageDetail.tsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getPage,
  updatePage,
  createPage,    // <-- Importamos createPage
  deletePage,
  Page,
  Block
} from '../api/pages';
import { getDatabases, Database } from '../api/databases';
import DatabaseEmbed from '../components/DatabaseEmbed';
import MediaEmbed from '../components/MediaEmbed';
import { AuthContext } from '../context/AuthContext';
import VersionHistory from '../components/VersionHistory';

const PageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // id puede ser 'new' o un ObjectId
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);

  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingTitle, setEditingTitle] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [databases, setDatabases] = useState<Database[]>([]);
  const [showDBDropdown, setShowDBDropdown] = useState<boolean>(false);
  const [showMediaInput, setShowMediaInput] = useState<boolean>(false);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // —————————————————————————————
  // Cargar página al montar (o inicializar “page nueva”)
  useEffect(() => {
    if (!id) return;

    // Si la ruta es "/pages/new", NO llamamos al backend y creamos un Page provisional
    if (id === 'new') {
      setPage({
        _id: 'new',
        owner: user?.id || '',
        title: '',
        blocks: [],
        createdAt: '',
        updatedAt: ''
      });
      setNewTitle('');
      setLoading(false);

      // Cargamos bases de datos para posibles embeds
      getDatabases()
        .then((data) => setDatabases(data))
        .catch((err) => console.error(err));
      return;
    }

    // Si id ≠ 'new', solicitamos la página real
    setLoading(true);
    getPage(id)
      .then((data) => {
        setPage(data);
        setNewTitle(data.title);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Error cargando la página');
        setLoading(false);
      });

    getDatabases()
      .then((data) => setDatabases(data))
      .catch((err) => console.error(err));
  }, [id, user]);

  // —————————————————————————————
  // Determinar si el usuario autenticado es el owner (para habilitar edición)
  const isOwner =
    page &&
    (typeof page.owner === 'string'
      ? page.owner === user?.id
      : page.owner.id === user?.id);

  // —————————————————————————————
  // Funciones para añadir distintos tipos de bloque
  const addTextBlock = () => {
    if (!page) return;
    const nextOrder = page.blocks.length;
    const newBlock: Block = {
      _id: `${Date.now()}`,
      type: 'text',
      data: { content: '' },
      order: nextOrder
    };
    setPage({ ...page, blocks: [...page.blocks, newBlock] });
  };

  const addHeadingBlock = () => {
    if (!page) return;
    const nextOrder = page.blocks.length;
    const newBlock: Block = {
      _id: `${Date.now()}`,
      type: 'heading',
      data: { content: '' },
      order: nextOrder
    };
    setPage({ ...page, blocks: [...page.blocks, newBlock] });
  };

  const addDatabaseEmbedBlock = (dbId: string) => {
    if (!page) return;
    const nextOrder = page.blocks.length;
    const newBlock: Block = {
      _id: `${Date.now()}`,
      type: 'databaseEmbed',
      data: { databaseId: dbId },
      order: nextOrder
    };
    setPage({ ...page, blocks: [...page.blocks, newBlock] });
    setShowDBDropdown(false);
  };

  const addMediaEmbedBlock = (url: string) => {
    if (!page) return;
    const nextOrder = page.blocks.length;
    const newBlock: Block = {
      _id: `${Date.now()}`,
      type: 'mediaEmbed',
      data: { url },
      order: nextOrder
    };
    setPage({ ...page, blocks: [...page.blocks, newBlock] });
    setShowMediaInput(false);
    setMediaUrl('');
  };

  // —————————————————————————————
  // Guardar bloques y/o título (crear o actualizar según _id)
  const saveBlocks = async () => {
    if (!page) return;
    setLoading(true);

    try {
      const sortedBlocks = [...page.blocks].sort((a, b) => a.order - b.order);
      let resultPage: Page;

      // Si page._id === 'new', creamos desde cero
      if (page._id === 'new') {
        resultPage = await createPage(page.title, sortedBlocks);
      } else {
        resultPage = await updatePage(page._id, {
          title: page.title,
          blocks: sortedBlocks
        });
      }

      setPage(resultPage);

      // Si acabamos de crear (estábamos en /pages/new), redirigimos a /pages/<nuevoId>
      if (id === 'new' && resultPage._id) {
        navigate(`/pages/${resultPage._id}`);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error guardando página:', err);
      setError('Error guardando cambios');
      setLoading(false);
    }
  };

  // —————————————————————————————
  // Borrar página
  const handleDelete = async () => {
    if (!page) return;
    if (!window.confirm('¿Seguro que quieres borrar esta página?')) return;
    try {
      await deletePage(page._id);
      navigate('/pages');
    } catch (err) {
      console.error(err);
      setError('Error borrando la página');
    }
  };

  // —————————————————————————————
  // Historial de versiones (5.1)
  const openHistory = () => {
    setShowHistory(true);
  };
  const closeHistory = () => {
    setShowHistory(false);
    setError(null);
  };
  const handleReverted = () => {
    if (!id || id === 'new') return;
    getPage(id)
      .then((data) => {
        setPage(data);
        setNewTitle(data.title);
        setShowHistory(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Error recargando página tras revertir');
      });
  };

  // —————————————————————————————
  if (loading && !page) {
    return <p>Cargando página...</p>;
  }
  if (error && !page) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }
  if (!page) {
    return <p>No se encontró la página.</p>;
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Modal de Historial de versiones (5.1) */}
      {showHistory && (
        <VersionHistory
          pageId={page._id}
          onClose={closeHistory}
          onReverted={handleReverted}
        />
      )}

      {/* Título y botones */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
        {editingTitle ? (
          <>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ fontSize: '1.5rem', flex: 1 }}
            />
            <button
              onClick={() => {
                if (page) {
                  setPage({ ...page, title: newTitle });
                  setEditingTitle(false);
                }
              }}
              style={{
                marginTop: '4px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Guardar título
            </button>
            <button
              onClick={() => {
                setNewTitle(page.title);
                setEditingTitle(false);
              }}
              style={{
                marginTop: '4px',
                backgroundColor: '#BDBDBD',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </>
        ) : (
          <h1 style={{ margin: 0 }}>
            {/* Si es página nueva, mostramos texto informativo */}
            {page._id === 'new' ? 'Nueva página' : page.title}
          </h1>
        )}

        {isOwner && !editingTitle && (
          <>
            <button
              onClick={() => setEditingTitle(true)}
              style={{
                marginTop: '4px',
                backgroundColor: 'transparent',
                border: '1px solid #333',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ✎ Editar título
            </button>
            {/* Solo mostrar Historial si es página existente */}
            {page._id !== 'new' && (
              <button
                onClick={openHistory}
                style={{
                  marginTop: '4px',
                  marginLeft: '0.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #1976D2',
                  color: '#1976D2',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ⏳ Historial
              </button>
            )}
          </>
        )}
      </div>

      {/* Lista de bloques */}
      <div style={{ marginTop: '1rem' }}>
        {page.blocks.map((block, idx) => (
          <div
            key={block._id}
            style={{
              marginBottom: '1rem',
              border: '1px solid #eee',
              padding: '0.5rem'
            }}
          >
            {block.type === 'text' && (
              <textarea
                value={block.data.content}
                onChange={(e) => {
                  const updatedBlocks = [...page.blocks];
                  updatedBlocks[idx] = {
                    ...block,
                    data: { content: e.target.value }
                  };
                  setPage({ ...page, blocks: updatedBlocks });
                }}
                placeholder="Escribe un párrafo..."
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            )}
            {block.type === 'heading' && (
              <input
                type="text"
                value={block.data.content}
                onChange={(e) => {
                  const updatedBlocks = [...page.blocks];
                  updatedBlocks[idx] = {
                    ...block,
                    data: { content: e.target.value }
                  };
                  setPage({ ...page, blocks: updatedBlocks });
                }}
                placeholder="Encabezado"
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  width: '100%'
                }}
              />
            )}
            {block.type === 'databaseEmbed' && (
              <DatabaseEmbed databaseId={block.data.databaseId} />
            )}
            {block.type === 'mediaEmbed' && (
              <MediaEmbed url={block.data.url} />
            )}
          </div>
        ))}

        {/* Botones para añadir bloque */}
        <div style={{ marginTop: '1rem' }}>
          {isOwner && (
            <>
              <button
                onClick={addTextBlock}
                style={{
                  backgroundColor: '#1976D2',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '0.5rem'
                }}
              >
                + Texto
              </button>
              <button
                onClick={addHeadingBlock}
                style={{
                  backgroundColor: '#388E3C',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginRight: '0.5rem'
                }}
              >
                + Encabezado
              </button>
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  marginRight: '0.5rem'
                }}
              >
                <button
                  onClick={() => setShowDBDropdown((prev) => !prev)}
                  style={{
                    backgroundColor: '#9C27B0',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  + Base de datos
                </button>
                {showDBDropdown && (
                  <ul
                    style={{
                      position: 'absolute',
                      top: '110%',
                      left: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '0.5rem',
                      listStyle: 'none',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000
                    }}
                  >
                    {databases.map((dbItem) => (
                      <li
                        key={dbItem._id}
                        onClick={() => addDatabaseEmbedBlock(dbItem._id)}
                        style={{
                          padding: '0.5rem 0.8rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        📋 {dbItem.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* NUEVO: Botón para abrir input de URL multimedia */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => {
                    setShowMediaInput((prev) => !prev);
                    setMediaUrl('');
                  }}
                  style={{
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  + Multimedia
                </button>
                {showMediaInput && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '110%',
                      left: 0,
                      backgroundColor: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '0.75rem',
                      zIndex: 1000,
                      width: '300px'
                    }}
                  >
                    <p
                      style={{
                        margin: '0 0 0.5rem 0',
                        fontWeight: 'bold'
                      }}
                    >
                      Pegar URL
                    </p>
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder="https://ejemplo.com/..."
                      style={{
                        width: '100%',
                        padding: '6px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        marginBottom: '0.5rem'
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '0.5rem'
                      }}
                    >
                      <button
                        onClick={() => {
                          setShowMediaInput(false);
                          setMediaUrl('');
                        }}
                        style={{
                          backgroundColor: '#BDBDBD',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (mediaUrl.trim() !== '') {
                            addMediaEmbedBlock(mediaUrl.trim());
                          }
                        }}
                        style={{
                          backgroundColor: '#FF9800',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Insertar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Botón para guardar cambios y borrar página */}
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
          {isOwner && (
            <button
              onClick={saveBlocks}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {/* Cambiamos el texto dependiendo de si es creación o edición */}
              {page._id === 'new' ? 'Crear página' : 'Guardar cambios en la página'}
            </button>
          )}
          {/* Solo permitir borrar si no es “new” */}
          {isOwner && page._id !== 'new' && (
            <button
              onClick={handleDelete}
              style={{
                backgroundColor: '#E53935',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Borrar página
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageDetail;
