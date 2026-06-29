import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import { approveArtist, rejectArtist, markAsSold, sendPaymentReminder, sealSeason } from './actions';
import { cap } from '@/lib/utils';
import { isSealed } from '@/lib/provenance';

const ADMIN_EMAIL = 'mancha.gallery@gmail.com';

export const metadata = { title: 'MANCHA — Panel' };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const [
    { data: pendingArtists },
    { data: artists },
    { data: leads },
    { data: seasons },
  ] = await Promise.all([
    supabase.from('artists').select('id, display_name, bio, medium, location, created_at, profiles(email), pieces(id, title, min_bid, image_url)').eq('status', 'pending').order('created_at', { ascending: true }),
    supabase.from('artists').select('display_name, pieces(id, title, min_bid, image_url, sold, paid_at, in_canon, accession, bids(amount, created_at, buyer:profiles(full_name, email)))').eq('status', 'approved').order('created_at', { ascending: true }),
    supabase.from('leads').select('email, created_at, pieces(title)').order('created_at', { ascending: false }).limit(100),
    supabase.from('seasons').select('id, name, starts_at, ends_at, sealed_at, is_current').order('starts_at', { ascending: false }),
  ]);

  // Artistas en revisión = pending con al menos 1 obra. Registrados sin obra = pending con 0.
  const inReview = (pendingArtists ?? []).filter((a) => (a.pieces ?? []).length >= 1);
  const noWorks = (pendingArtists ?? []).filter((a) => (a.pieces ?? []).length === 0);

  const rows = (artists ?? []).flatMap((artist) =>
    (artist.pieces ?? []).map((piece) => {
      const bids = [...(piece.bids ?? [])].sort((a, b) => Number(b.amount) - Number(a.amount));
      const leader = bids[0] ?? null;
      return {
        id: piece.id,
        title: piece.title,
        artistName: artist.display_name,
        minBid: Number(piece.min_bid),
        bidCount: bids.length,
        sold: piece.sold,
        paidAt: piece.paid_at,
        inCanon: piece.in_canon,
        accession: piece.accession,
        imageUrl: piece.image_url,
        leader,
      };
    })
  ).sort((a, b) => (b.leader?.amount ?? 0) - (a.leader?.amount ?? 0));

  const totalBids = rows.reduce((s, r) => s + r.bidCount, 0);
  const soldCount = rows.filter((r) => r.sold).length;
  const paidCount = rows.filter((r) => r.paidAt).length;

  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="admin-header">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>Acceso restringido</p>
          <h1 className="admin-header-title">Panel de control</h1>
          <div className="admin-stats-bar">
            <div className="admin-stat-pill">
              <b>{inReview.length}</b>
              <span>En revisión</span>
            </div>
            <div className="admin-stat-pill">
              <b>{noWorks.length}</b>
              <span>Registrados sin obra</span>
            </div>
            <div className="admin-stat-pill">
              <b>{totalBids}</b>
              <span>Pujas totales</span>
            </div>
            <div className="admin-stat-pill">
              <b>{soldCount}</b>
              <span>Piezas vendidas</span>
            </div>
            <div className="admin-stat-pill">
              <b>{(leads ?? []).length}</b>
              <span>En lista de espera</span>
            </div>
          </div>

          {/* Quick nav */}
          <nav className="admin-quick-nav">
            <a href="#revision">En revisión ({inReview.length})</a>
            <a href="#sin-obra">Registrados sin obra ({noWorks.length})</a>
            <a href="#pujas">Pujas activas ({rows.length} piezas)</a>
            <a href="#espera">Lista de espera ({(leads ?? []).length})</a>
          </nav>
        </div>
      </header>

      <div className="admin-body">
        <div className="wrap" style={{ maxWidth: 1080 }}>

          {/* ── EN REVISIÓN (pending con obras) ──────────── */}
          <section className="admin-section" id="revision">
            <div className="admin-section-head">
              <h2>En revisión</h2>
              <span className="admin-count-badge">{inReview.length}</span>
            </div>

            {inReview.length === 0 ? (
              <div className="admin-empty">Ningún artista con obras esperando decisión.</div>
            ) : (
              <div className="admin-cards">
                {inReview.map((a) => (
                  <div className="admin-app-card" key={a.id}>
                    <div className="admin-app-main">
                      <div className="admin-app-info">
                        <h3 className="admin-app-name">{cap(a.display_name)}</h3>
                        <div className="admin-app-meta">
                          {a.medium && <span>{a.medium}</span>}
                          {a.location && <span>{a.location}</span>}
                          {a.profiles?.email && <a href={`mailto:${a.profiles.email}`}>{a.profiles.email}</a>}
                          <span>{(a.pieces ?? []).length} {(a.pieces ?? []).length === 1 ? 'obra' : 'obras'}</span>
                        </div>
                        <p className="admin-app-bio">{a.bio}</p>
                      </div>
                      <div className="admin-app-actions">
                        <form action={approveArtist}>
                          <input type="hidden" name="artistId" value={a.id} />
                          <button type="submit" className="admin-btn admin-btn-approve">Seleccionar</button>
                        </form>
                        <form action={rejectArtist}>
                          <input type="hidden" name="artistId" value={a.id} />
                          <button type="submit" className="admin-btn admin-btn-reject">No seleccionar</button>
                        </form>
                      </div>
                    </div>

                    {(a.pieces ?? []).length > 0 && (
                      <div className="admin-app-images">
                        {(a.pieces ?? []).map((p) => (
                          p.image_url ? (
                            <a href={p.image_url} target="_blank" rel="noreferrer" key={p.id} className="admin-app-img-link">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.image_url} alt={`${p.title} de ${a.display_name}`} />
                            </a>
                          ) : (
                            <div className="admin-app-img-link" key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, padding: 8 }}>
                              {p.title} (sin imagen)
                            </div>
                          )
                        ))}
                      </div>
                    )}

                    <p className="admin-app-date">
                      Registrado el {new Date(a.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── REGISTRADOS SIN OBRA (pending sin obras) ─── */}
          <section className="admin-section" id="sin-obra">
            <div className="admin-section-head">
              <h2>Registrados sin obra</h2>
              <span className="admin-count-badge">{noWorks.length}</span>
            </div>

            {noWorks.length === 0 ? (
              <div className="admin-empty">Todos los registrados tienen al menos una obra.</div>
            ) : (
              <div className="admin-leads-list">
                {noWorks.map((a) => (
                  <div className="admin-lead-row" key={a.id}>
                    <span className="admin-lead-email">
                      {cap(a.display_name)}
                      {a.profiles?.email && <> · <a href={`mailto:${a.profiles.email}`}>{a.profiles.email}</a></>}
                    </span>
                    <span className="admin-lead-interest">{a.medium || 'Sin técnica'}{a.location ? ` · ${a.location}` : ''}</span>
                    <span className="admin-lead-date">
                      {new Date(a.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── PUJAS ACTIVAS ────────────────────────────── */}
          <section className="admin-section" id="pujas">
            <div className="admin-section-head">
              <h2>Pujas activas</h2>
              <span className="admin-count-badge">{rows.length} piezas</span>
            </div>

            {rows.length === 0 ? (
              <div className="admin-empty">Todavía no hay piezas cargadas.</div>
            ) : (
              <div className="admin-bids-list">
                {rows.map((r) => {
                  const status = r.paidAt ? 'paid' : r.sold ? 'sold' : r.bidCount > 0 ? 'active' : 'empty';
                  return (
                    <div className={`admin-bid-row admin-bid-${status}`} key={r.id}>
                      <div className="admin-bid-art">
                        {r.imageUrl
                          ? /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={r.imageUrl} alt={r.title} />
                          : <div className="admin-bid-art-placeholder" />
                        }
                      </div>

                      <div className="admin-bid-info">
                        <a href={`/obras/${r.id}`} target="_blank" rel="noreferrer" className="admin-bid-title">
                          {r.title}
                        </a>
                        <p className="admin-bid-artist">{cap(r.artistName)}</p>
                        {r.leader && (
                          <p className="admin-bid-winner">
                            {r.leader.buyer?.full_name || 'Sin nombre'}
                            {r.leader.buyer?.email && (
                              <> · <a href={`mailto:${r.leader.buyer.email}`}>{r.leader.buyer.email}</a></>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="admin-bid-amount">
                        {r.leader
                          ? <><b>${Number(r.leader.amount).toLocaleString('es-AR')}</b><span>USD</span></>
                          : <span className="admin-bid-nopuja">Sin pujas — mín. ${r.minBid.toLocaleString('es-AR')}</span>
                        }
                        {r.bidCount > 0 && <p className="admin-bid-count">{r.bidCount} {r.bidCount === 1 ? 'puja' : 'pujas'}</p>}
                      </div>

                      <div className="admin-bid-action">
                        {r.paidAt ? (
                          <span className="admin-badge admin-badge-paid">Pagada ✓</span>
                        ) : r.sold ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                            <span className="admin-badge admin-badge-sold">Vendida — pago pendiente</span>
                            <form action={sendPaymentReminder}>
                              <input type="hidden" name="pieceId" value={r.id} />
                              <button type="submit" className="admin-btn admin-btn-sm">Reenviar recordatorio</button>
                            </form>
                          </div>
                        ) : r.leader ? (
                          <form action={markAsSold}>
                            <input type="hidden" name="pieceId" value={r.id} />
                            <button type="submit" className="admin-btn admin-btn-sell">Cerrar y avisar al ganador →</button>
                          </form>
                        ) : (
                          <span className="admin-badge admin-badge-empty">Sin actividad</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── TEMPORADAS / SELLADO ─────────────────────── */}
          <section className="admin-section" id="temporadas">
            <div className="admin-section-head">
              <h2>Temporadas</h2>
              <span className="admin-count-badge">{(seasons ?? []).length}</span>
            </div>
            {(!seasons || seasons.length === 0) ? (
              <div className="admin-empty">No hay temporadas.</div>
            ) : (
              <div className="admin-leads-list">
                {seasons.map((s) => {
                  const sealed = isSealed(s);
                  return (
                    <div className="admin-lead-row" key={s.id}>
                      <span className="admin-lead-email">
                        {s.name}{s.is_current ? ' · actual' : ''}
                      </span>
                      <span className="admin-lead-interest">
                        {sealed
                          ? `Sellada${s.sealed_at ? ' ' + new Date(s.sealed_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}`
                          : 'Abierta'}
                      </span>
                      <span className="admin-lead-date">
                        {sealed ? (
                          <span className="admin-badge admin-badge-paid">En el Índice ✓</span>
                        ) : (
                          <form action={sealSeason}>
                            <input type="hidden" name="seasonId" value={s.id} />
                            <button type="submit" className="admin-btn admin-btn-sm">Sellar temporada →</button>
                          </form>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── LISTA DE ESPERA ──────────────────────────── */}
          <section className="admin-section" id="espera">
            <div className="admin-section-head">
              <h2>Lista de espera e interesados</h2>
              <span className="admin-count-badge">{(leads ?? []).length}</span>
            </div>

            {(!leads || leads.length === 0) ? (
              <div className="admin-empty">Todavía no hay registros.</div>
            ) : (
              <div className="admin-leads-list">
                {leads.map((l, i) => (
                  <div className="admin-lead-row" key={i}>
                    <a href={`mailto:${l.email}`} className="admin-lead-email">{l.email}</a>
                    <span className="admin-lead-interest">
                      {l.pieces?.title ? `Pieza: ${l.pieces.title}` : 'Lista general'}
                    </span>
                    <span className="admin-lead-date">
                      {new Date(l.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
