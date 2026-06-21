import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { approveArtist, rejectArtist, approveApplication, rejectApplication, markAsSold, sendPaymentReminder } from './actions';

const ADMIN_EMAIL = 'mancha.gallery@gmail.com';

export const metadata = { title: 'MANCHA — Panel' };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  const { data: applications } = await supabase
    .from('artist_applications')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const { data: pendingArtists } = await supabase
    .from('artists')
    .select('id, display_name, bio, medium, location, created_at, profiles(email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const { data: artists } = await supabase
    .from('artists')
    .select('display_name, pieces(id, title, min_bid, image_url, sold, paid_at, bids(amount, created_at, buyer:profiles(full_name, email)))')
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  const { data: leads } = await supabase
    .from('leads')
    .select('email, created_at, pieces(title)')
    .order('created_at', { ascending: false })
    .limit(100);

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
        leader,
      };
    })
  );

  rows.sort((a, b) => (b.leader?.amount ?? 0) - (a.leader?.amount ?? 0));

  return (
    <>
      <Nav />
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow">Solo tú ves esto</p>
          <h1>Quién va ganando cada pieza</h1>
          <p className="sub">Usá esto para contactar a mano a quien lidera una puja cuando quieras cerrar una venta, antes de tener pagos automáticos.</p>
        </div>
      </header>

      <section className="content">
        <div className="wrap admin-table-wrap">
          <h2 style={{ marginBottom: 16 }}>Postulaciones nuevas ({(applications ?? []).length})</h2>
          {(!applications || applications.length === 0) ? (
            <div className="empty-state">No hay postulaciones nuevas esperando revisión.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
              {applications.map((a) => (
                <div className="dash-card" key={a.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{ maxWidth: 480 }}>
                      <h3>{a.full_name}</h3>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-soft)' }}>
                        {a.city ? `${a.city} · ` : ''}{a.email}
                        {a.instagram && <> · <a href={`https://instagram.com/${a.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">{a.instagram}</a></>}
                        {a.portfolio_url && <> · <a href={a.portfolio_url} target="_blank" rel="noreferrer">Portfolio</a></>}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', marginTop: 10 }}>{a.bio}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <form action={approveApplication}>
                        <input type="hidden" name="applicationId" value={a.id} />
                        <button type="submit" className="auth-submit" style={{ background: 'var(--ink)' }}>Aprobar</button>
                      </form>
                      <form action={rejectApplication}>
                        <input type="hidden" name="applicationId" value={a.id} />
                        <button type="submit" className="auth-submit" style={{ background: 'transparent', color: 'var(--ink)', border: '2px solid var(--ink)' }}>Rechazar</button>
                      </form>
                    </div>
                  </div>
                  {(a.image_url_1 || a.image_url_2 || a.image_url_3) && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      {[a.image_url_1, a.image_url_2, a.image_url_3].filter(Boolean).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <a href={url} target="_blank" rel="noreferrer" key={i}>
                          <img src={url} alt={`Obra ${i + 1} de ${a.full_name}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1.5px solid var(--ink)' }} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <h2 style={{ marginBottom: 16 }}>Cuentas de artista esperando aprobación ({(pendingArtists ?? []).length})</h2>
          {(!pendingArtists || pendingArtists.length === 0) ? (
            <div className="empty-state">No hay postulaciones esperando revisión.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
              {pendingArtists.map((a) => (
                <div className="dash-card" key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ maxWidth: 480 }}>
                    <h3>{a.display_name}</h3>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-soft)' }}>{a.medium}{a.location ? ` · ${a.location}` : ''}{a.profiles?.email ? ` · ${a.profiles.email}` : ''}</p>
                    <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', marginTop: 10 }}>{a.bio}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <form action={approveArtist}>
                      <input type="hidden" name="artistId" value={a.id} />
                      <button type="submit" className="auth-submit" style={{ background: 'var(--ink)' }}>Aprobar</button>
                    </form>
                    <form action={rejectArtist}>
                      <input type="hidden" name="artistId" value={a.id} />
                      <button type="submit" className="auth-submit" style={{ background: 'transparent', color: 'var(--ink)', border: '2px solid var(--ink)' }}>Rechazar</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}

          <h2 style={{ marginBottom: 16 }}>Quién va ganando cada pieza</h2>
          {rows.length === 0 ? (
            <div className="empty-state">Todavía no hay piezas cargadas.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Pieza</th>
                  <th>Artista</th>
                  <th>Pujas</th>
                  <th>Puja más alta</th>
                  <th>Quién va ganando</th>
                  <th>Cierre</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><a href={`/obras/${r.id}`} target="_blank" rel="noreferrer">{r.title}</a></td>
                    <td>{r.artistName}</td>
                    <td>{r.bidCount}</td>
                    <td>{r.leader ? `$${Number(r.leader.amount).toLocaleString('es-AR')}` : `Min. $${r.minBid.toLocaleString('es-AR')} (sin pujas)`}</td>
                    <td>
                      {r.leader ? (
                        <>
                          {r.leader.buyer?.full_name || 'Sin nombre'}
                          {r.leader.buyer?.email && <><br /><a href={`mailto:${r.leader.buyer.email}`}>{r.leader.buyer.email}</a></>}
                        </>
                      ) : '—'}
                    </td>
                    <td>
                      {r.paidAt ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--red-deep)' }}>Pagado ✓</span>
                      ) : r.sold ? (
                        <>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--ink-soft)', display: 'block', marginBottom: 6 }}>Vendida — pago pendiente</span>
                          <form action={sendPaymentReminder}>
                            <input type="hidden" name="pieceId" value={r.id} />
                            <button type="submit" className="piece-delete-btn" style={{ color: 'var(--ink)', borderColor: 'var(--ink)' }}>Enviar recordatorio</button>
                          </form>
                        </>
                      ) : r.leader ? (
                        <form action={markAsSold}>
                          <input type="hidden" name="pieceId" value={r.id} />
                          <button type="submit" className="piece-delete-btn" style={{ color: 'var(--ink)', borderColor: 'var(--ink)' }}>Marcar vendida y avisar</button>
                        </form>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h2 style={{ margin: '40px 0 16px' }}>Lista de espera e interesados ({(leads ?? []).length})</h2>
          {(!leads || leads.length === 0) ? (
            <div className="empty-state">Todavía no hay registros.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Correo</th>
                  <th>Interés</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr key={i}>
                    <td><a href={`mailto:${l.email}`}>{l.email}</a></td>
                    <td>{l.pieces?.title ? `Pieza: ${l.pieces.title}` : 'Lista de espera general'}</td>
                    <td>{new Date(l.created_at).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
