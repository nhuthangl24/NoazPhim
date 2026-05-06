'use client';

import { useState } from 'react';

function getEmbedUrl(trailerUrl) {
  try {
    if (trailerUrl.includes('youtube.com/watch?v=')) {
      const videoId = new URLSearchParams(new URL(trailerUrl).search).get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (trailerUrl.includes('youtu.be/')) {
      const videoId = trailerUrl.split('youtu.be/')[1].split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch {}

  return trailerUrl;
}

export default function TrailerModalButton({ trailerUrl }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!trailerUrl) return null;

  const embedUrl = getEmbedUrl(trailerUrl);

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ marginRight: '6px' }}
        >
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
        Trailer
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)} style={{ zIndex: 9999 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', width: '90%', padding: '0', background: '#000', overflow: 'hidden' }}
          >
            <button
              className="modal-close"
              onClick={() => setIsOpen(false)}
              style={{ top: '-40px', right: '0', color: '#fff', fontSize: '1.5rem' }}
            >
              ✕
            </button>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={embedUrl}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Movie Trailer"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
