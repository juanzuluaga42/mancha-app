'use client';

import { useState } from 'react';
import { CRITERIA, CONFIDENCE, DECISIONS, computeCuratorialIndex } from '@/lib/curatorial';
import { submitEvaluation } from '@/app/[locale]/curaduria/actions';

// Formulario de los 10 criterios + reflexión + decisión (Fase 1).
// Calcula el Curatorial Index en vivo, pero el algoritmo informa, no decide.
export default function CuratorialForm({ assignmentId }) {
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
        <h2>Diez criterios. Mismos para todos.</h2>
        <p>Cada criterio: puntuación 1–10, nivel de confianza y observaciones. Solo la calidad de la obra.</p>
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
                    <h3>{c.label} <em className="cur-crit-w">{Math.round(c.weight * 100)}%</em></h3>
                    <p>{c.desc}</p>
                  </div>
                </div>
                <output className={`cur-crit-score${v.score ? ' has' : ''}`}>{v.score || '–'}</output>
              </div>

              <input
                type="range" min="1" max="10" step="1"
                value={v.score || 1}
                className="cur-range"
                onChange={(e) => set(c.key, { score: parseInt(e.target.value, 10) })}
                aria-label={`Puntuación ${c.label}`}
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
                      {cf.label}
                    </label>
                  ))}
                </div>
                <input
                  type="text" name={`note_${c.key}`} value={v.note}
                  onChange={(e) => set(c.key, { note: e.target.value })}
                  placeholder="Observaciones (opcional)"
                  className="cur-note" maxLength={2000}
                />
              </div>
            </li>
          );
        })}
      </ol>

      {/* Reflexión curatorial */}
      <div className="cur-reflection">
        <h3>Reflexión curatorial</h3>
        <p>Un texto con la profundidad de una cartela razonada de museo, no un comentario superficial.</p>
        <textarea
          name="reflection" rows={6} maxLength={8000}
          placeholder="¿Qué sostiene esta obra? ¿Qué resiste el paso del tiempo?"
          className="cur-reflection-ta"
        />
      </div>

      {/* Decisión */}
      <div className="cur-decision">
        <h3>Decisión</h3>
        <div className="cur-decision-grid">
          {DECISIONS.map((d) => (
            <label key={d.value} className={`cur-decision-opt${decision === d.value ? ' on' : ''}`}>
              <input
                type="radio" name="decision" value={d.value}
                checked={decision === d.value}
                onChange={() => setDecision(d.value)}
                required
              />
              <span className="cur-decision-label">{d.label}</span>
              <span className="cur-decision-desc">{d.desc}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="cur-form-foot">
        <div className="cur-index-live">
          <span className="cur-index-live-lab">Curatorial Index</span>
          <b className={liveIndex != null ? 'ready' : ''}>{liveIndex != null ? liveIndex.toFixed(1) : '—'}</b>
          <span className="cur-index-live-note">El algoritmo informa, nunca decide.</span>
        </div>
        <button type="submit" className="cur-seal-btn" disabled={!complete || !decision}>
          Sellar evaluación →
        </button>
      </div>
      <p className="cur-seal-warn">Al sellar, las puntuaciones, la reflexión y la decisión quedan inmutables. Recién entonces se revela el artista (Fase 2).</p>
    </form>
  );
}
