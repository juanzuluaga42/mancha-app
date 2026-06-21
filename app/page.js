import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import PaintTrail from '@/components/PaintTrail';
import Countdown from '@/components/Countdown';
import Toast from '@/components/Toast';
import WaitlistForm from '@/components/WaitlistForm';

export const metadata = {
  title: 'MANCHA — Descubre artistas antes que el mundo',
  description: 'Descubre y colecciona artistas antes de que el mundo los descubra. Pocos artistas por temporada, piezas limitadas, espacio real para cada historia.',
  openGraph: {
    title: 'MANCHA — Descubre artistas antes que el mundo',
    description: 'Descubre y colecciona artistas antes de que el mundo los descubra. Pocos artistas por temporada, piezas limitadas, espacio real para cada historia.',
    images: ['/og-default.jpg'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/og-default.jpg'] },
};

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
    .eq('status', 'approved')
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

  // Pieza con el precio de entrada más accesible — buen primer punto de contacto para quien puja por primera vez
  const piecesWithPrice = allPieces.map((p) => {
    const bidAmounts = (p.bids ?? []).map((b) => Number(b.amount));
    const currentPrice = bidAmounts.length > 0 ? Math.max(...bidAmounts) : Number(p.min_bid);
    return { ...p, currentPrice, hasBids: bidAmounts.length > 0 };
  });
  const cheapestPiece = piecesWithPrice.length > 0
    ? [...piecesWithPrice].sort((a, b) => a.currentPrice - b.currentPrice)[0]
    : null;

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
          <h1>Descubre y colecciona artistas <em>antes</em> de que el mundo los descubra.</h1>
          <p className="hero-sub">MANCHA elige a mano un puñado de artistas emergentes por temporada — tres piezas cada uno, por tiempo limitado. Lo que ves hoy, después ya no está.</p>
          <div className="hero-ctas">
            <a href="#artistas" className="btn-primary">Ver temporada actual</a>
          </div>
        </div>
      </header>

      <Toast success={params?.success} error={params?.error} />

      <section className="que-es">
        <div className="wrap">
          <p className="eyebrow">¿Qué es MANCHA?</p>
          <h2>Una galería, no un maratón de scroll.</h2>
          <p className="section-note" style={{ maxWidth: 640 }}>Somos una plataforma donde coleccionistas descubren y adquieren obras de artistas emergentes, cuidadosamente seleccionados. Nada de catálogos infinitos: un grupo reducido por temporada, piezas limitadas, y espacio real para cada historia.</p>
        </div>
      </section>

      {cheapestPiece && (
        <section className="why-buy">
          <div className="wrap">
            <p className="eyebrow">¿Por qué comprar con nosotros?</p>
            <h2>Porque llegaste antes.</h2>
            <div className="why-buy-grid">
              <div><b>01</b><p>Compras directo al artista. Sin intermediarios, sin comisión oculta del lado del comprador.</p></div>
              <div><b>02</b><p>Cada obra tiene una historia real detrás, no una ficha genérica de catálogo.</p></div>
              <div><b>03</b><p>Pocas piezas por temporada significa que lo que comprás sigue siendo raro.</p></div>
              <div><b>04</b><p>Entrada accesible: no hace falta ser un coleccionista consagrado para empezar.</p></div>
            </div>
          </div>
        </section>
      )}

      {cheapestPiece && (
        <section className="cheapest-pick">
          <div className="wrap cheapest-pick-inner">
            <div className="cheapest-pick-art">
              {cheapestPiece.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cheapestPiece.image_url} alt={cheapestPiece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="g3" style={{ position: 'absolute', inset: 0 }} />
              )}
            </div>
            <div className="cheapest-pick-info">
              <p className="eyebrow">Para empezar</p>
              <h2>La puja más accesible de la temporada</h2>
              <p className="cheapest-pick-title">{cheapestPiece.title} — {cheapestPiece.artistName}</p>
              <p className="cheapest-pick-amount">${Number(cheapestPiece.currentPrice).toLocaleString('es-AR')}</p>
              <p className="section-note">{cheapestPiece.hasBids ? 'Puja actual más baja' : 'Puja mínima'} de toda la temporada — una buena forma de hacer tu primera puja en MANCHA.</p>
              <Link href={`/obras/${cheapestPiece.id}`} className="btn-primary">Ver esta pieza →</Link>
            </div>
          </div>
        </section>
      )}

      <section className="mission">
        <Splat width="120px" height="100px" top="-55px" left="10%" color="yellow" rotate={12} radius="r1" />
        <Splat width="90px" height="80px" top="-50px" left="55%" color="red" rotate={-6} radius="r3" />
        <Splat width="110px" height="90px" bottom="-55px" left="25%" color="lilac" rotate={-18} radius="r2" />
        <Splat width="80px" height="70px" bottom="-50px" right="15%" color="yellow" rotate={10} radius="r4" />
        <Splat width="70px" height="70px" top="50%" right="-35px" color="lilac" rotate={6} radius="r1" center />
        <Splat width="55px" height="50px" top="-40px" left="38%" color="red" rotate={18} radius="r4" />
        <Splat width="50px" height="48px" bottom="-38px" right="42%" color="yellow" rotate={-10} radius="r2" />
        <div className="wrap">
          <p>Existimos porque el talento emergente se ahoga en feeds infinitos. Nosotros elegimos por ti: pocos artistas, piezas limitadas, cero ruido. Así un coleccionista de verdad encuentra algo antes que el resto.</p>
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

      <section className="como-funciona">
        <div className="wrap">
          <p className="eyebrow">Cómo funciona</p>
          <h2>Cuatro pasos, cero vueltas.</h2>
          <div className="steps-row">
            <div className="step-col"><span className="step-n">01</span><p>Elegimos a mano un grupo reducido de artistas por temporada.</p></div>
            <div className="step-col"><span className="step-n">02</span><p>Cada uno expone hasta tres piezas, con su propia puja mínima.</p></div>
            <div className="step-col"><span className="step-n">03</span><p>Tú pujas y sigues la pieza de cerca durante toda la temporada.</p></div>
            <div className="step-col"><span className="step-n">04</span><p>Al cerrar, quien ofreció más se la lleva. Coordinamos pago y envío por correo.</p></div>
          </div>
        </div>
      </section>

      <section className="para-artistas">
        <Splat width="140px" height="120px" top="-40px" right="5%" color="yellow" rotate={-10} radius="r2" />
        <Splat width="90px" height="80px" bottom="-35px" left="8%" color="lilac" rotate={14} radius="r3" />
        <div className="wrap" style={{ textAlign: 'center' }}>
          <p className="eyebrow">Para artistas</p>
          <h2>Si tu trabajo todavía no es obvio para el mundo, queremos verlo primero.</h2>
          <p className="section-note" style={{ maxWidth: 520, margin: '14px auto 0' }}>Espacio real, no un perfil más perdido entre miles. 75% para ti, 25% para nosotros. Sin costo por postular, sin costo por exponer.</p>
          <Link href="/postular" className="btn-primary" style={{ marginTop: 22, display: 'inline-block' }}>Postula tu trabajo →</Link>
        </div>
      </section>

      <section className="waitlist-section">
        <div className="wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="eyebrow">Última llamada</p>
          <h2 style={{ fontSize: 'clamp(1.8rem,3.4vw,2.6rem)', marginTop: 10 }}>El próximo nombre grande todavía no es obvio.</h2>
          <p className="section-note" style={{ maxWidth: 460 }}>Sumate antes de que esto deje de ser un secreto — te avisamos por correo cuando sumemos artistas nuevos o abramos la próxima temporada.</p>
          <WaitlistForm redirectTo="/" />
        </div>
      </section>

      <Footer />
    </>
  );
}
