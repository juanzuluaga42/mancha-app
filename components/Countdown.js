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

export default function Countdown({ endsAt, label = 'Cierra en' }) {
  const u = useTranslations('countdown');
  const [t, setT] = useState(null);

  useEffect(() => {
    setT(diff(endsAt));
    const id = setInterval(() => setT(diff(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!t) return null;

  if (t.ended) {
    return null;
  }

  return (
    <div className="countdown" role="timer" aria-label={label}>
      <span className="countdown-label">{label}</span>
      <div className="countdown-units">
        <span className="cd-unit"><b>{t.days}</b>{u('days', { count: t.days })}</span>
        <span className="cd-sep">·</span>
        <span className="cd-unit"><b>{String(t.hours).padStart(2, '0')}</b>{u('hours')}</span>
        <span className="cd-sep">·</span>
        <span className="cd-unit"><b>{String(t.mins).padStart(2, '0')}</b>{u('mins')}</span>
        <span className="cd-sep">·</span>
        <span className="cd-unit"><b>{String(t.secs).padStart(2, '0')}</b>{u('secs')}</span>
      </div>
    </div>
  );
}
