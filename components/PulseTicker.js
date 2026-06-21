'use client';

import { useEffect, useState } from 'react';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'recién';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return `hace ${Math.floor(hours / 24)} d`;
}

export default function PulseTicker() {
  const [activity, setActivity] = useState([]);
  const [index, setIndex] = useState(0);

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

  if (activity.length === 0) return null;

  const current = activity[index % activity.length];

  return (
    <div className="pulse-ticker">
      <span className="pulse-dot" />
      <span>Alguien pujó por "{current.title}" {timeAgo(current.createdAt)}</span>
    </div>
  );
}
