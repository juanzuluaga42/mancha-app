'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Links que se ocultan SOLO del lado coleccionista (lenguaje de institución/artista).
const HIDE_FOR_COLLECTOR = ['/sobre-mancha', '/criterio'];

export default function NavMenu({ links, authSlot }) {
  const [open, setOpen] = useState(false);
  const [isCollector, setIsCollector] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const r = (localStorage.getItem('mancha_role') || '').toLowerCase();
    setIsCollector(r.startsWith('colec'));
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const visibleLinks = isCollector
    ? links.filter((item) => !HIDE_FOR_COLLECTOR.includes(item.href))
    : links;

  return (
    <div className="nav-menu" ref={ref}>
      <button
        type="button"
        className={`nav-menu-btn${open ? ' open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Abrir menú"
      >
        <span className="burger"><span></span><span></span><span></span></span>
      </button>

      {open && (
        <div className="nav-menu-panel">
          <ul>
            {visibleLinks.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
              </li>
            ))}
          </ul>
          <div className="nav-menu-auth">
            {authSlot}
          </div>
        </div>
      )}
    </div>
  );
}
