'use client';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mancha_role';

export default function NavLogoLink() {
  const [href, setHref] = useState('/');

  useEffect(() => {
    const role = localStorage.getItem(STORAGE_KEY);
    if (role === 'coleccionistas') setHref('/para-coleccionistas');
    else if (role === 'artistas') setHref('/para-artistas');
  }, []);

  return (
    <a href={href} className="brand">MANCHA<span>.</span></a>
  );
}
