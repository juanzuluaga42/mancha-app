'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';

// Links que se ocultan según el lado elegido (localStorage mancha_role).
const HIDE_FOR_COLLECTOR = ['/sobre-mancha', '/manifiesto']; // institución / manifiesto de artista
const HIDE_FOR_ARTIST = ['/antes-que-el-mundo'];             // manifiesto de coleccionista

export default function NavMenu({ links, authSlot }) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    setRole((localStorage.getItem('mancha_role') || '').toLowerCase());
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCollector = role.startsWith('colec');
  const isArtist = role.startsWith('artist');
  const visibleLinks = links.filter((item) => {
    if (isCollector && HIDE_FOR_COLLECTOR.includes(item.href)) return false;
    if (isArtist && HIDE_FOR_ARTIST.includes(item.href)) return false;
    return true;
  });

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
