'use client';
import { useEffect, useState } from 'react';

// Muestra su contenido solo del lado ARTISTA.
// Regla: si el lado guardado es artista → mostrar; si es coleccionista → ocultar;
// si no hay lado definido → usar el rol real de la cuenta (isArtist).
// Por defecto oculto hasta resolver, para no filtrar contenido de artista al coleccionista.
export default function SoloArtista({ isArtist = false, children }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const r = (localStorage.getItem('mancha_role') || '').toLowerCase();
    if (r.startsWith('artist')) setShow(true);
    else if (r.startsWith('colec')) setShow(false);
    else setShow(isArtist);
  }, [isArtist]);

  if (!show) return null;
  return children;
}
