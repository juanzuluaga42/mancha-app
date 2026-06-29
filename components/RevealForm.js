'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { BIAS_OPTIONS, optLabel, optDesc } from '@/lib/curatorial';
import { submitReveal } from '@/app/[locale]/curaduria/actions';

// Fase 2 — la pregunta que mide la integridad del proceso.
// La evaluación inicial NUNCA se modifica: el sesgo vive en un registro aparte.
export default function RevealForm({ assignmentId }) {
  const t = useTranslations('curaduria');
  const locale = useLocale();
  const [bias, setBias] = useState('');
  const needsJustification = bias && bias !== 'none';

  return (
    <form action={submitReveal} className="cur-reveal-form">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <h3>{t('reveal.question')}</h3>
      <div className="cur-bias-grid">
        {BIAS_OPTIONS.map((b) => (
          <label key={b.value} className={`cur-bias-opt${bias === b.value ? ' on' : ''}`}>
            <input
              type="radio" name="bias" value={b.value}
              checked={bias === b.value}
              onChange={() => setBias(b.value)}
              required
            />
            <span className="cur-bias-label">{optLabel(b, locale)}</span>
            <span className="cur-bias-desc">{optDesc(b, locale)}</span>
          </label>
        ))}
      </div>

      {needsJustification && (
        <div className="cur-bias-just">
          <label htmlFor="just">{t('reveal.justifyLabel')}</label>
          <textarea id="just" name="justification" rows={4} maxLength={4000}
            placeholder={t('reveal.justifyPh')} required />
        </div>
      )}

      <button type="submit" className="cur-seal-btn" disabled={!bias}>{t('reveal.submit')}</button>
      <p className="cur-seal-warn">{t('reveal.warn')}</p>
    </form>
  );
}
