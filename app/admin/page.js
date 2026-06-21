import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

const ADMIN_EMAIL = 'mancha.gallery@gmail.com';

export const metadata = { title: 'MANCHA — Panel' };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect('/');
  }

  const { data: artists } = await supabase
    .from('artists')
    .select('display_name, pieces(id, title, min_bid, image_url, bids(amount, created_at, buyer:profiles(full_name, email)))')
    .order('created_at', { ascending: true });

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
