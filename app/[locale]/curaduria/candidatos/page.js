import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import Nav from '@/components/Nav';
import { resolveCurator } from '@/lib/curatorAccess';
import { inviteCandidate, setCandidateStatus } from '../actions';

export const metadata = { title: 'MANCHA — Candidatos al consejo' };

const STATUS = {
  new:      { label: 'Nuevo', cls: 'is-pending' },
  invited:  { label: 'Invitado', cls: 'is-reveal' },
  declined: { label: 'Descartado', cls: 'is-done' },
  archived: { label: 'Archivado', cls: 'is-done' },
};

export default async function CandidatosPage({ searchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');
  if (curator.role !== 'founder') redirect('/curaduria');

  // Lectura con service role para incluir el join con curadores ya creados.
  const admin = createAdminClient();
  const [{ data: candidates }, { data: council }] = await Promise.all([
    admin.from('cur_candidates').select('*').order('created_at', { ascending: false }),
    admin.from('cur_curators').select('display_name, email, role, user_id, active').order('created_at', { ascending: true }),
  ]);

  const list = candidates ?? [];
  const newOnes = list.filter((c) => c.status === 'new');

  return (
    <>
      <Nav />
      <header className="cur-header">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--lilac)' }}>Founder · reclutamiento</p>
          <h1 className="cur-header-title">Candidatos al consejo</h1>
          <p className="cur-header-sub">Expresiones de interés desde /consejo. A quien elijas, lo invitas; su acceso se activa al entrar con ese correo.</p>
          <Link href="/curaduria" className="cur-back" style={{ marginTop: 18 }}>← Sala curatorial</Link>
        </div>
      </header>

      <div className="cur-body">
        <div className="wrap" style={{ maxWidth: 920 }}>
          {sp?.invited && <div className="cur-flash">Invitación enviada. El curador entra con su correo.</div>}
          {sp?.error && <div className="cur-flash is-err">No pudimos completar la acción.</div>}

          {/* Consejo actual */}
          <section className="cur-section">
            <div className="cur-section-head"><h2>Consejo actual</h2><span className="cur-count">{(council ?? []).length}</span></div>
            <div className="cur-cand-council">
              {(council ?? []).map((c, i) => (
                <span key={i} className="cur-council-chip">
                  {c.display_name}
                  <i>{c.role === 'founder' ? 'Founder' : c.role === 'guest' ? 'Guest' : 'Consejo'}</i>
                  {!c.user_id && c.email && <em className="cur-council-pending">invitado · sin entrar</em>}
                </span>
              ))}
            </div>
          </section>

          {/* Candidatos */}
          <section className="cur-section">
            <div className="cur-section-head"><h2>Candidaturas</h2><span className="cur-count">{newOnes.length} nuevas</span></div>
            {list.length === 0 ? (
              <div className="cur-empty">Todavía no hay candidaturas.</div>
            ) : (
              <div className="cur-cand-list">
                {list.map((c) => {
                  const st = STATUS[c.status] || STATUS.new;
                  return (
                    <article key={c.id} className="cur-cand-card">
                      <div className="cur-cand-main">
                        <div>
                          <h3 className="cur-cand-name">{c.name} <span className={`cur-tag ${st.cls}`}>{st.label}</span></h3>
                          <div className="cur-cand-meta">
                            <a href={`mailto:${c.email}`}>{c.email}</a>
                            {c.focus && <span>{c.focus}</span>}
                            {c.portfolio && <a href={c.portfolio} target="_blank" rel="noreferrer">Portafolio ↗</a>}
                          </div>
                          {c.statement && <p className="cur-cand-statement">{c.statement}</p>}
                        </div>
                        <div className="cur-cand-actions">
                          {c.status !== 'invited' && (
                            <form action={inviteCandidate}>
                              <input type="hidden" name="candidateId" value={c.id} />
                              <button type="submit" className="cur-decform-btn">Invitar al consejo →</button>
                            </form>
                          )}
                          {c.status === 'new' && (
                            <form action={setCandidateStatus}>
                              <input type="hidden" name="candidateId" value={c.id} />
                              <input type="hidden" name="status" value="declined" />
                              <button type="submit" className="cur-cand-decline">Descartar</button>
                            </form>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
