'use client';

import { useEffect, useState } from 'react';

// Barra fina de progreso de lectura, fija arriba del artículo.
export default function ReadingProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const height = h.scrollHeight - h.clientHeight;
      setP(height > 0 ? Math.min(100, Math.max(0, (h.scrollTop / height) * 100)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return <div className="nota-progress" aria-hidden="true"><i style={{ width: `${p}%` }} /></div>;
}
