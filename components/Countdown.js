'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

function diff(target) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return { days, hours, mins, secs, ended: ms === 0 };
}

// Countdown editorial de MANCHA. `tone`: 'dark' sobre héroes oscuros, 'light'
// sobre papel. `startsAt` (opcional) dibuja una barra de "tiempo restante" de
// la ventana — útil para la convocatoria (cuánto queda del 1–31 ago).
export default function Countdown({ endsAt, startsAt, label = 'Cierra en', tone = 'light' }) {
  const u = useTranslations('countdown');
  const [t, setT] = useState(null);

  useEffect(() => {
    setT(diff(endsAt));
    const id = setInterval(() => setT(diff(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!t || t.ended) return null;

  // Barra de ventana: fracción de tiempo que aún queda (se encoge hacia el cierre).
  let remaining = null;
  if (startsAt) {
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();
    const now = Date.now();
    if (end > start) remaining = Math.max(0, Math.min(100, ((end - now) / (end - start)) * 100));
  }

  const units = [
    { k: 'd', v: t.days, l: u('days', { count: t.days }) },
    { k: 'h', v: String(t.hours).padStart(2, '0'), l: u('hours') },
    { k: 'm', v: String(t.mins).padStart(2, '0'), l: u('mins') },
    { k: 's', v: String(t.secs).padStart(2, '0'), l: u('secs') },
  ];

  return (
    <div className={`mcd mcd--${tone}`} role="timer" aria-label={`${label}: ${t.days}d ${t.hours}h ${t.mins}m`}>
      <div className="mcd-label"><span className="mcd-dot" aria-hidden="true" />{label}</div>
      <div className="mcd-units">
        {units.map((un) => (
          <div className="mcd-u" key={un.k}>
            <b>{un.v}</b>
            <span className="mcd-u-l">{un.l}</span>
          </div>
        ))}
      </div>
      {remaining != null && (
        <div className="mcd-bar" aria-hidden="true"><i style={{ width: `${remaining}%` }} /></div>
      )}
    </div>
  );
}
