import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import { decisionLabel } from '@/lib/curatorial';
import { resolveCurator } from '@/lib/curatorAccess';

export const metadata = { title: 'MANCHA — Curaduría' };

const PHASE_META = {
  phase1: { label: 'Pendiente de evaluar', cls: 'is-pending' },
  phase2: { label: 'Falta Fase 2 · reveal', cls: 'is-reveal' },
  done:   { label: 'Completada', cls: 'is-done' },
};

export default async function CuraduriaPage({ searchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');
  // Incorporación obligatoria para curadores nuevos (el Founder no la hace).
  if (curator.role !== 'founder' && !curator.onboarding_completed_at) redirect('/curaduria/bienvenida');

  // Asignaciones del curador con la obra (cara ciega) y, si existe, su evaluación.
  const { data: assignments } = await supabase
    .from('cur_assignments')
    .select('id, phase, created_at, cur_works(code, title, technique, image_url), cur_evaluations(curatorial_index, decision)')
    .eq('curator_id', curator.id)
    .order('created_at', { ascending: true });

  const list = assignments ?? [];
  const pending  = list.filter((a) => a.phase === 'phase1');
  const reveal   = list.filter((a) => a.phase === 'phase2');
  const done     = list.filter((a) => a.phase === 'done');

  const roleLabel = curator.role === 'founder' ? 'Founder'
    : curator.role === 'guest' ? 'Guest Curator' : 'Founding Curatorial Council';

  return (
    <>
      <Nav />

      <header className="cur-header">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--lilac)' }}>{roleLabel}</p>
          <h1 className="cur-header-title">Sala curatorial</h1>
          <p className="cur-header-sub">La obra habla primero. {curator.display_name}, estas son tus revisiones.</p>
          <div className="cur-stats">
            <div className="cur-stat"><b>{pending.length}</b><span>Por evaluar</span></div>
            <div className="cur-stat"><b>{reveal.length}</b><span>Falta Fase 2</span></div>
            <div className="cur-stat"><b>{done.length}</b><span>Completadas</span></div>
          </div>
          <div className="cur-founder-links">
            <Link href="/curaduria/perfil" className="cur-room-link">Mi perfil · certificado →</Link>
            {curator.role === 'founder' && (
              <>
                <Link href="/curaduria/colegio" className="cur-room-link">Sala del colegio →</Link>
                <Link href="/curaduria/candidatos" className="cur-room-link">Candidatos al consejo →</Link>
                <Link href="/curaduria/integridad" className="cur-room-link">Blind Integrity Index →</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="cur-body">
        <div className="wrap" style={{ maxWidth: 960 }}>
          {sp?.welcome && <div className="cur-flash">Bienvenido al consejo. Tu incorporación está completa.</div>}
          {sp?.done && <div className="cur-flash">Evaluación completada. Gracias por tu juicio.</div>}
          {sp?.error === 'asignacion' && <div className="cur-flash is-err">No encontramos esa asignación.</div>}

          <Section title="Esperan tu mirada" badge={pending.length}
            empty="No tienes obras pendientes de evaluar." assignments={pending} />
          <Section title="Fase 2 · revelar al artista" badge={reveal.length}
            empty="Nada pendiente de reveal." assignments={reveal} />
          <Section title="Completadas" badge={done.length}
            empty="Aún no completas ninguna revisión." assignments={done} muted />
        </div>
      </div>
    </>
  );
}

function Section({ title, badge, empty, assignments, muted }) {
  return (
    <section className="cur-section">
      <div className="cur-section-head">
        <h2>{title}</h2>
        <span className="cur-count">{badge}</span>
      </div>
      {assignments.length === 0 ? (
        <div className="cur-empty">{empty}</div>
      ) : (
        <div className="cur-grid">
          {assignments.map((a) => {
            const w = a.cur_works;
            const ev = Array.isArray(a.cur_evaluations) ? a.cur_evaluations[0] : a.cur_evaluations;
            const meta = PHASE_META[a.phase];
            return (
              <Link key={a.id} href={`/curaduria/revisar/${a.id}`} className={`cur-card${muted ? ' is-muted' : ''}`}>
                <div className="cur-card-img">
                  {w?.image_url
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={w.image_url} alt={w.code} />
                    : <div className="cur-card-noimg" />}
                  <span className="cur-card-code">{w?.code}</span>
                </div>
                <div className="cur-card-info">
                  <h3 className="cur-card-title">{w?.title || 'Sin título'}</h3>
                  <p className="cur-card-tech">{w?.technique}</p>
                  <div className="cur-card-foot">
                    <span className={`cur-tag ${meta.cls}`}>{meta.label}</span>
                    {ev && a.phase !== 'phase1' && (
                      <span className="cur-card-index" title="Tu Curatorial Index">
                        {Number(ev.curatorial_index).toFixed(1)}
                      </span>
                    )}
                  </div>
                  {ev && a.phase === 'done' && (
                    <p className="cur-card-decision">{decisionLabel(ev.decision)}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
