'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { CRITERIA, CONFIDENCE, DECISIONS, computeCuratorialIndex, optLabel, optDesc } from '@/lib/curatorial';
import { submitEvaluation } from '@/app/[locale]/curaduria/actions';

// Formulario de los 10 criterios + reflexión + decisión (Fase 1).
// Calcula el Curatorial Index en vivo, pero el algoritmo informa, no decide.
export default function CuratorialForm({ assignmentId }) {
  const t = useTranslations('curaduria');
  const locale = useLocale();
  const [scores, setScores] = useState(() =>
    Object.fromEntries(CRITERIA.map((c) => [c.key, { score: 0, confidence: '', note: '' }]))
  );
  const [decision, setDecision] = useState('');

  function set(key, patch) {
    setScores((s) => ({ ...s, [key]: { ...s[key], ...patch } }));
  }

  const complete = CRITERIA.every((c) => scores[c.key].score >= 1 && scores[c.key].confidence);
  const liveIndex = complete ? computeCuratorialIndex(scores) : null;

  return (
    <form action={submitEvaluation} className="cur-form">
      <input type="hidden" name="assignmentId" value={assignmentId} />

      <div className="cur-form-head">
        <h2>{t('form.title')}</h2>
        <p>{t('form.sub')}</p>
      </div>

      <ol className="cur-crit-list">
        {CRITERIA.map((c) => {
          const v = scores[c.key];
          return (
            <li key={c.key} className="cur-crit">
              <div className="cur-crit-top">
                <div className="cur-crit-label">
                  <span className="cur-crit-n">{String(c.n).padStart(2, '0')}</span>
                  <div>
                    <h3>{optLabel(c, locale)} <em className="cur-crit-w">{Math.round(c.weight * 100)}%</em></h3>
                    <p>{optDesc(c, locale)}</p>
                  </div>
                </div>
                <output className={`cur-crit-score${v.score ? ' has' : ''}`}>{v.score || '–'}</output>
              </div>

              <input
                type="range" min="1" max="10" step="1"
                value={v.score || 1}
                className="cur-range"
                onChange={(e) => set(c.key, { score: parseInt(e.target.value, 10) })}
                aria-label={optLabel(c, locale)}
              />
              <input type="hidden" name={`score_${c.key}`} value={v.score || ''} />

              <div className="cur-crit-controls">
                <div className="cur-conf">
                  {CONFIDENCE.map((cf) => (
                    <label key={cf.value} className={`cur-conf-opt${v.confidence === cf.value ? ' on' : ''}`}>
                      <input
                        type="radio" name={`conf_${c.key}`} value={cf.value}
                        checked={v.confidence === cf.value}
                        onChange={() => set(c.key, { confidence: cf.value })}
                      />
                      {optLabel(cf, locale)}
                    </label>
                  ))}
                </div>
                <input
                  type="text" name={`note_${c.key}`} value={v.note}
                  onChange={(e) => set(c.key, { note: e.target.value })}
                  placeholder={t('form.notesPh')}
                  className="cur-note" maxLength={2000}
                />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Reflexión curatorial */}
      <div className="cur-reflection">
        <h3>{t('form.reflectionTitle')}</h3>
        <p>{t('form.reflectionSub')}</p>
        <textarea
          name="reflection" rows={6} maxLength={8000}
          placeholder={t('form.reflectionPh')}
          className="cur-reflection-ta"
        />
      </div>

      {/* Decisión */}
      <div className="cur-decision">
        <h3>{t('form.decision')}</h3>
        <div className="cur-decision-grid">
          {DECISIONS.map((d) => (
            <label key={d.value} className={`cur-decision-opt${decision === d.value ? ' on' : ''}`}>
              <input
                type="radio" name="decision" value={d.value}
                checked={decision === d.value}
                onChange={() => setDecision(d.value)}
                required
              />
              <span className="cur-decision-label">{optLabel(d, locale)}</span>
              <span className="cur-decision-desc">{optDesc(d, locale)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="cur-form-foot">
        <div className="cur-index-live">
          <span className="cur-index-live-lab">{t('form.index')}</span>
          <b className={liveIndex != null ? 'ready' : ''}>{liveIndex != null ? liveIndex.toFixed(1) : '—'}</b>
          <span className="cur-index-live-note">{t('form.indexNote')}</span>
        </div>
        <button type="submit" className="cur-seal-btn" disabled={!complete || !decision}>
          {t('form.seal')}
        </button>
      </div>
      <p className="cur-seal-warn">{t('form.sealWarn')}</p>
    </form>
  );
}
