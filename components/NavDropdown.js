'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function NavDropdown({ label, items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <li className="nav-dropdown" ref={ref}>
      <button type="button" className="nav-dropdown-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {label} <span className="nav-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <ul className="nav-dropdown-menu">
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={() => setOpen(false)}>{item.label}</Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
