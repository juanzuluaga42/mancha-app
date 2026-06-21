'use client';

import { useEffect, useState } from 'react';

function diff(target) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return { days, hours, mins, secs, ended: ms === 0 };
}

export default function Countdown({ endsAt }) {
  const [t, setT] = useState(null);

  useEffect(() => {
    setT(diff(endsAt));
    const id = setInterval(() => setT(diff(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!t) return null;

  if (t.ended) {
    return <div className="countdown"><span className="countdown-label">La temporada cerró</span></div>;
  }

  return (
    <div className="countdown" role="timer" aria-label="Tiempo restante de la temporada">
      <span className="countdown-label">Cierra en</span>
      <div className="countdown-units">
        <span className="cd-unit"><b>{t.days}</b>días</span>
        <span className="cd-sep">·</span>
        <span className="cd-unit"><b>{String(t.hours).padStart(2, '0')}</b>hs</span>
        <span className="cd-sep">·</span>
        <span className="cd-unit"><b>{String(t.mins).padStart(2, '0')}</b>min</span>
        <span className="cd-sep">·</span>
        <span className="cd-unit"><b>{String(t.secs).padStart(2, '0')}</b>seg</span>
      </div>
    </div>
  );
}
