'use client';

import { useState } from 'react';

/**
 * Imagen con degradación elegante.
 * Si la imagen externa falla (403/404/hotlink), en lugar del icono
 * de imagen rota se muestra el bloque de color de fondo — siempre
 * se ve intencional, nunca roto.
 */
export default function BlogImg({ src, alt, color = 'var(--ink)', className = '', initials = '' }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className={`blogimg ${className}`} style={{ background: color }}>
      {!failed && src && (
        <img
          src={src}
          alt={alt || ''}
          loading="lazy"
          className="blogimg-el"
          onError={() => setFailed(true)}
        />
      )}
      {failed && initials && <span className="blogimg-initials">{initials}</span>}
    </span>
  );
}
