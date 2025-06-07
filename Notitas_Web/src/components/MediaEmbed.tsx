// Notitas_Web/src/components/MediaEmbed.tsx

import React from 'react';

interface MediaEmbedProps {
  url: string;
}

const MediaEmbed: React.FC<MediaEmbedProps> = ({ url }) => {
  // Helpers para detectar tipo de embed
  const isYouTube = (link: string) => {
    return (
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/).+/.test(link)
    );
  };

  const getYouTubeEmbedUrl = (link: string) => {
    // Podría venir en formato "https://www.youtube.com/watch?v=VIDEO_ID" o "https://youtu.be/VIDEO_ID"
    let videoId = '';
    const youtubeMatch = link.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    if (youtubeMatch && youtubeMatch[1]) {
      videoId = youtubeMatch[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return '';
  };

  const isPDF = (link: string) => {
    return link.toLowerCase().endsWith('.pdf');
  };

  // Renderizado condicional
  if (isYouTube(url)) {
    const embedUrl = getYouTubeEmbedUrl(url);
    if (embedUrl) {
      return (
        <div
          style={{
            position: 'relative',
            paddingBottom: '56.25%', // 16:9
            height: 0,
            overflow: 'hidden',
            width: '100%'
          }}
        >
          <iframe
            title="YouTube video"
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0
            }}
          />
        </div>
      );
    }
  }

  if (isPDF(url)) {
    return (
      <div style={{ margin: '1rem 0' }}>
        <iframe
          src={url}
          title="PDF Viewer"
          style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}
        >
          {/* Fallback simple */}
          Este navegador no soporta visualización de PDFs. Puedes{' '}
          <a href={url} target="_blank" rel="noreferrer">
            descargar el PDF
          </a>
          .
        </iframe>
      </div>
    );
  }

  // Caso “genérico”: insertar en iframe, aunque algunos enlaces pueden no permitirlo
  return (
    <div style={{ margin: '1rem 0' }}>
      <iframe
        src={url}
        title="Embedded Content"
        style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
      >
        El contenido no se puede incrustar. <a href={url}>Abrir en nueva pestaña</a>.
      </iframe>
    </div>
  );
};

export default MediaEmbed;
