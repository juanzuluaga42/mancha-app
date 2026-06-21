'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#E5402B', '#F2B705', '#8E6FD1'];
const RADII = ['46% 54% 62% 38% / 40% 46% 54% 60%', '62% 38% 40% 60% / 55% 45% 60% 40%', '35% 65% 55% 45% / 60% 35% 65% 40%'];

export default function CursorTrail() {
  const containerRef = useRef(null);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    function handleMove(e) {
      const now = Date.now();
      if (now - lastSpawnRef.current < 90) return;
      lastSpawnRef.current = now;

      const blob = document.createElement('div');
      const size = 14 + Math.random() * 18;
      blob.style.position = 'fixed';
      blob.style.left = `${e.clientX - size / 2}px`;
      blob.style.top = `${e.clientY - size / 2}px`;
      blob.style.width = `${size}px`;
      blob.style.height = `${size}px`;
      blob.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      blob.style.borderRadius = RADII[Math.floor(Math.random() * RADII.length)];
      blob.style.opacity = '0.55';
      blob.style.filter = 'blur(2px)';
      blob.style.pointerEvents = 'none';
      blob.style.zIndex = '9999';
      blob.style.mixBlendMode = 'screen';
      blob.style.transition = 'opacity 900ms ease-out, transform 900ms ease-out';

      containerRef.current?.appendChild(blob);

      requestAnimationFrame(() => {
        blob.style.opacity = '0';
        blob.style.transform = 'scale(0.4)';
      });

      setTimeout(() => blob.remove(), 950);
    }

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return <div ref={containerRef} />;
}
