import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import PaintTrail from '@/components/PaintTrail';
import Countdown from '@/components/Countdown';
import Toast from '@/components/Toast';
import { articles } from '@/lib/news';
import { tips } from '@/lib/tips';

export default async function Home({ searchParams }) {
  const params = await searchParams;
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
    .order('created_at', { ascending: true });

  const allArtists = artists ?? [];

  // Piezas con imagen, para el fondo del hero
  const heroPieces = allArtists
    .flatMap((a) => a.pieces ?? [])
    .filter((p) => p.image_url)
    .slice(0, 5);

  // Aplanamos todas las piezas para armar el bloque de favoritos
  const allPieces = allArtists.flatMap((a) =>
    (a.pieces ?? []).map((p) => ({ ...p, artistName: a.display_name }))
  );
  const topFavorites = [...allPieces]
    .sort((a, b) => (b.favorites?.length ?? 0) - (a.favorites?.length ?? 0))
    .slice(0, 4)
    .filter((p) => (p.favorites?.length ?? 0) > 0);

  const seasonLabel = season
    ? `${season.name} — ${new Date(season.starts_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} / ${new Date(season.ends_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : 'Temporada actual';

  return (
    <>
      <Nav />

      <header className="hero" id="hero">
        <PaintTrail />
        {heroPieces.length > 0 && (
          <div className="hero-gallery" aria-hidden="true">
            {heroPieces.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id} src={p.image_url} alt="" className={`hero-art hero-art-${i + 1}`} />
            ))}
          </div>
        )}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <Splat width="90px" height="80px" bottom="110px" right="6%" color="red" rotate={-12} radius="r3" />
        <Splat width="70px" height="60px" top="6%" right="32%" color="yellow" rotate={8} radius="r4" />
        <Splat width="120px" height="100px" top="50%" left="50%" color="lilac" rotate={4} radius="r2" center />
        <Splat width="60px" height="55px" top="62%" left="38%" color="red" rotate={-16} radius="r3" />
        <Splat width="80px" height="70px" bottom="40px" left="44%" color="yellow" rotate={10} radius="r1" />

        <div className="hero-content">
          <p className="eyebrow">{seasonLabel}</p>
          {season?.ends_at && <Countdown endsAt={season.ends_at} />}
          <h1>El arte no se queda <em>quieto.</em></h1>
          <p className="hero-sub">Una galería con pocos artistas, elegidos a mano, donde cada uno expone solo tres piezas durante tres meses. Cuando termina la temporada, esa oportunidad no vuelve.</p>
          <div className="hero-ctas">
            <a href="#artistas" className="btn-primary">Ver temporada actual</a>
          </div>
        </div>
      </header>

      <Toast success={params?.success} error={params?.error} />

      <section className="mission">
        <Splat width="120px" height="100px" top="-55px" left="10%" color="yellow" rotate={12} radius="r1" />
        <Splat width="90px" height="80px" top="-50px" left="55%" color="red" rotate={-6} radius="r3" />
        <Splat width="110px" height="90px" bottom="-55px" left="25%" color="lilac" rotate={-18} radius="r2" />
        <Splat width="80px" height="70px" bottom="-50px" right="15%" color="yellow" rotate={10} radius="r4" />
        <Splat width="70px" height="70px" top="50%" right="-35px" color="lilac" rotate={6} radius="r1" center />
        <Splat width="55px" height="50px" top="-40px" left="38%" color="red" rotate={18} radius="r4" />
        <Splat width="50px" height="48px" bottom="-38px" right="42%" color="yellow" rotate={-10} radius="r2" />
        <div className="wrap">
          <p>No somos un catálogo infinito: elegimos pocos artistas a la vez, en piezas limitadas, y le damos espacio real a cada historia.</p>
          <div className="stat"><b>{allArtists.length}</b>artistas / temporada</div>
        </div>
      </section>

      <section className="favorites" id="favoritos">
        <Splat width="130px" height="110px" top="-50px" right="8%" color="yellow" rotate={-10} radius="r2" />
        <Splat width="90px" height="80px" bottom="-45px" left="6%" color="lilac" rotate={14} radius="r3" />
        <Splat width="60px" height="60px" top="30%" left="-30px" color="red" rotate={-8} radius="r4" />
        <Splat width="70px" height="60px" bottom="20%" right="-30px" color="lilac" rotate={10} radius="r1" />
        <Splat width="65px" height="58px" top="8%" left="45%" color="red" rotate={20} radius="r2" />
        <Splat width="55px" height="50px" bottom="10%" left="62%" color="yellow" rotate={-14} radius="r3" />
        <div className="wrap">
          <p className="eyebrow">Favoritos</p>
          <h2 style={{ fontSize: 'clamp(1.7rem,3.2vw,2.4rem)', marginTop: 14 }}>Lo más querido de la temporada</h2>
          <p className="section-note">Marca el corazón en cualquier pieza para sumarla a tus favoritos — esto no es la puja, solo ayuda a ver qué le gusta a la comunidad.</p>

          {topFavorites.length === 0 ? (
            <div className="empty-state">Todavía nadie marcó favoritos esta temporada. Sé el primero — necesitas una cuenta de comprador para hacerlo. <Link href="/registro">Crear cuenta →</Link></div>
          ) : (
            <div className="favorites-grid">
              {topFavorites.map((piece, i) => (
                <div className="fav-card" key={piece.id}>
                  <div className="fav-art" style={{ position: 'relative' }}>
                    {piece.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={piece.image_url} alt={piece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className={`g${(i % 12) + 1}`} style={{ position: 'absolute', inset: 0 }} />
                    )}
                  </div>
                  <div className="fav-info">
                    <p className="fav-title">{piece.title}</p>
                    <p className="fav-artist">{piece.artistName}</p>
                    <p className="heart-btn fav-heart active" style={{ pointerEvents: 'none' }}>
                      <svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 21s-7.2-4.35-9.3-8.7C1 9 2.4 5.4 6 5.4c2 0 3.4 1.2 4.4 2.6 1-1.4 2.4-2.6 4.4-2.6 3.6 0 5 3.6 3.3 6.9C19.2 16.65 12 21 12 21z" fill="currentColor" /></svg>
                      <span>{piece.favorites?.length ?? 0}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="artists-section" id="artistas">
        <Splat width="180px" height="160px" top="3%" left="-60px" color="lilac" rotate={-8} radius="r1" />
        <Splat width="100px" height="90px" top="20%" right="-40px" color="yellow" rotate={14} radius="r2" />
        <Splat width="90px" height="80px" bottom="15%" left="-35px" color="red" rotate={20} radius="r3" />
        <Splat width="110px" height="95px" bottom="-40px" right="-45px" color="lilac" rotate={-22} radius="r4" />
        <Splat width="70px" height="62px" top="45%" left="48%" color="yellow" rotate={8} radius="r2" center />
        <Splat width="60px" height="55px" top="8%" left="35%" color="red" rotate={-12} radius="r3" />

        <div className="wrap section-head">
          <p className="eyebrow">Artistas — {season?.name ?? 'Temporada actual'}</p>
          <h2>Quiénes exponen ahora mismo</h2>
          <p className="section-note">Cada pieza se subasta durante toda la temporada. Entrá al perfil de cada artista para conocer su historia, ver sus piezas y pujar.</p>
        </div>

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

      <section className="news" id="notas">
        <Splat width="170px" height="150px" top="-40px" left="-50px" color="red" rotate={20} radius="r3" />
        <Splat width="110px" height="95px" bottom="-40px" right="-35px" color="lilac" rotate={-14} radius="r1" />
        <Splat width="70px" height="60px" top="35%" right="-30px" color="yellow" rotate={8} radius="r4" />
        <Splat width="60px" height="55px" bottom="8%" left="-25px" color="red" rotate={-10} radius="r2" />
        <Splat width="55px" height="50px" top="-35px" left="48%" color="lilac" rotate={16} radius="r1" />
        <Splat width="50px" height="46px" top="55%" left="42%" color="yellow" rotate={-8} radius="r3" />
        <div className="wrap section-head" style={{ paddingTop: 0 }}>
          <p className="eyebrow">Notas</p>
          <h2>Arte, mercado y oficio</h2>
        </div>
        <div className="wrap news-list">
          {articles.map((article) => (
            <article className="news-item" key={article.slug}>
              <p className="news-date">{article.date}</p>
              <div>
                <Link href={`/notas/${article.slug}`} className="news-title" style={{ display: 'block' }}>
                  {article.title}
                </Link>
                <p className="news-excerpt">{article.excerpt}</p>
                <Link href={`/notas/${article.slug}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', borderBottom: '1.5px solid var(--ink)', paddingBottom: 2, display: 'inline-block', marginTop: 10 }}>
                  Leer nota →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="tips" id="tips">
        <Splat width="160px" height="140px" top="-45px" right="-45px" color="yellow" rotate={-12} radius="r2" />
        <Splat width="100px" height="90px" bottom="-35px" left="-35px" color="red" rotate={16} radius="r4" />
        <Splat width="65px" height="58px" top="40%" right="4%" color="lilac" rotate={-8} radius="r1" />
        <Splat width="55px" height="50px" bottom="12%" left="42%" color="yellow" rotate={10} radius="r3" />
        <div className="wrap section-head" style={{ paddingTop: 0 }}>
          <p className="eyebrow">Tips artísticos</p>
          <h2>Cinco cosas que ayudan más de lo que parecen</h2>
          <p className="section-note">Pensados para quien recién empieza a pintar como hobby — paso a paso, con un ejemplo concreto en cada uno.</p>
        </div>
        <div className="wrap">
          {tips.map((tip) => (
            <div className="tip-card" key={tip.title}>
              <h3>{tip.title}</h3>
              <ol className="tip-steps">
                {tip.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <div className="tip-example">
                <b>Ejemplo</b>
                {tip.example}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
