'use client';
import { useEffect, useState } from 'react';

// Muestra su contenido a todos MENOS al lado coleccionista.
// Por defecto visible (anónimo / sin lado definido lo ve); se oculta solo si el lado es coleccionista.
export default function OcultarColeccionista({ children }) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const r = (localStorage.getItem('mancha_role') || '').toLowerCase();
    setHide(r.startsWith('colec'));
  }, []);

  if (hide) return null;
  return children;
}
