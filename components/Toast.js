'use client';

import { useEffect, useState } from 'react';

export default function Toast({ success, error }) {
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
      <button onClick={() => setVisible(false)} aria-label="Cerrar" className="toast-close">✕</button>
    </div>
  );
}
