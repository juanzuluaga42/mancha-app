'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

// Visor de obra en "penumbra de galería". Click para activar zoom extremo;
// el detalle sigue al cursor. La obra ocupa la pantalla, es la protagonista.
export default function BlindViewer({ src, alt, code }) {
  const t = useTranslations('curaduria');
  const [zoom, setZoom] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const ref = useRef(null);

  function onMove(e) {
    if (!zoom || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setPos({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }

  if (!src) {
    return <div className="cur-stage cur-stage-empty"><span>{t('viewer.noImage')}</span></div>;
  }

  return (
    <figure className="cur-stage">
      <div
        ref={ref}
        className={`cur-stage-frame${zoom ? ' is-zoom' : ''}`}
        onClick={() => setZoom((z) => !z)}
        onMouseMove={onMove}
        onMouseLeave={() => setZoom(false)}
        role="button"
        tabIndex={0}
        aria-label={zoom ? t('viewer.zoomOffLabel') : t('viewer.zoomOnLabel')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setZoom((z) => !z); } }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={zoom ? { transform: 'scale(2.4)', transformOrigin: `${pos.x}% ${pos.y}%` } : undefined}
          draggable={false}
        />
        <span className="cur-stage-hint">{zoom ? t('viewer.zoomOut') : t('viewer.zoomIn')}</span>
      </div>
      <figcaption className="cur-stage-cap">
        <span className="cur-stage-blind">{t('viewer.blind')}</span>
        <span className="cur-stage-code">{code}</span>
      </figcaption>
    </figure>
  );
}
