import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { cap } from '@/lib/utils';

export const metadata = {
  title: 'MANCHA — Los elegidos',
  description: 'El registro permanente de cada artista que pasó el filtro. Temporada por temporada.',
  openGraph: {
    title: 'MANCHA — Los elegidos',
    description: 'El registro permanente de cada artista que pasó el filtro.',
    images: ['/og-default.jpg'],
    type: 'website',
  },
};

export const dynamic = 'force-dynamic';

export default async function SeleccionadosPage() {
  const supabase = await createClient();

  const { data: seasons } = await supabase
    .from('seasons')
    .select('id, name, starts_at, ends_at, is_current')
    .order('starts_at', { ascending: false });

  const { data: artists } = await supabase
    .from('artists')
    .select('id, display_name, medium, location, bio, season_id, pieces(id, image_url, title, min_bid, bids(amount))')
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  const allSeasons = seasons ?? [];
  const allArtists = artists ?? [];

  const currentSeason = allSeasons.find((s) => s.is_current);
  const currentArtists = allArtists.filter((a) => a.season_id === currentSeason?.id);
  const pastSeasons = allSeasons.filter((s) => !s.is_current);
  const pastByseason = pastSeasons.map((s) => ({
    ...s,
    artists: allArtists.filter((a) => a.season_id === s.id),
  })).filter((s) => s.artists.length > 0);

  const totalArtists = allArtists.length;

  const accentColors = ['var(--red)', 'var(--yellow)', 'var(--lilac)', 'var(--red-deep)', 'var(--yellow-deep)', 'var(--lilac-deep)'];

  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="sel-header">
        <Splat width="220px" height="195px" top="-60px" right="-45px" color="yellow" rotate={-10} radius="r2" />
        <Splat width="130px" height="115px" bottom="-40px" left="-35px" color="red" rotate={16} radius="r4" />
        <Splat width="75px" height="66px" top="44%" left="7%" color="lilac" rotate={9} radius="r1" />
        <div className="wrap">
          <p className="eyebrow sel-eyebrow">El registro permanente</p>
          <h1 className="sel-title">
            Los que<br />
            <em>pasaron el filtro.</em>
          </h1>
          <p className="sel-sub">
            Cada artista que entró en MANCHA queda aquí para siempre.
            Temporada por temporada — el linaje se construye desde el primer día.
          </p>
          {totalArtists > 0 && (
            <div className="sel-meta">
              <span><b>{totalArtists}</b> artista{totalArtists !== 1 ? 's' : ''} seleccionado{totalArtists !== 1 ? 's' : ''}</span>
              <span className="sel-meta-sep">·</span>
              <span><b>{allSeasons.length}</b> temporada{allSeasons.length !== 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="sel-jumps">
            {currentSeason && <a href="#en-curso" className="sel-jump">↓ Temporada en curso</a>}
            {pastByseason.length > 0 && <a href="#archivo" className="sel-jump sel-jump-ghost">↓ Archivo</a>}
          </div>
        </div>
      </header>

      {/* ── TEMPORADA EN CURSO ───────────────────────────── */}
      {currentSeason && (
        <section className="sel-current" id="en-curso">
          <div className="wrap">
            <div className="sel-current-head">
              <div>
                <span className="sel-live-badge">● En curso</span>
                <h2 className="sel-current-title">{currentSeason.name}</h2>
                <p className="sel-current-dates">
                  {new Date(currentSeason.starts_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  {' — '}
                  {new Date(currentSeason.ends_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <Link href="/obras" className="sel-current-catalog">Ver catálogo completo →</Link>
            </div>

            {currentArtists.length === 0 ? (
              <div className="sel-empty">
                <p>Los artistas de esta temporada están siendo seleccionados.</p>
                <Link href="/postular" className="btn-primary" style={{ marginTop: 18, display: 'inline-block' }}>Postular ahora →</Link>
              </div>
            ) : (
              <div className="sel-current-grid">
                {currentArtists.map((artist, i) => {
                  const pieces = artist.pieces ?? [];
                  const firstImg = pieces.find((p) => p.image_url)?.image_url;
                  const allBids = pieces.flatMap((p) => (p.bids ?? []).map((b) => Number(b.amount)));
                  const topBid = allBids.length > 0 ? Math.max(...allBids) : null;
                  const minEntry = pieces.length > 0 ? Math.min(...pieces.map((p) => Number(p.min_bid ?? 0))) : null;
                  const color = accentColors[i % accentColors.length];
                  return (
                    <Link href={`/artistas/${artist.id}`} className="sel-artist-card" key={artist.id}>
                      <div className="sel-artist-media" style={{ background: color }}>
                        {firstImg ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={firstImg} alt={artist.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span className="sel-artist-initials">
                            {artist.display_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                          </span>
                        )}
                        <div className="sel-artist-media-overlay">
                          <span className="sel-artist-n">{String(i + 1).padStart(2, '0')}</span>
                          <span className="sel-artist-pieces-count">{pieces.length} {pieces.length === 1 ? 'pieza' : 'piezas'}</span>
                        </div>
                      </div>
                      <div className="sel-artist-body">
                        <h3 className="sel-artist-name">{cap(artist.display_name)}</h3>
                        <p className="sel-artist-meta">{artist.medium}{artist.location ? ` · ${artist.location}` : ''}</p>
                        {artist.bio && <p className="sel-artist-bio">{artist.bio}</p>}
                        <div className="sel-artist-footer">
                          <div className="sel-artist-price">
                            {topBid ? (
                              <>
                                <span className="sel-price-label">Puja líder</span>
                                <span className="sel-price-num">${topBid.toLocaleString('es-AR')} <span className="sel-price-cur">USD</span></span>
                              </>
                            ) : minEntry ? (
                              <>
                                <span className="sel-price-label">Desde</span>
                                <span className="sel-price-num">${Number(minEntry).toLocaleString('es-AR')} <span className="sel-price-cur">USD</span></span>
                              </>
                            ) : null}
                          </div>
                          <span className="sel-artist-cta">Ver →</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── ARCHIVO HISTÓRICO ────────────────────────────── */}
      {pastByseason.length > 0 && (
        <section className="sel-archive" id="archivo">
          <div className="wrap">
            <div className="sel-archive-head">
              <p className="eyebrow" style={{ color: 'var(--ink-soft)' }}>El archivo</p>
              <h2 className="sel-archive-title">Temporadas anteriores</h2>
              <p className="sel-archive-sub">Permanecen aquí para siempre. El registro de quiénes estuvieron antes.</p>
            </div>
            {pastByseason.map((season) => (
              <div className="sel-past-season" key={season.id}>
                <div className="sel-past-season-head">
                  <div>
                    <h3 className="sel-past-season-name">{season.name}</h3>
                    <p className="sel-past-season-dates">
                      {new Date(season.starts_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                      {' — '}
                      {new Date(season.ends_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <Link href={`/temporadas/${season.id}`} className="sel-past-link">Ver temporada →</Link>
                </div>
                <div className="sel-past-grid">
                  {season.artists.map((artist, ai) => {
                    const img = artist.pieces?.find((p) => p.image_url)?.image_url;
                    return (
                      <Link href={`/artistas/${artist.id}`} className="sel-past-card" key={artist.id}>
                        <div className="sel-past-art">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={artist.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className={`g${(ai % 12) + 1}`} style={{ position: 'absolute', inset: 0 }} />
                          )}
                        </div>
                        <p className="sel-past-name">{cap(artist.display_name)}</p>
                        <p className="sel-past-meta">{artist.medium}</p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CIERRE ───────────────────────────────────────── */}
      <section className="sel-cierre">
        <Splat width="160px" height="140px" top="-45px" left="-40px" color="lilac" rotate={10} radius="r1" />
        <Splat width="100px" height="88px" bottom="-30px" right="-25px" color="red" rotate={-12} radius="r3" />
        <div className="wrap sel-cierre-inner">
          <p className="sel-cierre-pre">¿Tu trabajo debería estar aquí?</p>
          <h2 className="sel-cierre-title">Cada temporada<br /><em>hay lugar para uno más.</em></h2>
          <div className="sel-cierre-ctas">
            <Link href="/postular" className="btn-primary">Postular ahora →</Link>
            <Link href="/manifiesto" className="sel-cierre-ghost">Leer el manifiesto →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
