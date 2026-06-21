import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';

const GRADIENTS = ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12'];

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: season } = await supabase.from('seasons').select('name').eq('id', id).maybeSingle();
  return { title: season ? `MANCHA — ${season.name}` : 'MANCHA — Temporada' };
}

export default async function TemporadaPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: season } = await supabase.from('seasons').select('*').eq('id', id).maybeSingle();
  if (!season) notFound();

  const { data: artists } = await supabase
    .from('artists')
    .select('*, pieces(*, bids(amount))')
    .eq('season_id', id)
    .order('created_at', { ascending: true });

  const allArtists = artists ?? [];

  return (
    <>
      <Nav />
      <header className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <Splat width="130px" height="115px" top="-25px" left="-30px" color="red" rotate={-10} radius="r3" />
        <div className="wrap">
          <Link href="/temporadas" className="eyebrow" style={{ display: 'inline-block', marginBottom: 18 }}>← Todas las temporadas</Link>
          <p className="eyebrow">
            {new Date(season.starts_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
            {' — '}
            {new Date(season.ends_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
            {' · '}
            <span className={season.is_current ? 'season-status-live' : 'season-status-closed'}>{season.is_current ? 'Temporada actual' : 'Temporada cerrada'}</span>
          </p>
          <h1>{season.name}</h1>
        </div>
      </header>

      <section className="content">
        <div className="wrap">
          {allArtists.length === 0 ? (
            <div className="empty-state">Esta temporada no tiene artistas registrados.</div>
          ) : (
            <div className="artist-card-grid">
              {allArtists.map((artist, ai) => {
                const firstPiece = artist.pieces?.[0];
                const gradientClass = GRADIENTS[ai % GRADIENTS.length];
                const pieceCount = artist.pieces?.length ?? 0;
                const totalBids = (artist.pieces ?? []).reduce((sum, p) => sum + (p.bids?.length ?? 0), 0);
                return (
                  <Link href={`/artistas/${artist.id}`} className="artist-card" key={artist.id}>
                    <div className="artist-card-art">
                      {firstPiece?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firstPiece.image_url} alt={artist.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className={gradientClass} style={{ position: 'absolute', inset: 0 }} />
                      )}
                    </div>
                    <div className="artist-card-info">
                      <p className="eyebrow">{String(ai + 1).padStart(2, '0')}</p>
                      <h3>{artist.display_name}</h3>
                      <p className="artist-card-meta">{artist.medium}{artist.location ? ` · ${artist.location}` : ''}</p>
                      <p className="artist-card-bio">{artist.bio}</p>
                      <span className="artist-card-cta">
                        {pieceCount === 1 ? 'Su pieza' : `Sus ${pieceCount} piezas`}{totalBids > 0 ? ` · ${totalBids} ${totalBids === 1 ? 'puja' : 'pujas'}` : ''} →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
