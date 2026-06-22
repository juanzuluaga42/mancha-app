'use client';

import { useEffect, useRef, useState } from 'react';
import Splat from './Splat';

const TEXT = 'Si llegaste hasta acá, ya tienes lo que hace falta para descubrir algo antes que el resto.';
const COLORS = ['stain-red', 'stain-paper', 'stain-yellow', 'stain-paper', 'stain-lilac', 'stain-paper'];
const TILTS = [-3, 0, 2, 0, -2, 0, 3, 0];

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
      { threshold: 0.6 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = TEXT.split(' ');

  return (
    <div ref={ref} className="hidden-message">
      <div className={`hidden-message-inner ${visible ? 'is-visible' : ''}`}>
        <Splat width="100px" height="86px" top="-30px" left="-28px" color="red" rotate={-14} radius="r2" />
        <Splat width="75px" height="65px" bottom="-26px" right="-22px" color="lilac" rotate={12} radius="r4" />
        <Splat width="50px" height="46px" top="40%" right="-18px" color="yellow" rotate={-8} radius="r1" center />
        <p className="hidden-message-eyebrow">Descubierto</p>
        <p className="hidden-message-text">
          {words.map((word, i) => (
            <span
              key={i}
              className={`stain-word ${COLORS[i % COLORS.length]}`}
              style={{ '--tilt': `${TILTS[i % TILTS.length]}deg` }}
            >
              {word}{' '}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
