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
import { isConvocatoria, isTemporadaActiva } from '@/lib/fase';

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

const LAUNCH_DATE = '2026-07-31T00:00:00-05:00';

const tickerItems = [
  'Arte emergente seleccionado a mano',
  'Primero tú, después el mundo',
  'Pocos artistas por temporada',
  'Cuando cierra, cierra para siempre',
  'Sin algoritmos. Solo criterio',
  'Lo que pasa por MANCHA no se quita',
  'El próximo nombre grande aún no es obvio',
  'Tres piezas por artista',
  'Colecciona antes que el resto',
];

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const convocatoria = isConvocatoria();
  const temporadaActiva = isTemporadaActiva();

  let season = null;
  let allArtists = [];
  let cheapestPiece = null;
  let topFavorites = [];

  if (temporadaActiva) {
    const supabase = await createClient();

    const { data: s } = await supabase
      .from('seasons')
      .select('*')
      .eq('is_current', true)
      .maybeSingle();
    season = s;

    const { data: artists } = await supabase
      .from('artists')
      .select('*, pieces(*, bids(amount), favorites(buyer_id))')
      .eq('season_id', season?.id ?? '00000000-0000-0000-0000-000000000000')
      .eq('status', 'approved')
      .order('created_at', { ascending: true });

    allArtists = artists ?? [];

    const allPieces = allArtists.flatMap((a) =>
      (a.pieces ?? []).map((p) => ({ ...p, artistName: a.display_name }))
    );

    topFavorites = [...allPieces]
      .sort((a, b) => (b.favorites?.length ?? 0) - (a.favorites?.length ?? 0))
      .slice(0, 4)
      .filter((p) => (p.favorites?.length ?? 0) > 0);

    const piecesWithPrice = allPieces.map((p) => {
      const bidAmounts = (p.bids ?? []).map((b) => Number(b.amount));
      const currentPrice = bidAmounts.length > 0 ? Math.max(...bidAmounts) : Number(p.min_bid);
      return { ...p, currentPrice, hasBids: bidAmounts.length > 0 };
    });
    cheapestPiece = piecesWithPrice.length > 0
      ? [...piecesWithPrice].sort((a, b) => a.currentPrice - b.currentPrice)[0]
      : null;
  }

  const seasonLabel = season
    ? `${season.name} — ${new Date(season.starts_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} / ${new Date(season.ends_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : convocatoria
      ? 'Convocatoria abierta — Temporada 01'
      : 'Temporada actual';

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

            {convocatoria ? (
              <Countdown endsAt={LAUNCH_DATE} label="Apertura de la Temporada 01" />
            ) : (
              season?.ends_at && <Countdown endsAt={season.ends_at} />
            )}

            <h1 className="hero-title">
              {convocatoria ? (
                <>La Temporada 01<br /><em>está por abrir.</em></>
              ) : (
                <>Primero tú.<br /><em>Después el mundo.</em></>
              )}
            </h1>

            <p className="hero-sub">
              {convocatoria
                ? 'MANCHA abre su primera temporada el 31 de julio. Artistas emergentes seleccionados a mano — tres piezas cada uno, tiempo limitado. La convocatoria para artistas está abierta ahora.'
                : 'Arte emergente seleccionado a mano. Pocos artistas por temporada, tres piezas cada uno. Cuando cierra la temporada, cierra para siempre.'}
            </p>

            <div className="hero-ctas">
              {convocatoria ? (
                <>
                  <a href="/postular" className="btn-primary hero-btn">Postular como artista →</a>
                  <a href="#compradores" className="hp-hero-ghost">¿Quieres coleccionar? →</a>
                </>
              ) : (
                <>
                  <a href="/seleccionados" className="btn-primary hero-btn">Ver los elegidos</a>
                  <a href="/sobre-mancha" className="hp-hero-ghost">¿Qué es MANCHA? →</a>
                </>
              )}
            </div>
          </div>
          <div className="hp-hero-right" aria-hidden="true">
            <span className="hp-hero-num">01</span>
            <span className="hp-hero-tagline">Arte<br />con<br />criterio.</span>
          </div>
        </div>
      </header>

      <Toast success={params?.success} error={params?.error} />

      {/* ── TICKER ───────────────────────────────────────── */}
      <div className="hp-ticker" aria-hidden="true">
        <div className="hp-ticker-track">
          {[...tickerItems, ...tickerItems, ...tickerItems].map((name, i) => (
            <span className="hp-ticker-item" key={i}>
              <span className="hp-ticker-dot">◆</span>{name}
            </span>
          ))}
        </div>
      </div>

      {/* ── CONVOCATORIA: ARTISTAS ───────────────────────── */}
      {convocatoria && (
        <section className="hp-conv-artistas">
          <Splat width="220px" height="195px" top="-60px" right="-50px" color="red" rotate={-10} radius="r2" />
          <Splat width="130px" height="115px" bottom="-40px" left="-35px" color="yellow" rotate={14} radius="r4" />
          <div className="wrap hp-conv-artistas-inner">
            <div className="hp-conv-left">
              <p className="hp-statement-kicker">La convocatoria</p>
              <h2 className="hp-conv-title">
                ¿Tu trabajo<br />
                <em>debería estar aquí?</em>
              </h2>
              <p className="hp-conv-body">
                Elegimos a mano los artistas que van a estar en la Temporada 01.
                Sin métricas, sin popularidad, sin número de seguidores.
                Solo la obra. Si crees que la tuya tiene algo que el resto todavía no vio,
                postúlate antes del 31 de julio.
              </p>
              <div className="hp-conv-ctas">
                <Link href="/postular" className="btn-primary">Postular ahora →</Link>
                <Link href="/sobre-mancha" className="hp-conv-ghost">¿Qué es MANCHA? →</Link>
              </div>
            </div>
            <div className="hp-conv-right">
              <div className="hp-pillar">
                <span className="hp-pillar-n">01</span>
                <h3 className="hp-pillar-title">Selección a mano</h3>
                <p className="hp-pillar-desc">Elegimos cada artista a mano. Sin convocatorias abiertas al azar. Sin votos.</p>
              </div>
              <div className="hp-pillar">
                <span className="hp-pillar-n">02</span>
                <h3 className="hp-pillar-title">Tres piezas por artista</h3>
                <p className="hp-pillar-desc">Solo presentas tres piezas. Nada más, nada menos. La edición es parte del criterio.</p>
              </div>
              <div className="hp-pillar">
                <span className="hp-pillar-n">03</span>
                <h3 className="hp-pillar-title">Sin costo de participación</h3>
                <p className="hp-pillar-desc">Postular es gratis. MANCHA opera con comisión sobre venta, no con cuotas de entrada.</p>
              </div>
              <div className="hp-pillar">
                <span className="hp-pillar-n">04</span>
                <h3 className="hp-pillar-title">Permanente en el registro</h3>
                <p className="hp-pillar-desc">Una vez que entras a MANCHA, quedas en el registro. Para siempre.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ESTO ES MANCHA (solo en temporada activa) ────── */}
      {!convocatoria && (
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
      )}

      {/* ── TEMPORADA ACTUAL (solo si hay artistas) ──────── */}
      {temporadaActiva && allArtists.length > 0 && (
        <section className="hp-season">
          <div className="wrap">
            <div className="hp-season-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--ink-soft)' }}>Temporada en curso</p>
                <h2 className="hp-season-title">{season?.name ?? 'Artistas actuales'}</h2>
              </div>
              <Link href="/seleccionados" className="hp-season-all">Ver todos →</Link>
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

      {/* ── PIEZA DESTACADA (solo en temporada activa) ───── */}
      {temporadaActiva && cheapestPiece && (
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

      {/* ── FAVORITOS (solo en temporada activa) ─────────── */}
      {temporadaActiva && topFavorites.length > 0 && (
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
          {convocatoria ? (
            <>
              <h2 className="hp-steps-title">El proceso,<br /><em>sin misterios.</em></h2>
              <div className="hp-steps-row">
                {[
                  { n: '01', title: 'Postulas', body: 'Completas el formulario con tu trabajo, tu medio y un poco de contexto. Sin cuotas, sin trámites.' },
                  { n: '02', title: 'Revisamos', body: 'Revisamos cada postulación de forma personal. El criterio es la obra, no el follower count.' },
                  { n: '03', title: 'Te avisamos', body: 'Si eres seleccionado, recibes un correo para configurar tu perfil y subir tus tres piezas.' },
                  { n: '04', title: 'Abres la Temporada 01', body: 'El 31 de julio todo se abre. Coleccionistas de todo el mundo pueden pujar por tu obra.' },
                ].map(({ n, title, body }) => (
                  <div className="hp-step" key={n}>
                    <span className="hp-step-n">{n}</span>
                    <h3 className="hp-step-title">{title}</h3>
                    <p className="hp-step-body">{body}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </section>

      {/* ── COMPRADORES: AVÍSAME (solo en convocatoria) ──── */}
      {convocatoria && (
        <section className="hp-compradores" id="compradores">
          {/* manchas grandes de esquina */}
          <Splat width="340px" height="300px" top="-90px" right="-80px" color="red" rotate={-14} radius="r1" />
          <Splat width="260px" height="230px" bottom="-70px" left="-60px" color="yellow" rotate={18} radius="r2" />
          {/* manchas medianas dispersas */}
          <Splat width="180px" height="158px" top="-50px" left="18%" color="red" rotate={10} radius="r3" />
          <Splat width="160px" height="140px" bottom="-40px" right="22%" color="lilac" rotate={-8} radius="r4" />
          <Splat width="140px" height="122px" top="30%" left="-45px" color="yellow" rotate={-20} radius="r1" />
          <Splat width="130px" height="115px" top="15%" right="38%" color="red" rotate={12} radius="r2" />
          <Splat width="120px" height="105px" bottom="10%" left="35%" color="yellow" rotate={-6} radius="r3" />
          {/* manchas pequeñas de textura */}
          <Splat width="80px" height="70px" top="55%" right="8%" color="red" rotate={22} radius="r4" />
          <Splat width="75px" height="66px" top="10%" left="48%" color="yellow" rotate={-16} radius="r1" />
          <Splat width="70px" height="62px" bottom="30%" right="15%" color="red" rotate={8} radius="r2" />
          <Splat width="65px" height="58px" top="68%" left="12%" color="lilac" rotate={-12} radius="r3" />
          <Splat width="55px" height="50px" top="42%" right="42%" color="yellow" rotate={18} radius="r4" />
          <Splat width="50px" height="44px" bottom="5%" left="60%" color="red" rotate={-4} radius="r1" />
          <div className="wrap hp-compradores-inner">
            <div className="hp-compradores-text">
              <p className="eyebrow" style={{ color: 'var(--paper)' }}>Para coleccionistas</p>
              <h2 className="hp-compradores-title">
                ¿Quieres ser<br />
                <em>el primero en ver?</em>
              </h2>
              <p className="hp-compradores-sub">
                La Temporada 01 abre el 31 de julio. Te avisamos cuando el catálogo esté listo
                para que puedas explorar y pujar antes que nadie.
              </p>
            </div>
            <div className="hp-compradores-form">
              <WaitlistForm redirectTo="/" label="Avísame cuando abra →" />
            </div>
          </div>
        </section>
      )}

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
            {convocatoria ? (
              <>
                <Link href="/postular" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                  Postular ahora →
                </Link>
                <Link href="/sobre-mancha" className="hp-perm-ghost">¿Qué es MANCHA? →</Link>
              </>
            ) : (
              <>
                <Link href="/seleccionados" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                  Ver los elegidos
                </Link>
                <Link href="/manifiesto" className="hp-perm-ghost">Leer el manifiesto →</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── LISTA DE ESPERA (solo en temporada activa) ───── */}
      {!convocatoria && (
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
      )}

      <Footer />
    </>
  );
}
