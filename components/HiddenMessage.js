'use client';

import { useEffect, useRef, useState } from 'react';

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

  return (
    <div ref={ref} className="hidden-message" style={{ opacity: visible ? 1 : 0 }}>
      Si llegaste hasta acá, ya tienes lo que hace falta para descubrir algo antes que el resto.
    </div>
  );
}
