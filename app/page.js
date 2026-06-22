import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import PaintTrail from '@/components/PaintTrail';
import Countdown from '@/components/Countdown';
import Toast from '@/components/Toast';
import WaitlistForm from '@/components/WaitlistForm';
import WelcomeModal from '@/components/WelcomeModal';

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

  const tickerItems = allArtists.length > 0
    ? allArtists.map((a) => a.display_name)
    : ['Arte emergente', 'Seleccionado a mano', 'Temporada limitada', 'Colecciona ahora', 'Antes que el mundo'];

  return (
    <>
      <WelcomeModal />
      <Nav />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="hero hero-dark" id="hero">
        <PaintTrail />
        <Splat width="320px" height="280px" top="-80px" right="-60px" color="yellow" rotate={-8} radius="r1" />
        <Splat width="200px" height="180px" bottom="-60px" left="-50px" color="lilac" rotate={14} radius="r2" />
        <Splat width="120px" height="105px" top="42%" right="5%" color="red" rotate={-12} radius="r3" />
        <Splat width="70px" height="62px" top="20%" left="12%" color="red" rotate={20} radius="r4" />
        <Splat width="80px" height="72px" bottom="18%" right="18%" color="lilac" rotate={6} radius="r1" />

        <div className="hero-content hp-hero-content">
          <div className="hp-hero-left">
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
              <a href="/sobre-mancha" className="hp-hero-ghost">¿Qué es MANCHA? →</a>
            </div>
          </div>
          <div className="hp-hero-right" aria-hidden="true">
            <span className="hp-hero-num">01</span>
            <span className="hp-hero-tagline">Arte<br />de antes<br />que sea<br />obvio.</span>
          </div>
        </div>
      </header>

      <Toast success={params?.success} error={params?.error} />

      {/* ── TICKER ARTISTAS ──────────────────────────────── */}
      <div className="hp-ticker" aria-hidden="true">
        <div className="hp-ticker-track">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((name, i) => (
            <span className="hp-ticker-item" key={i}>
              <span className="hp-ticker-dot">◆</span>{name}
            </span>
          ))}
        </div>
      </div>

      {/* ── ESTO ES MANCHA ───────────────────────────────── */}
      <section className="hp-statement">
        <Splat width="220px" height="195px" top="-60px" right="-50px" color="red" rotate={-10} radius="r2" />
        <Splat width="130px" height="115px" bottom="-40px" left="-35px" color="yellow" rotate={14} radius="r4" />
        <div className="wrap hp-statement-inner">
          <div className="hp-statement-left">
            <p className="hp-statement-kicker">El criterio</p>
            <blockquote className="hp-statement-quote">
              "No exponemos arte.<br />
              Elegimos artistas."
            </blockquote>
            <p className="hp-statement-body">
              Cada temporada, un comité selecciona a mano un número reducido de artistas emergentes.
              No hay algoritmos, no hay popularidad, no hay seguidores.
              Solo obra, criterio, y la convicción de que algo aquí importará.
            </p>
            <Link href="/sobre-mancha" className="hp-statement-link">Conocer el criterio →</Link>
          </div>
          <div className="hp-statement-right">
            <div className="hp-pillar">
              <span className="hp-pillar-n">01</span>
              <h3 className="hp-pillar-title">Sin costos ocultos</h3>
              <p className="hp-pillar-desc">Pagas exactamente lo que pujaste. Sin cargos extra del lado comprador.</p>
            </div>
            <div className="hp-pillar">
              <span className="hp-pillar-n">02</span>
              <h3 className="hp-pillar-title">Historia real</h3>
              <p className="hp-pillar-desc">Cada pieza llega con el contexto del artista: quién es, dónde trabaja, qué la inspiró.</p>
            </div>
            <div className="hp-pillar">
              <span className="hp-pillar-n">03</span>
              <h3 className="hp-pillar-title">Temporada cerrada</h3>
              <p className="hp-pillar-desc">Máximo tres piezas por artista. Cuando cierra, cierra para siempre.</p>
            </div>
            <div className="hp-pillar">
              <span className="hp-pillar-n">04</span>
              <h3 className="hp-pillar-title">Tu primera vez</h3>
              <p className="hp-pillar-desc">No hace falta ser coleccionista para empezar. Hay piezas para quien puja por primera vez.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEMPORADA ACTUAL ─────────────────────────────── */}
      {allArtists.length > 0 && (
        <section className="hp-season">
          <div className="wrap">
            <div className="hp-season-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--ink-soft)' }}>Temporada en curso</p>
                <h2 className="hp-season-title">{season?.name ?? 'Artistas actuales'}</h2>
              </div>
              <Link href="/artistas" className="hp-season-all">Ver todos →</Link>
            </div>
            <div className="hp-season-grid">
              {allArtists.slice(0, 6).map((artist, i) => {
                const firstPiece = (artist.pieces ?? [])[0];
                const accentColors = ['var(--red)', 'var(--yellow)', 'var(--lilac)', 'var(--red-deep)', 'var(--yellow-deep)', 'var(--lilac-deep)'];
                return (
                  <Link href={`/artistas/${artist.id}`} className="hp-artist-card" key={artist.id}>
                    <div className="hp-artist-media" style={{ background: accentColors[i % accentColors.length] }}>
                      {firstPiece?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firstPiece.image_url} alt={firstPiece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="hp-artist-initials">
                          {artist.display_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                        </span>
                      )}
                      <span className="hp-artist-overlay">
                        <span className="hp-artist-n">{String(i + 1).padStart(2, '0')}</span>
                      </span>
                    </div>
                    <div className="hp-artist-info">
                      <h3 className="hp-artist-name">{artist.display_name}</h3>
                      <p className="hp-artist-meta">{(artist.pieces ?? []).length} {(artist.pieces ?? []).length === 1 ? 'pieza' : 'piezas'} disponibles</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── PIEZA DESTACADA ──────────────────────────────── */}
      {cheapestPiece && (
        <section className="hp-entry">
          <div className="wrap hp-entry-inner">
            <div className="hp-entry-art">
              {cheapestPiece.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cheapestPiece.image_url} alt={cheapestPiece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'var(--lilac)' }} />
              )}
              <div className="hp-entry-art-label">
                <span>Para empezar</span>
              </div>
            </div>
            <div className="hp-entry-info">
              <p className="eyebrow" style={{ color: 'var(--ink-soft)' }}>La entrada más accesible</p>
              <h2 className="hp-entry-title">{cheapestPiece.title}</h2>
              <p className="hp-entry-artist">{cheapestPiece.artistName}</p>
              <p className="hp-entry-amount">
                <span className="hp-entry-currency">USD</span>
                {Number(cheapestPiece.currentPrice).toLocaleString('es-AR')}
              </p>
              <p className="hp-entry-note">
                {cheapestPiece.hasBids ? 'Puja líder actual' : 'Puja mínima'} — una buena forma de hacer tu primera puja en MANCHA.
              </p>
              <Link href={`/obras/${cheapestPiece.id}`} className="btn-primary">Ver esta pieza →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FAVORITOS ────────────────────────────────────── */}
      {topFavorites.length > 0 && (
        <section className="hp-favs" id="favoritos">
          <Splat width="130px" height="110px" top="-50px" right="8%" color="yellow" rotate={-10} radius="r2" />
          <Splat width="90px" height="80px" bottom="-45px" left="6%" color="lilac" rotate={14} radius="r3" />
          <div className="wrap">
            <div className="hp-favs-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--ink-soft)' }}>Favoritos de la temporada</p>
                <h2 className="hp-favs-title">Lo que la comunidad<br />más quiere.</h2>
              </div>
              <p className="hp-favs-note">El corazón no es la puja.<br />Es el pulso de la temporada.</p>
            </div>
            <div className="hp-favs-grid">
              {topFavorites.map((piece, i) => (
                <Link href={`/obras/${piece.id}`} className="hp-fav-card" key={piece.id}>
                  <div className="hp-fav-art">
                    {piece.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={piece.image_url} alt={piece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div className={`g${(i % 12) + 1}`} style={{ position: 'absolute', inset: 0 }} />
                    )}
                    <span className="hp-fav-heart">
                      <svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 21s-7.2-4.35-9.3-8.7C1 9 2.4 5.4 6 5.4c2 0 3.4 1.2 4.4 2.6 1-1.4 2.4-2.6 4.4-2.6 3.6 0 5 3.6 3.3 6.9C19.2 16.65 12 21 12 21z" fill="currentColor" /></svg>
                      {piece.favorites?.length ?? 0}
                    </span>
                  </div>
                  <div className="hp-fav-info">
                    <p className="hp-fav-title">{piece.title}</p>
                    <p className="hp-fav-artist">{piece.artistName}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CÓMO FUNCIONA ────────────────────────────────── */}
      <section className="hp-steps">
        <div className="wrap">
          <p className="eyebrow" style={{ textAlign: 'center', color: 'var(--ink-soft)' }}>Cómo funciona</p>
          <h2 className="hp-steps-title">Cuatro pasos,<br /><em>cero vueltas.</em></h2>
          <div className="hp-steps-row">
            {[
              { n: '01', title: 'Explorar', body: 'Pocos artistas, piezas únicas, sin scroll infinito — un catálogo hecho para que algo te detenga.' },
              { n: '02', title: 'Pujar', body: 'Eliges una pieza y pujas el monto que quieres ofrecer, por encima de la puja mínima.' },
              { n: '03', title: 'Seguir', body: 'Sigues de cerca — si alguien te supera, puedes volver a pujar en cualquier momento.' },
              { n: '04', title: 'Ganar', body: 'Si tu puja cierra primera, coordinamos el pago y el envío directamente contigo por correo.' },
            ].map(({ n, title, body }) => (
              <div className="hp-step" key={n}>
                <span className="hp-step-n">{n}</span>
                <h3 className="hp-step-title">{title}</h3>
                <p className="hp-step-body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERMANENCIA ──────────────────────────────────── */}
      <section className="hp-permanencia">
        <Splat width="260px" height="230px" top="-65px" left="-55px" color="red" rotate={12} radius="r2" />
        <Splat width="160px" height="140px" bottom="-45px" right="-40px" color="yellow" rotate={-10} radius="r3" />
        <Splat width="100px" height="88px" top="55%" right="12%" color="lilac" rotate={18} radius="r1" />
        <div className="wrap hp-permanencia-inner">
          <p className="hp-perm-kicker">Una marca.</p>
          <h2 className="hp-perm-title">
            Lo que pasa<br />
            por MANCHA<br />
            <em>no se quita.</em>
          </h2>
          <p className="hp-perm-body">
            No somos una galería más. Somos el registro de artistas que alguien creyó antes
            que el mundo los descubriera. Cada pieza que circula por aquí lleva una historia
            que no se borra. Eso es lo que coleccionas: el criterio de haber llegado primero.
          </p>
          <div className="hp-perm-ctas">
            <Link href="/artistas" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
              Ver la temporada actual
            </Link>
            <Link href="/manifiesto" className="hp-perm-ghost">Leer el manifiesto →</Link>
          </div>
        </div>
      </section>

      {/* ── LISTA DE ESPERA ──────────────────────────────── */}
      <section className="waitlist-section">
        <Splat width="100px" height="88px" top="-40px" right="12%" color="red" rotate={-8} radius="r3" />
        <Splat width="75px" height="66px" bottom="-32px" left="9%" color="lilac" rotate={12} radius="r2" />
        <div className="wrap waitlist-inner">
          <p className="eyebrow">Antes de que cierre</p>
          <h2 className="home-section-h2">El próximo nombre grande<br />todavía no es obvio.</h2>
          <p className="section-note" style={{ maxWidth: 480, margin: '14px auto 0' }}>
            Te avisamos cuando sumemos artistas nuevos o abramos la próxima temporada.
          </p>
          <WaitlistForm redirectTo="/" />
        </div>
      </section>

      <Footer />
    </>
  );
}
