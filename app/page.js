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
  title: 'MANCHA — Primero tú. Después el mundo.',
  description: 'Colecciona artistas emergentes seleccionados a mano antes de que el mundo los descubra. Pocos artistas por temporada, tres piezas cada uno, tiempo limitado.',
  openGraph: {
    title: 'MANCHA — Primero tú. Después el mundo.',
    description: 'Colecciona artistas emergentes seleccionados a mano antes de que el mundo los descubra. Pocos artistas por temporada, tres piezas cada uno, tiempo limitado.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
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
      <header className="hero hero-dark" id="hero">
        <PaintTrail />

        <Splat width="320px" height="280px" top="-80px" right="-60px" color="yellow" rotate={-8} radius="r1" />
        <Splat width="200px" height="180px" bottom="-60px" left="-50px" color="lilac" rotate={14} radius="r2" />
        <Splat width="120px" height="105px" top="42%" right="5%" color="red" rotate={-12} radius="r3" />
        <Splat width="70px" height="62px" top="20%" left="12%" color="red" rotate={20} radius="r4" />
        <Splat width="80px" height="72px" bottom="18%" right="18%" color="lilac" rotate={6} radius="r1" />

        <div className="hero-content">
          <p className="eyebrow hero-eyebrow">{seasonLabel}</p>
          {season?.ends_at && <Countdown endsAt={season.ends_at} />}

          <h1 className="hero-title">
            Primero tú.<br />
            <em>Después el mundo.</em>
          </h1>

          <p className="hero-sub">
            Arte emergente seleccionado a mano.
            Pocos artistas por temporada, tres piezas cada uno.
            Cuando cierra la temporada, cierra para siempre.
          </p>

          <div className="hero-ctas">
            <a href="/artistas" className="btn-primary hero-btn">Ver temporada actual</a>
          </div>
        </div>
      </header>

      <Toast success={params?.success} error={params?.error} />

      {/* ── STRIP DE TENSIÓN ─────────────────────────────── */}
      <section className="home-tension">
        <div className="wrap home-tension-inner">
          <div className="home-tension-item">
            <b>Pocos.</b>
            <span>artistas por temporada</span>
          </div>
          <div className="home-tension-div" />
          <div className="home-tension-item">
            <b>3</b>
            <span>piezas por artista</span>
          </div>
          <div className="home-tension-div" />
          <div className="home-tension-item">
            <b>3</b>
            <span>meses de temporada</span>
          </div>
          <div className="home-tension-div" />
          <div className="home-tension-item home-tension-cta">
            <span>Cuando cierra, se fue.</span>
            <a href="/artistas">Ver ahora →</a>
          </div>
        </div>
      </section>

      {/* ── POR QUÉ MANCHA ───────────────────────────────── */}
      <section className="home-why">
        <div className="wrap">
          <p className="eyebrow">Por qué MANCHA</p>
          <h2 className="home-why-title">Arte emergente.<br />Elegido a mano.</h2>
          <div className="home-why-grid">
            <div className="home-why-item">
              <b>01</b>
              <h3>Sin costos ocultos</h3>
              <p>Pagas exactamente lo que pujaste. No hay cargos extra del lado del comprador — ni al pujar, ni al cerrar la venta.</p>
            </div>
            <div className="home-why-item">
              <b>02</b>
              <h3>Historia real</h3>
              <p>Cada pieza llega con el contexto del artista que la hizo: quién es, dónde trabaja, qué la inspiró. No una ficha genérica de catálogo.</p>
            </div>
            <div className="home-why-item">
              <b>03</b>
              <h3>Temporada cerrada</h3>
              <p>Pocos artistas, máximo tres piezas cada uno. Cuando cierra la temporada, cierra para siempre.</p>
            </div>
            <div className="home-why-item">
              <b>04</b>
              <h3>Tu primera vez</h3>
              <p>No hace falta ser coleccionista para empezar. Cada temporada tiene piezas pensadas para quien puja por primera vez.</p>
            </div>
          </div>
        </div>
      </section>

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
              <p className="cheapest-pick-amount">
                ${Number(cheapestPiece.currentPrice).toLocaleString('es-AR')}
                <span className="cheapest-pick-currency"> USD</span>
              </p>
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
              <p>Eliges una pieza y pujas el monto que quieres ofrecer, por encima de la puja mínima.</p>
            </div>
            <div className="step-col">
              <span className="step-n">03</span>
              <h4>Seguir</h4>
              <p>Sigues de cerca — si alguien te supera, puedes volver a pujar en cualquier momento de la temporada.</p>
            </div>
            <div className="step-col">
              <span className="step-n">04</span>
              <h4>Ganar</h4>
              <p>Si tu puja cierra primera, coordinamos el pago y el envío directamente contigo por correo.</p>
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
            Te avisamos cuando sumemos artistas nuevos o abramos la próxima temporada.
          </p>
          <WaitlistForm redirectTo="/" />
        </div>
      </section>

      <HiddenMessage />
      <Footer />
    </>
  );
}
