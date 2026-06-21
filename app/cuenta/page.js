import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { createArtistProfile, addPiece } from './actions';

export const metadata = { title: 'MANCHA — Mi cuenta' };

export default async function CuentaPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/cuenta');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

  return (
    <>
      <Nav />
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow">{profile?.role === 'artist' ? 'Cuenta de artista' : 'Cuenta de comprador'}</p>
          <h1>Hola, {profile?.full_name || 'de nuevo'}.</h1>
        </div>
      </header>

      <section className="dash">
        <div className="wrap">
          {params?.error && <p className="auth-error" style={{ marginBottom: 24 }}>{params.error}</p>}

          {profile?.role === 'artist' ? (
            <ArtistDashboard supabase={supabase} userId={user.id} />
          ) : (
            <BuyerDashboard supabase={supabase} userId={user.id} />
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

async function ArtistDashboard({ supabase, userId }) {
  const { data: artist } = await supabase.from('artists').select('*').eq('profile_id', userId).maybeSingle();

  if (!artist) {
    return (
      <div className="dash-card">
        <h3>Completa tu perfil de artista</h3>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)', marginBottom: 20 }}>
          Esto es lo que va a ver la gente en el catálogo si tu postulación es aceptada.
        </p>
        <form action={createArtistProfile}>
          <div className="field">
            <label htmlFor="display_name">Nombre artístico</label>
            <input id="display_name" name="display_name" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="medium">Técnica</label>
            <input id="medium" name="medium" type="text" placeholder="Ej: Óleo sobre lienzo" required />
          </div>
          <div className="field">
            <label htmlFor="location">Ubicación</label>
            <input id="location" name="location" type="text" placeholder="Ciudad, país" />
          </div>
          <div className="field">
            <label htmlFor="bio">Bio corta</label>
            <textarea id="bio" name="bio" rows={4} required />
          </div>
          <button type="submit" className="auth-submit">Guardar perfil</button>
        </form>
      </div>
    );
  }

  const { data: pieces } = await supabase
    .from('pieces')
    .select('*, bids(amount)')
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: true });

  const myPieces = pieces ?? [];

  return (
    <>
      <div className="dash-card">
        <h3>{artist.display_name}</h3>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-soft)' }}>{artist.medium}{artist.location ? ` · ${artist.location}` : ''}</p>
        <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: 14 }}>{artist.bio}</p>
      </div>

      <div className="dash-card">
        <h3>Tus piezas ({myPieces.length}/3)</h3>
        {myPieces.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)' }}>Todavía no subiste ninguna pieza.</p>
        ) : (
          myPieces.map((p) => {
            const amounts = (p.bids ?? []).map((b) => Number(b.amount));
            const currentBid = amounts.length ? Math.max(...amounts) : Number(p.min_bid);
            return (
              <div className="dash-piece-row" key={p.id}>
                <div>
                  <p className="dash-piece-title">{p.title}</p>
                  <p className="dash-piece-meta">{p.technique} · {p.dimensions}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p className="dash-piece-title">${Number(currentBid).toLocaleString('es-AR')}</p>
                  <p className="dash-piece-meta">{amounts.length} {amounts.length === 1 ? 'puja' : 'pujas'}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {myPieces.length < 3 && (
        <div className="dash-card">
          <h3>Agregar pieza ({myPieces.length}/3)</h3>
          <form action={addPiece}>
            <div className="field">
              <label htmlFor="title">Título</label>
              <input id="title" name="title" type="text" required />
            </div>
            <div className="field">
              <label htmlFor="year">Año</label>
              <input id="year" name="year" type="number" />
            </div>
            <div className="field">
              <label htmlFor="technique">Técnica</label>
              <input id="technique" name="technique" type="text" required />
            </div>
            <div className="field">
              <label htmlFor="dimensions">Dimensiones</label>
              <input id="dimensions" name="dimensions" type="text" placeholder="Ej: 60 × 80 cm" />
            </div>
            <div className="field">
              <label htmlFor="description">Descripción breve</label>
              <textarea id="description" name="description" rows="3" placeholder="Una o dos frases sobre la pieza: de qué se trata, qué la inspiró, algo que ayude a entenderla."></textarea>
            </div>
            <div className="field">
              <label htmlFor="min_bid">Puja mínima (USD)</label>
              <input id="min_bid" name="min_bid" type="number" min="1" required />
            </div>
            <div className="field">
              <label htmlFor="image_file">Foto de la pieza</label>
              <input id="image_file" name="image_file" type="file" accept="image/*" />
            </div>
            <button type="submit" className="auth-submit">Subir pieza</button>
          </form>
        </div>
      )}
    </>
  );
}

async function BuyerDashboard({ supabase, userId }) {
  const { data: bids } = await supabase
    .from('bids')
    .select('*, pieces(title, min_bid, artists(display_name))')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, pieces(title, min_bid, artists(display_name))')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  return (
    <>
      <div className="dash-card">
        <h3>Tus pujas</h3>
        {(!bids || bids.length === 0) ? (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)' }}>Todavía no pujaste por ninguna pieza. <Link href="/#artistas">Ver temporada actual →</Link></p>
        ) : (
          bids.map((b) => (
            <div className="dash-piece-row" key={b.id}>
              <div>
                <p className="dash-piece-title">{b.pieces?.title}</p>
                <p className="dash-piece-meta">{b.pieces?.artists?.display_name}</p>
              </div>
              <p className="dash-piece-title">${Number(b.amount).toLocaleString('es-AR')}</p>
            </div>
          ))
        )}
      </div>

      <div className="dash-card">
        <h3>Tus favoritos</h3>
        {(!favorites || favorites.length === 0) ? (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--ink-soft)' }}>Todavía no marcaste ninguna pieza como favorita.</p>
        ) : (
          favorites.map((f) => (
            <div className="dash-piece-row" key={f.id}>
              <div>
                <p className="dash-piece-title">{f.pieces?.title}</p>
                <p className="dash-piece-meta">{f.pieces?.artists?.display_name}</p>
              </div>
              <p className="dash-piece-meta">Puja mínima ${Number(f.pieces?.min_bid).toLocaleString('es-AR')}</p>
            </div>
          ))
        )}
      </div>
    </>
  );
}
