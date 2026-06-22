import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import PaintTrail from '@/components/PaintTrail';
import Countdown from '@/components/Countdown';
import Toast from '@/components/Toast';
import WaitlistForm from '@/components/WaitlistForm';
import HiddenMessage from '@/components/HiddenMessage';

export const metadata = {
  title: 'MANCHA — Arte emergente, antes que el mundo',
  description: 'Descubre y colecciona artistas emergentes antes que el mundo los descubra. Pocos artistas por temporada, piezas limitadas, tiempo real para cada historia.',
  openGraph: {
    title: 'MANCHA — Arte emergente, antes que el mundo',
    description: 'Descubre y colecciona artistas emergentes antes que el mundo los descubra. Pocos artistas por temporada, piezas limitadas, tiempo real para cada historia.',
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

  const heroPieces = allArtists
    .flatMap((a) => a.pieces ?? [])
    .filter((p) => p.image_url)
    .slice(0, 5);

  const allPieces = allArtists.flatMap((a) =>
    (a.pieces ?? []).map((p) => ({ ...p, artistName: a.display_name }))
  );

  const topFavorites = [...allPieces]
    .sort((a, b) => (b.favorites?.length ?? 0) - (a.favorites?.length ?? 0))
    .slice(0, 4)
    .filter((p) => (p.favorites?.length ?? 0) > 0);

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

      {/* ── HERO ─────────────────────────────────────────── */}
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

        <Splat width="110px" height="96px" bottom="120px" right="5%" color="red" rotate={-12} radius="r3" />
        <Splat width="80px" height="70px" top="8%" right="30%" color="yellow" rotate={8} radius="r4" />
        <Splat width="140px" height="120px" top="48%" left="52%" color="lilac" rotate={4} radius="r2" center />
        <Splat width="68px" height="60px" top="64%" left="36%" color="red" rotate={-16} radius="r3" />
        <Splat width="90px" height="80px" bottom="50px" left="42%" color="yellow" rotate={10} radius="r1" />
        <Splat width="56px" height="50px" top="18%" left="8%" color="lilac" rotate={22} radius="r4" />

        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">{seasonLabel}</p>
          {season?.ends_at && <Countdown endsAt={season.ends_at} />}

          <h1 className="hero-title">
            Arte emergente.<br />
            <em>Antes que el mundo.</em>
          </h1>

          <p className="hero-sub">
            Cada temporada elegimos a mano un grupo reducido de artistas emergentes —
            tres piezas cada uno, por tiempo limitado. Lo que ves hoy, mañana ya no está.
          </p>

          <div className="hero-ctas">
            <a href="/artistas" className="btn-primary">Ver temporada actual</a>
            <Link href="/postular" className="hero-ghost-cta">Postular como artista →</Link>
          </div>

          <div className="hero-trust">
            <span>Sin costos ocultos</span>
            <span className="hero-trust-sep">·</span>
            <span>Artistas seleccionados a mano</span>
            <span className="hero-trust-sep">·</span>
            <span>Tiempo limitado</span>
          </div>
        </div>
      </header>

      <Toast success={params?.success} error={params?.error} />

      {/* ── MANIFIESTO STRIP ─────────────────────────────── */}
      <section className="home-manifesto">
        <Splat width="130px" height="110px" top="-52px" left="10%" color="yellow" rotate={12} radius="r1" />
        <Splat width="96px" height="84px" top="-48px" left="58%" color="red" rotate={-6} radius="r3" />
        <Splat width="110px" height="96px" bottom="-52px" left="28%" color="lilac" rotate={-18} radius="r2" />
        <Splat width="84px" height="74px" bottom="-48px" right="14%" color="yellow" rotate={10} radius="r4" />
        <Splat width="60px" height="56px" top="-38px" left="40%" color="red" rotate={18} radius="r4" />
        <div className="wrap home-manifesto-inner">
          <p className="home-manifesto-text">
            El talento emergente se ahoga en feeds infinitos.<br />
            <strong>Nosotros lo sacamos a flote.</strong>
          </p>
          {allArtists.length > 0 && (
            <div className="home-manifesto-stat">
              <b>{allArtists.length}</b>
              <span>artistas<br />esta temporada</span>
            </div>
          )}
        </div>
      </section>

      {/* ── POR QUÉ MANCHA ───────────────────────────────── */}
      {cheapestPiece && (
        <section className="home-why">
          <div className="wrap">
            <p className="eyebrow">Por qué MANCHA</p>
            <h2 className="home-why-title">Porque llegaste antes.</h2>
            <div className="home-why-grid">
              <div className="home-why-item">
                <b>01</b>
                <h3>Sin costos ocultos</h3>
                <p>Pagas exactamente lo que pujaste. La comisión la cubre el artista — sin cargos extra del lado del comprador, sin sorpresas al cerrar.</p>
              </div>
              <div className="home-why-item">
                <b>02</b>
                <h3>Historia real</h3>
                <p>Cada obra llega con el contexto del artista que la hizo: quién es, dónde trabaja, qué la inspiró. No una ficha genérica de catálogo.</p>
              </div>
              <div className="home-why-item">
                <b>03</b>
                <h3>Piezas limitadas</h3>
                <p>Cubrimos pocos artistas, máximo tres piezas por temporada. Lo que ves hoy puede no volver a estar disponible nunca.</p>
              </div>
              <div className="home-why-item">
                <b>04</b>
                <h3>Acceso temprano</h3>
                <p>No hace falta ser coleccionista para empezar. Cada temporada tiene piezas pensadas para quien puja por primera vez.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PIEZA DESTACADA ──────────────────────────────── */}
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
              <h2>La entrada más accesible de la temporada.</h2>
              <p className="cheapest-pick-title">{cheapestPiece.title} — {cheapestPiece.artistName}</p>
              <p className="cheapest-pick-amount">${Number(cheapestPiece.currentPrice).toLocaleString('es-AR')} <span className="cheapest-pick-currency">USD</span></p>
              <p className="section-note">{cheapestPiece.hasBids ? 'Puja líder actual' : 'Puja mínima'} — una buena forma de hacer tu primera puja en MANCHA.</p>
              <Link href={`/obras/${cheapestPiece.id}`} className="btn-primary">Ver esta pieza →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FAVORITOS ────────────────────────────────────── */}
      {topFavorites.length > 0 && (
        <section className="favorites" id="favoritos">
          <Splat width="130px" height="110px" top="-50px" right="8%" color="yellow" rotate={-10} radius="r2" />
          <Splat width="90px" height="80px" bottom="-45px" left="6%" color="lilac" rotate={14} radius="r3" />
          <Splat width="60px" height="60px" top="30%" left="-30px" color="red" rotate={-8} radius="r4" />
          <Splat width="70px" height="60px" bottom="20%" right="-30px" color="lilac" rotate={10} radius="r1" />
          <div className="wrap">
            <p className="eyebrow">Favoritos de la temporada</p>
            <h2 className="home-section-h2">Lo más querido hasta ahora</h2>
            <p className="section-note">El corazón no es la puja — es el pulso de la temporada. Lo que la comunidad más quiere ver.</p>
            <div className="favorites-grid">
              {topFavorites.map((piece, i) => (
                <Link href={`/obras/${piece.id}`} className="fav-card" key={piece.id}>
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
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CÓMO FUNCIONA ────────────────────────────────── */}
      <section className="como-funciona home-steps">
        <div className="wrap">
          <p className="eyebrow">Cómo funciona</p>
          <h2 className="home-section-h2">Cuatro pasos, cero vueltas.</h2>
          <div className="steps-row">
            <div className="step-col">
              <span className="step-n">01</span>
              <h4>Explorar</h4>
              <p>Pocos artistas, piezas únicas, sin scroll infinito — un catálogo hecho para que algo te detenga.</p>
            </div>
            <div className="step-col">
              <span className="step-n">02</span>
              <h4>Pujar</h4>
              <p>Eliges una pieza y pujas el monto que quieres ofrecer, por encima de la puja mínima. Sin registro previo obligatorio.</p>
            </div>
            <div className="step-col">
              <span className="step-n">03</span>
              <h4>Seguir</h4>
              <p>Sigues la puja de cerca — si alguien te supera, puedes volver a pujar en cualquier momento de la temporada.</p>
            </div>
            <div className="step-col">
              <span className="step-n">04</span>
              <h4>Ganar</h4>
              <p>Si tu puja cierra primera, te contactamos por correo para coordinar el pago y el envío directo con el artista.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARA ARTISTAS ────────────────────────────────── */}
      <section className="para-artistas">
        <Splat width="150px" height="130px" top="-45px" right="4%" color="yellow" rotate={-10} radius="r2" />
        <Splat width="100px" height="88px" bottom="-38px" left="7%" color="lilac" rotate={14} radius="r3" />
        <Splat width="70px" height="62px" top="42%" left="-28px" color="red" rotate={8} radius="r1" />
        <div className="wrap para-artistas-inner">
          <div className="para-artistas-copy">
            <p className="eyebrow">Para artistas</p>
            <h2>Si tu trabajo todavía no es obvio para el mundo, queremos verlo primero.</h2>
            <p className="section-note" style={{ color: 'rgba(250,247,240,0.7)', marginTop: 16 }}>
              Espacio real, no un perfil más perdido entre miles. Sin costo por postular, sin costo por exponer.
            </p>
            <Link href="/postular" className="btn-primary para-artistas-btn">Postula tu trabajo →</Link>
          </div>
          <div className="para-artistas-stats">
            <div className="pa-stat">
              <b>75%</b>
              <span>para el artista<br />en cada venta</span>
            </div>
            <div className="pa-stat-sep" />
            <div className="pa-stat">
              <b>$0</b>
              <span>costo de entrada —<br />ni por postular</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── LISTA DE ESPERA ──────────────────────────────── */}
      <section className="waitlist-section">
        <Splat width="100px" height="88px" top="-40px" right="12%" color="red" rotate={-8} radius="r3" />
        <Splat width="75px" height="66px" bottom="-32px" left="9%" color="lilac" rotate={12} radius="r2" />
        <div className="wrap waitlist-inner">
          <p className="eyebrow">Antes de que cierre</p>
          <h2 className="home-section-h2">El próximo nombre grande todavía no es obvio.</h2>
          <p className="section-note" style={{ maxWidth: 480, margin: '14px auto 0' }}>
            Entra antes de que esto deje de ser un secreto — te avisamos cuando sumemos artistas nuevos o abramos la próxima temporada.
          </p>
          <WaitlistForm redirectTo="/" />
        </div>
      </section>

      <HiddenMessage />
      <Footer />
    </>
  );
}
