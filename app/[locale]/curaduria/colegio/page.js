import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import DecisionForm from '@/components/DecisionForm';
import { setRoundStatus } from '../actions';
import {
  decisionLabel, outcomeLabel, manchaIndex, consensusLevel,
  aggregateCriteria, suggestedOutcome,
} from '@/lib/curatorial';
import { resolveCurator } from '@/lib/curatorAccess';

export const metadata = { title: 'MANCHA — Sala del colegio' };

function one(v) { return Array.isArray(v) ? v[0] : v; }

export default async function ColegioPage({ searchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');
  if (curator.role !== 'founder') redirect('/curaduria');

  const { data: rounds } = await supabase
    .from('cur_rounds')
    .select(`id, name, status,
      cur_works ( id, code, title, image_url, technique,
        cur_assignments ( id, phase, cur_curators ( display_name, role ),
          cur_evaluations ( curatorial_index, decision, scores, reflection ) ),
        cur_decisions ( outcome, note, decided_at ) )`)
    .order('created_at', { ascending: false });

  return (
    <>
      <Nav />
      <header className="cur-header">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--lilac)' }}>Founder · decisión colegiada</p>
          <h1 className="cur-header-title">Sala del colegio</h1>
          <p className="cur-header-sub">Tres miradas independientes se reúnen. El algoritmo informa; tú decides.</p>
          <Link href="/curaduria" className="cur-back" style={{ marginTop: 18 }}>← Sala curatorial</Link>
        </div>
      </header>

      <div className="cur-body">
        <div className="wrap" style={{ maxWidth: 1080 }}>
          {sp?.decided && <div className="cur-flash">Decisión registrada en la bitácora.</div>}
          {sp?.error && <div className="cur-flash is-err">No pudimos completar la acción.</div>}

          {(rounds ?? []).map((round) => {
            const works = round.cur_works ?? [];
            return (
              <section key={round.id} className="cur-round">
                <div className="cur-round-head">
                  <div>
                    <h2>{round.name}</h2>
                    <span className={`cur-round-status is-${round.status}`}>
                      {round.status === 'closed' ? 'Cerrada · evaluaciones reveladas al consejo' : 'Abierta · juicios independientes en curso'}
                    </span>
                  </div>
                  <form action={setRoundStatus}>
                    <input type="hidden" name="roundId" value={round.id} />
                    <input type="hidden" name="status" value={round.status === 'closed' ? 'open' : 'closed'} />
                    <button type="submit" className="cur-round-btn">
                      {round.status === 'closed' ? 'Reabrir ronda' : 'Cerrar ronda y reunir al colegio →'}
                    </button>
                  </form>
                </div>

                <div className="cur-colegio-list">
                  {works.map((w) => {
                    const evals = (w.cur_assignments ?? [])
                      .map((a) => one(a.cur_evaluations))
                      .filter(Boolean);
                    const curatorsEval = (w.cur_assignments ?? []).map((a) => ({
                      name: one(a.cur_curators)?.display_name,
                      role: one(a.cur_curators)?.role,
                      ev: one(a.cur_evaluations),
                    }));
                    const indices = evals.map((e) => Number(e.curatorial_index));
                    const decisions = evals.map((e) => e.decision);
                    const mancha = manchaIndex(indices);
                    const consensus = consensusLevel(indices, decisions);
                    const { strengths, watchpoints } = aggregateCriteria(evals.map((e) => e.scores));
                    const decision = one(w.cur_decisions);
                    const suggested = suggestedOutcome(mancha, consensus);
                    const closed = round.status === 'closed';

                    return (
                      <article key={w.id} className="cur-coleg-card">
                        <div className="cur-coleg-art">
                          {w.image_url
                            /* eslint-disable-next-line @next/next/no-img-element */
                            ? <img src={w.image_url} alt={w.code} />
                            : <div className="cur-card-noimg" />}
                          <span className="cur-card-code">{w.code}</span>
                        </div>

                        <div className="cur-coleg-body">
                          <div className="cur-coleg-top">
                            <div>
                              <h3>{w.title}</h3>
                              <p className="cur-card-tech">{w.technique}</p>
                            </div>
                            <div className="cur-coleg-mancha">
                              <b>{mancha != null ? mancha.toFixed(1) : '—'}</b>
                              <span>MANCHA Index</span>
                              <i className={`cur-consensus is-${consensus.level}`}>{consensus.label}</i>
                            </div>
                          </div>

                          {/* Las tres miradas */}
                          <div className="cur-coleg-curators">
                            {curatorsEval.map((c, i) => (
                              <div key={i} className={`cur-mirror${c.ev ? '' : ' is-pending'}`}>
                                <span className="cur-mirror-name">{c.name}{c.role === 'founder' ? ' · tú' : ''}</span>
                                {c.ev ? (
                                  <>
                                    <b className="cur-mirror-index">{Number(c.ev.curatorial_index).toFixed(1)}</b>
                                    <span className="cur-mirror-dec">{decisionLabel(c.ev.decision)}</span>
                                  </>
                                ) : <span className="cur-mirror-dec">Pendiente</span>}
                              </div>
                            ))}
                          </div>

                          {/* Fortalezas / a vigilar */}
                          {(strengths.length > 0 || watchpoints.length > 0) && (
                            <div className="cur-coleg-agg">
                              {strengths.length > 0 && (
                                <p><span className="cur-agg-lbl ok">Fortalezas</span>
                                  {strengths.map((s) => `${s.label} (${s.mean})`).join(' · ')}</p>
                              )}
                              {watchpoints.length > 0 && (
                                <p><span className="cur-agg-lbl warn">A vigilar</span>
                                  {watchpoints.map((s) => `${s.label} (${s.reason})`).join(' · ')}</p>
                              )}
                            </div>
                          )}

                          {/* Reflexiones del colegio */}
                          {evals.some((e) => e.reflection) && (
                            <details className="cur-coleg-refl">
                              <summary>Reflexiones del colegio ({evals.filter((e) => e.reflection).length})</summary>
                              {curatorsEval.filter((c) => c.ev?.reflection).map((c, i) => (
                                <blockquote key={i}><cite>{c.name}</cite>{c.ev.reflection}</blockquote>
                              ))}
                            </details>
                          )}

                          {/* Decisión del Founder */}
                          <div className="cur-coleg-decision">
                            {decision && (
                              <p className="cur-coleg-current">
                                Decisión actual: <b>{outcomeLabel(decision.outcome)}</b>
                                {decision.note ? ` — ${decision.note}` : ''}
                              </p>
                            )}
                            {closed ? (
                              <DecisionForm workId={w.id} current={decision?.outcome}
                                currentNote={decision?.note} suggested={suggested} />
                            ) : (
                              <p className="cur-coleg-locked">Cierra la ronda para registrar la decisión final.</p>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
