'use client';

import { useState } from 'react';
import { BIAS_OPTIONS } from '@/lib/curatorial';
import { submitReveal } from '@/app/[locale]/curaduria/actions';

// Fase 2 — la pregunta que mide la integridad del proceso.
// La evaluación inicial NUNCA se modifica: el sesgo vive en un registro aparte.
export default function RevealForm({ assignmentId }) {
  const [bias, setBias] = useState('');
  const needsJustification = bias && bias !== 'none';

  return (
    <form action={submitReveal} className="cur-reveal-form">
      <input type="hidden" name="assignmentId" value={assignmentId} />
      <h3>¿La información del artista modifica tu percepción inicial de la obra?</h3>
      <div className="cur-bias-grid">
        {BIAS_OPTIONS.map((b) => (
          <label key={b.value} className={`cur-bias-opt${bias === b.value ? ' on' : ''}`}>
            <input
              type="radio" name="bias" value={b.value}
              checked={bias === b.value}
              onChange={() => setBias(b.value)}
              required
            />
            <span className="cur-bias-label">{b.label}</span>
            <span className="cur-bias-desc">{b.desc}</span>
          </label>
        ))}
      </div>

      {needsJustification && (
        <div className="cur-bias-just">
          <label htmlFor="just">Justifica objetivamente el motivo del cambio.</label>
          <textarea id="just" name="justification" rows={4} maxLength={4000}
            placeholder="¿Qué información movió el juicio y por qué?" required />
        </div>
      )}

      <button type="submit" className="cur-seal-btn" disabled={!bias}>Registrar y completar →</button>
      <p className="cur-seal-warn">Tu evaluación de Fase 1 permanece intacta. Esta respuesta se guarda por separado y alimenta el Blind Integrity Index de MANCHA.</p>
    </form>
  );
}
