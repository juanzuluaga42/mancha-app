'use client';

import { useState } from 'react';
import { OUTCOMES } from '@/lib/curatorial';
import { recordDecision } from '@/app/[locale]/curaduria/actions';

// El Founder registra la decisión final de una obra (tras el colegio).
export default function DecisionForm({ workId, current, currentNote, suggested }) {
  const [outcome, setOutcome] = useState(current || '');

  return (
    <form action={recordDecision} className="cur-decform">
      <input type="hidden" name="workId" value={workId} />
      <div className="cur-decform-opts">
        {OUTCOMES.map((o) => (
          <label key={o.value} className={`cur-decform-opt${outcome === o.value ? ' on' : ''}`}>
            <input type="radio" name="outcome" value={o.value}
              checked={outcome === o.value} onChange={() => setOutcome(o.value)} required />
            <span>{o.label}</span>
            {suggested === o.value && <i className="cur-decform-sug">sugerida</i>}
          </label>
        ))}
      </div>
      <textarea name="note" rows={2} maxLength={4000} defaultValue={currentNote || ''}
        placeholder="Nota de la decisión (opcional, queda en la bitácora)" className="cur-decform-note" />
      <button type="submit" className="cur-decform-btn" disabled={!outcome}>
        {current ? 'Actualizar decisión' : 'Registrar decisión'}
      </button>
    </form>
  );
}
