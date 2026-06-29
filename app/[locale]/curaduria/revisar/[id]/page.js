import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import BlindViewer from '@/components/BlindViewer';
import CuratorialForm from '@/components/CuratorialForm';
import RevealForm from '@/components/RevealForm';
import {
  CRITERIA, decisionLabel, biasLabel, confidenceLabel, confidenceProfile,
} from '@/lib/curatorial';
import { resolveCurator } from '@/lib/curatorAccess';

export const metadata = { title: 'MANCHA — Revisión curatorial' };

const ERRORS = {
  incompleto: 'Faltan criterios por puntuar o nivel de confianza.',
  decision: 'Elige una decisión.',
  guardar: 'No pudimos guardar. Intenta de nuevo.',
  sesgo: 'Elige una opción.',
  justifica: 'Justifica el cambio de percepción.',
};

export default async function RevisarPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');
  if (curator.role !== 'founder' && !curator.onboarding_completed_at) redirect('/curaduria/bienvenida');

  const { data: assignment } = await supabase
    .from('cur_assignments')
    .select('id, phase, cur_works(*), cur_evaluations(*), cur_reveal(*)')
    .eq('id', id)
    .eq('curator_id', curator.id)
    .maybeSingle();
  if (!assignment) redirect('/curaduria?error=asignacion');

  const work = assignment.cur_works;
  const evaluation = Array.isArray(assignment.cur_evaluations) ? assignment.cur_evaluations[0] : assignment.cur_evaluations;
  const reveal = Array.isArray(assignment.cur_reveal) ? assignment.cur_reveal[0] : assignment.cur_reveal;
  const phase = assignment.phase;

  // La identidad SOLO se consulta fuera de Fase 1 (RLS la bloquea igualmente).
  let identity = null;
  if (phase !== 'phase1') {
    const { data } = await supabase.from('cur_work_identity').select('*').eq('work_id', work.id).maybeSingle();
    identity = data;
  }

  return (
    <>
      <Nav />
      <div className="cur-review">
        <div className="wrap" style={{ maxWidth: 1180 }}>
          <Link href="/curaduria" className="cur-back">← Sala curatorial</Link>

          {sp?.sealed && <div className="cur-flash">Evaluación sellada. Ahora se revela el artista — Fase 2.</div>}
          {sp?.error && <div className="cur-flash is-err">{ERRORS[sp.error] || 'Algo salió mal.'}</div>}

          <div className="cur-review-grid">
            {/* ── La obra (siempre protagonista) ── */}
            <div className="cur-review-stage">
              <BlindViewer src={work.image_url} alt={work.code} code={work.code} />
              <div className="cur-worktech">
                <h1 className="cur-worktech-title">{work.title || 'Sin título'}</h1>
                <dl className="cur-worktech-data">
                  {work.technique && <><dt>Técnica</dt><dd>{work.technique}</dd></>}
                  {work.dimensions && <><dt>Medidas</dt><dd>{work.dimensions}</dd></>}
                  {work.materials && <><dt>Materiales</dt><dd>{work.materials}</dd></>}
                  {work.year && <><dt>Año</dt><dd>{work.year}</dd></>}
                  {work.color_note && <><dt>Color</dt><dd>{work.color_note}</dd></>}
                </dl>
                {work.statement && (
                  <div className="cur-worktech-stmt">
                    <span className="cur-worktech-stmt-lbl">Descripción conceptual (anónima)</span>
                    <p>{work.statement}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Panel de evaluación / reveal ── */}
            <div className="cur-review-panel">
              {phase === 'phase1' && <CuratorialForm assignmentId={assignment.id} />}

              {phase !== 'phase1' && (
                <>
                  {/* Resumen sellado de Fase 1 */}
                  <div className="cur-sealed">
                    <div className="cur-sealed-head">
                      <span className="cur-sealed-tag">Fase 1 · sellada</span>
                      <div className="cur-sealed-index">
                        <b>{Number(evaluation.curatorial_index).toFixed(1)}</b>
                        <span>Curatorial Index</span>
                      </div>
                    </div>
                    <p className="cur-sealed-decision">{decisionLabel(evaluation.decision)}</p>
                    <ul className="cur-sealed-scores">
                      {CRITERIA.map((c) => {
                        const e = evaluation.scores?.[c.key] || {};
                        return (
                          <li key={c.key}>
                            <span className="s-lab">{c.label}</span>
                            <span className="s-bar"><i style={{ width: `${(e.score || 0) * 10}%` }} /></span>
                            <span className="s-val">{e.score}</span>
                            <span className="s-conf">{confidenceLabel(e.confidence)}</span>
                          </li>
                        );
                      })}
                    </ul>
                    <p className="cur-sealed-conf">Confianza de la evaluación: <b>{confidenceLabel(confidenceProfile(evaluation.scores))}</b></p>
                    {evaluation.reflection && (
                      <blockquote className="cur-sealed-reflection">{evaluation.reflection}</blockquote>
                    )}
                  </div>

                  {/* Reveal de identidad */}
                  <div className="cur-identity">
                    <span className="cur-identity-tag">● Identidad revelada</span>
                    {identity ? (
                      <>
                        <h2 className="cur-identity-name">{identity.artist_name || 'Artista'}</h2>
                        <div className="cur-identity-meta">
                          {identity.artist_location && <span>{identity.artist_location}</span>}
                          {identity.instagram && <span>{identity.instagram}</span>}
                          {identity.price_usd != null && <span>${Number(identity.price_usd).toLocaleString('es-AR')} USD</span>}
                        </div>
                        {identity.artist_bio && <p className="cur-identity-bio">{identity.artist_bio}</p>}
                        {identity.prestige_notes && (
                          <p className="cur-identity-prestige"><b>Trayectoria.</b> {identity.prestige_notes}</p>
                        )}
                      </>
                    ) : (
                      <p className="cur-identity-bio">Sin datos de identidad registrados para esta obra.</p>
                    )}
                  </div>

                  {/* Medición de sesgo */}
                  {phase === 'phase2' && <RevealForm assignmentId={assignment.id} />}
                  {phase === 'done' && reveal && (
                    <div className="cur-bias-result">
                      <span className="cur-bias-result-tag">Medición de sesgo registrada</span>
                      <p className="cur-bias-result-val">{biasLabel(reveal.bias)}</p>
                      {reveal.justification && <p className="cur-bias-result-just">{reveal.justification}</p>}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
