import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';

export const metadata = {
  title: 'MANCHA — Artistas de la temporada',
  description: 'Conocé a los artistas seleccionados para esta temporada de MANCHA — su historia, su medio, y las piezas que tienen disponibles.',
  openGraph: {
    title: 'MANCHA — Artistas de la temporada',
    description: 'Conocé a los artistas seleccionados para esta temporada de MANCHA.',
    images: ['/og-default.jpg'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/og-default.jpg'] },
};

export default async function ArtistasPage() {
  const supabase = await createClient();

  const { data: season } = await supabase
    .from('seasons')
    .select('*')
    .eq('is_current', true)
    .maybeSingle();

  const { data: artists } = await supabase
    .from('artists')
    .select('*, pieces(*, bids(amount), favorites(buyer_id))')
    .eq('season_id', season?.id ?? '00000000-0000-0000-0000-000000000000')
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  const allArtists = artists ?? [];

  return (
    <>
      <Nav />

      <header className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <Splat width="150px" height="130px" top="-40px" left="-50px" color="lilac" rotate={-10} radius="r1" />
        <Splat width="90px" height="80px" bottom="-30px" right="6%" color="yellow" rotate={14} radius="r3" />
        <div className="wrap">
          <p className="eyebrow">Artistas — {season?.name ?? 'Temporada actual'}</p>
          <h1>Quiénes exponen ahora mismo</h1>
          <p className="sub" style={{ margin: 0 }}>Cada pieza se subasta durante toda la temporada. Entrá al perfil de cada artista para conocer su historia, ver sus piezas y pujar.</p>
        </div>
      </header>

      <section className="artists-section">
        <div className="wrap">
          {allArtists.length === 0 ? (
            <div className="empty-state">
              Todavía no hay artistas confirmados para esta temporada. ¿Querés ser el primero? <Link href="/postular">Postular →</Link>
            </div>
          ) : (
            <div className="artist-card-grid">
              {allArtists.map((artist, ai) => {
                const firstPiece = artist.pieces?.[0];
                const gradientClass = `g${(ai % 12) + 1}`;
                const pieceCount = artist.pieces?.length ?? 0;
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
                      <span className="artist-card-cta">Ver {pieceCount === 1 ? 'su pieza' : `sus ${pieceCount} piezas`} →</span>
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
