'use client';

import { useEffect, useRef, useState } from 'react';

const TEXT = 'Si llegaste hasta acá, ya tienes lo que hace falta para descubrir algo antes que el resto.';

// Colores tipo salpicadura de pintura, repartidos por palabra.
const COLORS = ['c-red', 'c-paper', 'c-yellow', 'c-paper', 'c-lilac', 'c-paper', 'c-red', 'c-paper', 'c-yellow', 'c-lilac'];
// Direcciones desde las que entra cada letra: izquierda, derecha, arriba, abajo.
const DIRS = ['from-left', 'from-top', 'from-right', 'from-bottom'];

export default function HiddenMessage() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = TEXT.split(' ');
  let letterIndex = 0;

  return (
    <div ref={ref} className="hidden-message">
      <div className={`hidden-message-inner ${visible ? 'is-visible' : ''}`}>
        <span className="hm-splat hm-splat-1" />
        <span className="hm-splat hm-splat-2" />
        <span className="hm-splat hm-splat-3" />
        <span className="hm-splat hm-splat-4" />
        <p className="hidden-message-eyebrow">Descubierto</p>
        <p className="hidden-message-text" aria-label={TEXT}>
          {words.map((word, wi) => (
            <span className={`hm-word ${COLORS[wi % COLORS.length]}`} key={wi} aria-hidden="true">
              {word.split('').map((char, ci) => {
                const dir = DIRS[letterIndex % DIRS.length];
                const delay = letterIndex * 32;
                letterIndex += 1;
                return (
                  <span
                    className={`hm-letter ${dir}`}
                    key={ci}
                    style={{ transitionDelay: `${delay}ms` }}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
