'use client';

import { useState, useMemo } from 'react';
import { CANDIDATE_STAGES, stageLabel, stageClass, specialtyEs } from '@/lib/curatorial';
import { setCandidateStage, addCandidateNote, approveCandidate } from '@/app/[locale]/curaduria/actions';

export default function CandidatesBoard({ candidates }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const counts = useMemo(() => {
    const c = { all: candidates.length };
    for (const s of CANDIDATE_STAGES) c[s.value] = candidates.filter((x) => x.status === s.value).length;
    return c;
  }, [candidates]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return candidates.filter((c) => {
      if (filter !== 'all' && c.status !== filter) return false;
      if (!needle) return true;
      const hay = [
        c.name, c.email, c.current_title, c.organization, c.country,
        ...(c.specialties || []).map(specialtyEs),
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [candidates, q, filter]);

  return (
    <div>
      {/* Controles */}
      <div className="cb-controls">
        <input
          className="cb-search"
          type="search"
          placeholder="Buscar por nombre, correo, institución, especialidad…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="cb-tabs">
          <button className={`cb-tab${filter === 'all' ? ' on' : ''}`} onClick={() => setFilter('all')}>
            Todos <i>{counts.all}</i>
          </button>
          {CANDIDATE_STAGES.map((s) => (
            <button key={s.value} className={`cb-tab${filter === s.value ? ' on' : ''}`} onClick={() => setFilter(s.value)}>
              {s.label} <i>{counts[s.value] || 0}</i>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="cur-empty">Sin candidaturas para este filtro.</div>
      ) : (
        <div className="cb-list">
          {filtered.map((c) => (
            <CandidateCard key={c.id} c={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function CandidateCard({ c }) {
  const approved = c.status === 'approved';
  const dateStr = c.created_at
    ? new Date(c.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <article className="cb-card">
      <div className="cb-card-head">
        <div>
          <h3 className="cb-name">
            {c.name}
            <span className={`cur-tag ${stageClass(c.status)}`}>{stageLabel(c.status)}</span>
          </h3>
          <div className="cb-meta">
            <a href={`mailto:${c.email}`}>{c.email}</a>
            {c.current_title && <span>{c.current_title}</span>}
            {c.organization && <span>{c.organization}</span>}
            {c.country && <span>{c.country}</span>}
            {Number.isFinite(c.years_experience) && c.years_experience != null && <span>{c.years_experience} años</span>}
            {dateStr && <span className="cb-date">{dateStr}</span>}
          </div>
        </div>
        {!approved ? (
          <form action={approveCandidate}>
            <input type="hidden" name="candidateId" value={c.id} />
            <button type="submit" className="cb-approve">Aprobar e incorporar →</button>
          </form>
        ) : (
          <span className="cb-approved">✓ En el consejo</span>
        )}
      </div>

      {(c.specialties || []).length > 0 && (
        <div className="cb-specs">
          {c.specialties.map((s) => <span key={s} className="cb-spec">{specialtyEs(s)}</span>)}
        </div>
      )}

      {c.statement && <p className="cb-statement">{c.statement}</p>}

      <div className="cb-extra">
        {c.links && <a href={c.links.startsWith('http') ? c.links : `https://${c.links}`} target="_blank" rel="noreferrer">Links ↗</a>}
        {c.availability && <span>Disponibilidad: {c.availability}</span>}
      </div>

      {/* Etapas del pipeline */}
      {!approved && (
        <div className="cb-stages">
          {CANDIDATE_STAGES.filter((s) => s.value !== 'approved').map((s) => (
            <form action={setCandidateStage} key={s.value}>
              <input type="hidden" name="candidateId" value={c.id} />
              <input type="hidden" name="status" value={s.value} />
              <button type="submit" className={`cb-stage-btn${c.status === s.value ? ' on' : ''}`} disabled={c.status === s.value}>
                {s.label}
              </button>
            </form>
          ))}
        </div>
      )}

      {/* Notas privadas */}
      <details className="cb-notes">
        <summary>Notas privadas {(c.notes?.length ?? 0) > 0 ? `(${c.notes.length})` : ''}</summary>
        {(c.notes || []).map((n) => (
          <div className="cb-note" key={n.id}>
            <p>{n.body}</p>
            <span>{new Date(n.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        ))}
        <form action={addCandidateNote} className="cb-note-form">
          <input type="hidden" name="candidateId" value={c.id} />
          <textarea name="body" rows={2} maxLength={4000} placeholder="Anotar (solo Founder)…" required />
          <button type="submit" className="cur-cand-decline">Guardar nota</button>
        </form>
      </details>
    </article>
  );
}
