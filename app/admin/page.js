import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import { approveArtist, rejectArtist, approveApplication, rejectApplication, markAsSold, sendPaymentReminder } from './actions';
import { cap } from '@/lib/utils';

const ADMIN_EMAIL = 'mancha.gallery@gmail.com';

export const metadata = { title: 'MANCHA — Panel' };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect('/');

  const [
    { data: applications },
    { data: pendingArtists },
    { data: artists },
    { data: leads },
  ] = await Promise.all([
    supabase.from('artist_applications').select('*').eq('status', 'pending').order('created_at', { ascending: true }),
    supabase.from('artists').select('id, display_name, bio, medium, location, created_at, profiles(email)').eq('status', 'pending').order('created_at', { ascending: true }),
    supabase.from('artists').select('display_name, pieces(id, title, min_bid, image_url, sold, paid_at, bids(amount, created_at, buyer:profiles(full_name, email)))').eq('status', 'approved').order('created_at', { ascending: true }),
    supabase.from('leads').select('email, created_at, pieces(title)').order('created_at', { ascending: false }).limit(100),
  ]);

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
              <b>{(applications ?? []).length}</b>
              <span>Postulaciones nuevas</span>
            </div>
            <div className="admin-stat-pill">
              <b>{(pendingArtists ?? []).length}</b>
              <span>Cuentas pendientes</span>
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
            <a href="#postulaciones">Postulaciones ({(applications ?? []).length})</a>
            <a href="#cuentas">Cuentas pendientes ({(pendingArtists ?? []).length})</a>
            <a href="#pujas">Pujas activas ({rows.length} piezas)</a>
            <a href="#espera">Lista de espera ({(leads ?? []).length})</a>
          </nav>
        </div>
      </header>

      <div className="admin-body">
        <div className="wrap" style={{ maxWidth: 1080 }}>

          {/* ── POSTULACIONES ────────────────────────────── */}
          <section className="admin-section" id="postulaciones">
            <div className="admin-section-head">
              <h2>Postulaciones nuevas</h2>
              <span className="admin-count-badge">{(applications ?? []).length}</span>
            </div>

            {(!applications || applications.length === 0) ? (
              <div className="admin-empty">Ninguna postulación esperando revisión.</div>
            ) : (
              <div className="admin-cards">
                {applications.map((a) => (
                  <div className="admin-app-card" key={a.id}>
                    <div className="admin-app-main">
                      <div className="admin-app-info">
                        <h3 className="admin-app-name">{a.full_name}</h3>
                        <div className="admin-app-meta">
                          {a.city && <span>{a.city}</span>}
                          <a href={`mailto:${a.email}`}>{a.email}</a>
                          {a.instagram && (
                            <a href={`https://instagram.com/${a.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                              {a.instagram}
                            </a>
                          )}
                          {a.portfolio_url && (
                            <a href={a.portfolio_url} target="_blank" rel="noreferrer">Portfolio →</a>
                          )}
                        </div>
                        <p className="admin-app-bio">{a.bio}</p>
                      </div>

                      <div className="admin-app-actions">
                        <form action={approveApplication}>
                          <input type="hidden" name="applicationId" value={a.id} />
                          <button type="submit" className="admin-btn admin-btn-approve">Aprobar</button>
                        </form>
                        <form action={rejectApplication}>
                          <input type="hidden" name="applicationId" value={a.id} />
                          <button type="submit" className="admin-btn admin-btn-reject">Rechazar</button>
                        </form>
                      </div>
                    </div>

                    {(a.image_url_1 || a.image_url_2 || a.image_url_3) && (
                      <div className="admin-app-images">
                        {[a.image_url_1, a.image_url_2, a.image_url_3].filter(Boolean).map((url, i) => (
                          <a href={url} target="_blank" rel="noreferrer" key={i} className="admin-app-img-link">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt={`Obra ${i + 1} de ${a.full_name}`} />
                          </a>
                        ))}
                      </div>
                    )}

                    <p className="admin-app-date">
                      Recibida el {new Date(a.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── CUENTAS PENDIENTES ───────────────────────── */}
          <section className="admin-section" id="cuentas">
            <div className="admin-section-head">
              <h2>Cuentas de artista pendientes</h2>
              <span className="admin-count-badge">{(pendingArtists ?? []).length}</span>
            </div>

            {(!pendingArtists || pendingArtists.length === 0) ? (
              <div className="admin-empty">Ninguna cuenta esperando aprobación.</div>
            ) : (
              <div className="admin-cards">
                {pendingArtists.map((a) => (
                  <div className="admin-app-card" key={a.id}>
                    <div className="admin-app-main">
                      <div className="admin-app-info">
                        <h3 className="admin-app-name">{cap(a.display_name)}</h3>
                        <div className="admin-app-meta">
                          {a.medium && <span>{a.medium}</span>}
                          {a.location && <span>{a.location}</span>}
                          {a.profiles?.email && <a href={`mailto:${a.profiles.email}`}>{a.profiles.email}</a>}
                        </div>
                        <p className="admin-app-bio">{a.bio}</p>
                      </div>
                      <div className="admin-app-actions">
                        <form action={approveArtist}>
                          <input type="hidden" name="artistId" value={a.id} />
                          <button type="submit" className="admin-btn admin-btn-approve">Aprobar</button>
                        </form>
                        <form action={rejectArtist}>
                          <input type="hidden" name="artistId" value={a.id} />
                          <button type="submit" className="admin-btn admin-btn-reject">Rechazar</button>
                        </form>
                      </div>
                    </div>
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
