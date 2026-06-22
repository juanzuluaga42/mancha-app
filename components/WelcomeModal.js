'use client';

import { useEffect, useState } from 'react';

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('mancha-welcome');
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function close() {
    sessionStorage.setItem('mancha-welcome', '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="wm-backdrop" onClick={close} role="dialog" aria-modal="true" aria-label="Bienvenida MANCHA">
      <div className="wm-panel" onClick={(e) => e.stopPropagation()}>

        {/* Manchas decorativas */}
        <div className="wm-splat wm-splat-1" />
        <div className="wm-splat wm-splat-2" />
        <div className="wm-splat wm-splat-3" />

        {/* Cerrar */}
        <button className="wm-close" onClick={close} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Eyebrow */}
        <p className="wm-eyebrow">Una galería diferente</p>

        {/* Logo */}
        <div className="wm-brand">MANCHA.</div>

        {/* Separador rojo */}
        <div className="wm-rule" />

        {/* Cuerpo */}
        <p className="wm-headline">
          No todo el arte merece<br />
          <em>tu atención.</em>
        </p>

        <p className="wm-body">
          MANCHA nació con una convicción simple: el arte emergente genuino
          no necesita ruido, necesita criterio. Por eso cada temporada
          elegimos a mano un grupo pequeño de artistas —antes de que
          sean evidentes— y los ponemos frente a las personas correctas.
        </p>

        <p className="wm-body">
          Tú eres una de esas personas. Gracias por estar aquí desde el principio.
          Lo que construimos juntos —coleccionistas y artistas— es algo que
          vale la pena ver crecer.
        </p>

        {/* Firma */}
        <div className="wm-footer">
          <div className="wm-footer-rule" />
          <p className="wm-mission">
            Pocos artistas. Cada temporada, elegidos a mano.
          </p>
        </div>

        {/* CTA */}
        <button className="wm-cta" onClick={close}>
          Entrar a la galería →
        </button>

      </div>
    </div>
  );
}
