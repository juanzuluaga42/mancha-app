'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// Compartir la nota: usa el share nativo si existe; si no, copia el enlace.
export default function ShareNote({ title }) {
  const t = useTranslations('notasPage');
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try { await navigator.share({ title, url }); return; } catch { /* cancelado */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* sin permiso de portapapeles */ }
  }

  return (
    <button type="button" className="nota-share" onClick={share} aria-live="polite">
      <span className="nota-share-dot" aria-hidden="true" />
      {copied ? t('copied') : t('share')}
    </button>
  );
}
