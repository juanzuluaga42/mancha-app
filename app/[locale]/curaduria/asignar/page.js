import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import Nav from '@/components/Nav';
import { resolveCurator } from '@/lib/curatorAccess';
import {
  createRound, addWorkFromPiece, addWorkManual,
  assignCuratorsRandom, assignCuratorManual, unassignCurator, setRoundStatus,
} from '../actions';

export const metadata = { title: 'MANCHA — Asignación de obras' };

function one(v) { return Array.isArray(v) ? v[0] : v; }

export default async function AsignarPage({ searchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');
  if (curator.role !== 'founder') redirect('/curaduria');

  const admin = createAdminClient();
  const { data: rounds } = await admin.from('cur_rounds').select('id, name, status, created_at').order('created_at', { ascending: false });
  const round = (rounds ?? [])[0] || null;

  let works = [];
  let curators = [];
  let pieces = [];
  if (round) {
    const [{ data: w }, { data: c }, { data: importedW }] = await Promise.all([
      admin.from('cur_works')
        .select('id, code, title, technique, image_url, cur_assignments(id, phase, cur_curators(id, display_name, role), cur_evaluations(id))')
        .eq('round_id', round.id).order('created_at', { ascending: true }),
      admin.from('cur_curators').select('id, display_name, role, active').in('role', ['council', 'guest']).eq('active', true).order('display_name'),
      admin.from('cur_works').select('piece_id'),
    ]);
    works = w ?? [];
    curators = c ?? [];
    const importedPieceIds = new Set((importedW ?? []).map((x) => x.piece_id).filter(Boolean));
    const { data: approved } = await admin
      .from('pieces')
      .select('id, title, artists!inner(display_name, status)')
      .eq('artists.status', 'approved')
      .order('created_at', { ascending: false });
    pieces = (approved ?? []).filter((p) => !importedPieceIds.has(p.id));
  }

  return (
    <>
      <Nav />
      <header className="cur-header">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--lilac)' }}>Founder · gestión de revisión</p>
          <h1 className="cur-header-title">Asignación de obras</h1>
          <p className="cur-header-sub">Añade obras a la ronda y reparte curadores —al azar para reducir el sesgo. Tres miradas por obra es lo ideal.</p>
          <div className="cur-founder-links">
            <Link href="/curaduria" className="cur-room-link">← Sala curatorial</Link>
            <Link href="/curaduria/colegio" className="cur-room-link">Sala del colegio →</Link>
          </div>
        </div>
      </header>

      <div className="cur-body">
        <div className="wrap" style={{ maxWidth: 1000 }}>
          {sp?.added && <div className="cur-flash">Obra añadida a la ronda.</div>}
          {sp?.error === 'dup' && <div className="cur-flash is-err">Esa pieza ya está en revisión.</div>}
          {sp?.error === 'evaluada' && <div className="cur-flash is-err">No puedes quitar a un curador que ya evaluó (la evaluación es inmutable).</div>}
          {sp?.error === '1' && <div className="cur-flash is-err">No pudimos completar la acción.</div>}

          {!round ? (
            <section className="cur-section">
              <div className="cur-empty">No hay ninguna ronda. Crea una para empezar.</div>
              <form action={createRound} className="asg-roundform">
                <input type="text" name="name" placeholder="Nombre de la ronda (ej. Convocatoria · Temporada 02)" maxLength={200} />
                <button type="submit" className="cur-decform-btn">Crear ronda →</button>
              </form>
            </section>
          ) : (
            <>
              {/* Ronda */}
              <section className="cur-section">
                <div className="cur-round-head">
                  <div>
                    <h2>{round.name}</h2>
                    <span className={`cur-round-status is-${round.status}`}>
                      {round.status === 'closed' ? 'Cerrada' : 'Abierta · curadores evaluando'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <form action={setRoundStatus}>
                      <input type="hidden" name="roundId" value={round.id} />
                      <input type="hidden" name="status" value={round.status === 'closed' ? 'open' : 'closed'} />
                      <button type="submit" className="cb-stage-btn">{round.status === 'closed' ? 'Reabrir' : 'Cerrar'}</button>
                    </form>
                    <form action={createRound}>
                      <input type="hidden" name="name" value={`Ronda ${new Date().getFullYear()}`} />
                      <button type="submit" className="cb-stage-btn">+ Ronda nueva</button>
                    </form>
                  </div>
                </div>
              </section>

              {/* Añadir obra */}
              <section className="cur-section">
                <div className="cur-section-head"><h2>Añadir obra</h2></div>
                {pieces.length > 0 && (
                  <form action={addWorkFromPiece} className="asg-import">
                    <input type="hidden" name="roundId" value={round.id} />
                    <label>Desde una pieza aprobada</label>
                    <div className="asg-import-row">
                      <select name="pieceId" required>
                        <option value="">Elige una pieza…</option>
                        {pieces.map((p) => (
                          <option key={p.id} value={p.id}>{p.title} — {one(p.artists)?.display_name}</option>
                        ))}
                      </select>
                      <button type="submit" className="cur-decform-btn">Importar a revisión →</button>
                    </div>
                  </form>
                )}
                <details className="asg-manual">
                  <summary>Añadir manualmente (obra que no viene de la subasta)</summary>
                  <form action={addWorkManual} className="asg-manual-form">
                    <input type="hidden" name="roundId" value={round.id} />
                    <p className="asg-grouplabel">La obra (lo que ve el curador)</p>
                    <div className="asg-grid">
                      <input name="title" placeholder="Título *" required maxLength={200} />
                      <input name="technique" placeholder="Técnica" maxLength={200} />
                      <input name="dimensions" placeholder="Medidas" maxLength={120} />
                      <input name="year" type="number" placeholder="Año" min="0" max="2100" />
                      <input name="materials" placeholder="Materiales" maxLength={300} />
                      <input name="image_url" placeholder="URL de imagen (https://)" maxLength={600} />
                    </div>
                    <textarea name="statement" rows={2} placeholder="Descripción conceptual anónima (opcional)" maxLength={2000} />
                    <p className="asg-grouplabel">Identidad del artista (oculta hasta Fase 2)</p>
                    <div className="asg-grid">
                      <input name="artist_name" placeholder="Nombre del artista" maxLength={200} />
                      <input name="artist_location" placeholder="Ciudad / país" maxLength={200} />
                      <input name="instagram" placeholder="Instagram" maxLength={120} />
                      <input name="price_usd" type="number" placeholder="Precio USD" min="0" />
                    </div>
                    <textarea name="prestige_notes" rows={2} placeholder="Trayectoria (exposiciones, premios…)" maxLength={1000} />
                    <textarea name="artist_bio" rows={2} placeholder="Bio del artista" maxLength={2000} />
                    <button type="submit" className="cur-decform-btn">Añadir obra →</button>
                  </form>
                </details>
              </section>

              {/* Obras + asignación */}
              <section className="cur-section">
                <div className="cur-section-head"><h2>Obras en la ronda</h2><span className="cur-count">{works.length}</span></div>
                {works.length === 0 ? (
                  <div className="cur-empty">Aún no hay obras en esta ronda. Añade una arriba.</div>
                ) : (
                  <div className="asg-list">
                    {works.map((w) => {
                      const assigns = w.cur_assignments ?? [];
                      const assignedIds = new Set(assigns.map((a) => one(a.cur_curators)?.id));
                      const free = curators.filter((c) => !assignedIds.has(c.id));
                      return (
                        <article className="asg-work" key={w.id}>
                          <div className="asg-work-art">
                            {w.image_url
                              /* eslint-disable-next-line @next/next/no-img-element */
                              ? <img src={w.image_url} alt={w.code} />
                              : <div className="cur-card-noimg" />}
                            <span className="cur-card-code">{w.code}</span>
                          </div>
                          <div className="asg-work-body">
                            <h3>{w.title}</h3>
                            <p className="cur-card-tech">{w.technique}</p>
                            <div className="asg-curators">
                              {assigns.length === 0 && <span className="asg-none">Sin curadores asignados</span>}
                              {assigns.map((a) => {
                                const c = one(a.cur_curators);
                                const evaluated = (Array.isArray(a.cur_evaluations) ? a.cur_evaluations.length : a.cur_evaluations) > 0;
                                return (
                                  <span key={a.id} className={`asg-chip${evaluated ? ' done' : ''}`}>
                                    {c?.display_name}
                                    <i>{evaluated ? 'evaluó' : a.phase === 'phase1' ? 'pendiente' : 'en curso'}</i>
                                    {!evaluated && (
                                      <form action={unassignCurator} style={{ display: 'inline' }}>
                                        <input type="hidden" name="assignmentId" value={a.id} />
                                        <button type="submit" className="asg-x" title="Quitar">×</button>
                                      </form>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                            <div className="asg-actions">
                              <form action={assignCuratorsRandom}>
                                <input type="hidden" name="workId" value={w.id} />
                                <input type="hidden" name="roundId" value={round.id} />
                                <input type="hidden" name="count" value="3" />
                                <button type="submit" className="cur-decform-btn" disabled={free.length === 0}>Asignar 3 al azar →</button>
                              </form>
                              {free.length > 0 && (
                                <form action={assignCuratorManual} className="asg-manual-assign">
                                  <input type="hidden" name="workId" value={w.id} />
                                  <input type="hidden" name="roundId" value={round.id} />
                                  <select name="curatorId" required>
                                    <option value="">Asignar uno…</option>
                                    {free.map((c) => <option key={c.id} value={c.id}>{c.display_name}</option>)}
                                  </select>
                                  <button type="submit" className="cb-stage-btn">+</button>
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
            </>
          )}
        </div>
      </div>
    </>
  );
}
