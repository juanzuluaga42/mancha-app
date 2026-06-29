import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import Nav from '@/components/Nav';
import CandidatesBoard from '@/components/CandidatesBoard';
import { resolveCurator } from '@/lib/curatorAccess';
import { toggleCuratorPublic } from '../actions';

export const metadata = { title: 'MANCHA — Candidatos al consejo' };

export default async function CandidatosPage({ searchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');
  if (curator.role !== 'founder') redirect('/curaduria');

  const admin = createAdminClient();
  const [{ data: candidates }, { data: notes }, { data: council }] = await Promise.all([
    admin.from('cur_candidates').select('*').order('created_at', { ascending: false }),
    admin.from('cur_candidate_notes').select('*').order('created_at', { ascending: false }),
    admin.from('cur_curators').select('id, display_name, email, role, user_id, active, public').order('created_at', { ascending: true }),
  ]);

  // Adjunta notas a cada candidato.
  const notesByCand = {};
  for (const n of notes ?? []) (notesByCand[n.candidate_id] ||= []).push(n);
  const list = (candidates ?? []).map((c) => ({ ...c, notes: notesByCand[c.id] || [] }));
  const pending = list.filter((c) => c.status === 'new').length;

  return (
    <>
      <Nav />
      <header className="cur-header">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--lilac)' }}>Founder · reclutamiento</p>
          <h1 className="cur-header-title">Candidatos al consejo</h1>
          <p className="cur-header-sub">Pipeline de aplicaciones desde /consejo. Mueve cada candidatura por sus etapas; al aprobar, el curador se incorpora y su acceso se activa al entrar con su correo.</p>
          <div className="cur-founder-links">
            <Link href="/curaduria" className="cur-room-link">← Sala curatorial</Link>
          </div>
        </div>
      </header>

      <div className="cur-body">
        <div className="wrap" style={{ maxWidth: 980 }}>
          {sp?.approved && <div className="cur-flash">Candidato aprobado e incorporado. Su acceso se activa al entrar con su correo.</div>}
          {sp?.error && <div className="cur-flash is-err">No pudimos completar la acción.</div>}

          {/* Consejo actual */}
          <section className="cur-section">
            <div className="cur-section-head"><h2>Consejo actual</h2><span className="cur-count">{(council ?? []).length}</span></div>
            <p className="cur-header-sub" style={{ marginTop: 0, marginBottom: 16, fontSize: '.95rem' }}>
              Marca “Mostrar en público” para que un curador aparezca en la página <a href="/curadores" target="_blank" rel="noreferrer" style={{ color: 'var(--lilac-deep)' }}>/curadores</a>. Tú (Founder) nunca apareces.
            </p>
            <div className="cur-council-rows">
              {(council ?? []).map((c) => (
                <div key={c.id} className="cur-council-row">
                  <span className="cur-council-row-name">
                    {c.display_name}
                    <i>{c.role === 'founder' ? 'Founder' : c.role === 'guest' ? 'Guest' : 'Consejo'}</i>
                    {!c.user_id && c.email && <em className="cur-council-pending">invitado · sin entrar</em>}
                  </span>
                  {c.role !== 'founder' && (
                    <form action={toggleCuratorPublic}>
                      <input type="hidden" name="curatorId" value={c.id} />
                      <input type="hidden" name="next" value={(!c.public).toString()} />
                      <button type="submit" className={`cur-public-toggle${c.public ? ' on' : ''}`}>
                        {c.public ? '● Público' : '○ Mostrar en público'}
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Pipeline */}
          <section className="cur-section">
            <div className="cur-section-head"><h2>Candidaturas</h2><span className="cur-count">{pending} nuevas</span></div>
            {list.length === 0 ? (
              <div className="cur-empty">Todavía no hay candidaturas.</div>
            ) : (
              <CandidatesBoard candidates={list} />
            )}
          </section>
        </div>
      </div>
    </>
  );
}
