'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function Toast({ success, error }) {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (success || error) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (!visible || (!success && !error)) return null;

  return (
    <div className={`toast ${error ? 'toast-error' : 'toast-success'}`} role="status">
      <span>{error || success}</span>
      <button onClick={() => setVisible(false)} aria-label={t('close')} className="toast-close">✕</button>
    </div>
  );
}
