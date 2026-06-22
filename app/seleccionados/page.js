import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { cap } from '@/lib/utils';

export const metadata = {
  title: 'MANCHA — Los elegidos',
  description: 'El registro permanente de cada artista que pasó el filtro. Temporada por temporada.',
};

export default async function SeleccionadosPage() {
  const supabase = await createClient();

  const { data: seasons } = await supabase
    .from('seasons')
    .select('id, name, starts_at, ends_at, is_current')
    .order('starts_at', { ascending: false });

  const { data: artists } = await supabase
    .from('artists')
    .select('id, display_name, medium, location, bio, season_id, pieces(image_url)')
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  const allSeasons = seasons ?? [];
  const allArtists = artists ?? [];

  const byseason = allSeasons.map((s) => ({
    ...s,
    artists: allArtists.filter((a) => a.season_id === s.id),
  })).filter((s) => s.artists.length > 0);

  const totalArtists = allArtists.length;

  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="elegidos-reg-header">
        <Splat width="200px" height="175px" top="-55px" right="-40px" color="yellow" rotate={-10} radius="r2" />
        <Splat width="115px" height="100px" bottom="-35px" left="-30px" color="red" rotate={16} radius="r4" />
        <Splat width="68px" height="60px" top="44%" left="7%" color="lilac" rotate={9} radius="r1" />
        <div className="wrap">
          <p className="elegidos-reg-eyebrow">El registro</p>
          <h1 className="elegidos-reg-title">
            Los que<br />
            <em>pasaron el filtro.</em>
          </h1>
          <p className="elegidos-reg-sub">
            Cada artista que entró en MANCHA queda aquí para siempre.
            Temporada por temporada — el linaje se construye desde el primer día.
          </p>
          {totalArtists > 0 && (
            <div className="elegidos-reg-meta">
              <span><b>{totalArtists}</b> artista{totalArtists !== 1 ? 's' : ''} seleccionado{totalArtists !== 1 ? 's' : ''}</span>
              <span className="elegidos-reg-meta-sep">·</span>
              <span><b>{allSeasons.length}</b> temporada{allSeasons.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── REGISTRO ─────────────────────────────────────── */}
      <section className="elegidos-reg-body">
        <div className="wrap" style={{ maxWidth: 960 }}>
          {byseason.length === 0 ? (
            <div className="empty-state">Todavía no hay artistas seleccionados publicados.</div>
          ) : (
            byseason.map((season) => (
              <div className="elegidos-reg-season" key={season.id}>
                <div className="elegidos-reg-season-head">
                  <div className="elegidos-reg-season-info">
                    <h2 className="elegidos-reg-season-name">{season.name}</h2>
                    <p className="elegidos-reg-season-dates">
                      {new Date(season.starts_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                      {' — '}
                      {new Date(season.ends_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="elegidos-reg-season-right">
                    <span className={`elegidos-reg-badge${season.is_current ? ' live' : ''}`}>
                      {season.is_current ? '● En curso' : 'Cerrada'}
                    </span>
                    <Link href={`/temporadas/${season.id}`} className="elegidos-reg-season-link">
                      Ver temporada →
                    </Link>
                  </div>
                </div>

                <div className="elegidos-reg-grid">
                  {season.artists.map((artist, ai) => {
                    const img = artist.pieces?.find((p) => p.image_url)?.image_url;
                    return (
                      <Link href={`/artistas/${artist.id}`} className="elegidos-reg-card" key={artist.id}>
                        <div className="elegidos-reg-card-art">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={artist.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className={`g${(ai % 12) + 1}`} style={{ position: 'absolute', inset: 0 }} />
                          )}
                        </div>
                        <div className="elegidos-reg-card-body">
                          <div className="sello sello-sm">
                            <span className="sello-dot">●</span>
                            <span className="sello-text">Seleccionado</span>
                          </div>
                          <p className="elegidos-reg-card-name">{cap(artist.display_name)}</p>
                          <p className="elegidos-reg-card-meta">{artist.medium}{artist.location ? ` · ${artist.location}` : ''}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
