'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

function timeAgo(dateStr, t) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return t('tickerNow');
  if (mins < 60) return t('tickerMin', { n: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('tickerHour', { n: hours });
  return t('tickerDay', { n: Math.floor(hours / 24) });
}

export default function PulseTicker() {
  const t = useTranslations('misc');
  const [activity, setActivity] = useState([]);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch('/api/pulse', { cache: 'no-store' });
        const data = await res.json();
        if (mounted) setActivity(data.activity || []);
      } catch {
        // Si falla, simplemente no mostramos el ticker — no es crítico.
      }
    }
    load();
    const poll = setInterval(load, 20000);
    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (activity.length < 2) return;
    const rotate = setInterval(() => setIndex((i) => (i + 1) % activity.length), 4500);
    return () => clearInterval(rotate);
  }, [activity]);

  // Aparece unos segundos cada 5 minutos en vez de quedarse pegado siempre.
  useEffect(() => {
    let hideTimer;
    function reveal() {
      setShown(true);
      hideTimer = setTimeout(() => setShown(false), 13000);
    }
    const firstShow = setTimeout(reveal, 5000);
    const interval = setInterval(reveal, 300000);
    return () => {
      clearTimeout(firstShow);
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  if (activity.length === 0) return null;

  const current = activity[index % activity.length];

  return (
    <div className={`pulse-ticker${shown ? ' is-visible' : ''}`}>
      <span className="pulse-dot" />
      <span>{t('tickerLine', { title: current.title, ago: timeAgo(current.createdAt, t) })}</span>
    </div>
  );
}
