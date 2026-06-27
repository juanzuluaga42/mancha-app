import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Countdown from '@/components/Countdown';
import Toast from '@/components/Toast';
import WaitlistForm from '@/components/WaitlistForm';
import WelcomeModal from '@/components/WelcomeModal';
import ScrollReveal from '@/components/ScrollReveal';
import RoleSwitch from '@/components/RoleSwitch';
import { createClient } from '@/utils/supabase/server';
import { isPreLaunch, isConvocatoria, isTemporadaActiva } from '@/lib/fase';
import { articles } from '@/lib/news';

export const metadata = {
  title: 'MANCHA — Para coleccionistas. Arte emergente seleccionado.',
  description: 'Colecciona artistas emergentes seleccionados a mano antes de que el mundo los descubra. Pocos por temporada. Cuando cierra, cierra para siempre.',
};

const LAUNCH_DATE = '2026-09-01T00:00:00-05:00';

export default async function ParaColeccionistasPage({ searchParams }) {
  const params = await searchParams;
  const prelaunch = isPreLaunch();
  const convocatoria = isConvocatoria();
  const temporadaActiva = isTemporadaActiva();

  let season = null;
  let allArtists = [];
  if (temporadaActiva) {
    const supabase = await createClient();
    const { data: s } = await supabase.from('seasons').select('*').eq('is_current', true).maybeSingle();
    season = s;
    const { data: artists } = await supabase
      .from('artists')
      .select('id, display_name, medium, pieces(id, image_url, title, min_bid, bids(amount))')
      .eq('season_id', s?.id ?? '00000000-0000-0000-0000-000000000000')
      .eq('status', 'approved')
      .order('created_at', { ascending: true });
    allArtists = artists ?? [];
  }

  const accentColors = ['var(--red)', 'var(--yellow)', 'var(--lilac)', 'var(--red-deep)', 'var(--yellow-deep)', 'var(--lilac-deep)'];

  return (
    <>
      <WelcomeModal />
      <Nav />
      <ScrollReveal />
      <Toast success={params?.success} error={params?.error} />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="tsr-hero col-hero">
        <div className="wrap tsr-hero-content">
          <p className="tsr-hero-tag">MANCHA · Para coleccionistas · Temporada 01 · 2026</p>
          <h1 className="tsr-title">
            <span className="tsr-tl">Colecciona</span>
            <span className="tsr-tl tsr-tl--em col-em">antes.</span>
          </h1>
          <div className="tsr-hero-cd">
            {(prelaunch || convocatoria) && (
              <Countdown endsAt={LAUNCH_DATE} label="La galería abre en" />
            )}
            {temporadaActiva && season?.ends_at && (
              <Countdown endsAt={season.ends_at} label="La temporada cierra en" />
            )}
          </div>
          <div className="tsr-ctas">
            {temporadaActiva ? (
              <>
                <a href="/obras" className="tsr-cta-primary">Ver el catálogo →</a>
                <a href="/seleccionados" className="tsr-cta-ghost">Los elegidos →</a>
              </>
            ) : (
              <>
                <a href="#aviso" className="tsr-cta-primary">Avisarme cuando abra →</a>
                <a href="/notas" className="tsr-cta-ghost">Leer las notas →</a>
              </>
            )}
          </div>
        </div>
        <div className="tsr-hero-foot">
          <div className="wrap tsr-hero-foot-inner">
            <span>Arte emergente seleccionado a mano · Sin algoritmos</span>
            <span>
              {prelaunch || convocatoria
                ? 'La galería abre el 1 de septiembre'
                : `Temporada en curso — ${season?.name ?? 'Temporada 01'}`}
            </span>
          </div>
        </div>
      </header>

      {/* ── PORQUÉ COLECCIONAR ────────────────────────────── */}
      <section className="tsr-numbers">
        <div className="wrap tsr-numbers-inner">
          <div className="tsr-num-item" data-reveal>
            <b className="tsr-num-dig tsr-num-word">Antes.</b>
            <p className="tsr-num-label">Antes que el mundo</p>
            <p className="tsr-num-note">Elegimos artistas antes de que sean evidentes. Cuando llegas a MANCHA, llegas primero.</p>
          </div>
          <div className="tsr-num-divider" aria-hidden="true" />
          <div className="tsr-num-item" data-reveal data-delay="1">
            <b className="tsr-num-dig">3</b>
            <p className="tsr-num-label">Piezas por artista</p>
            <p className="tsr-num-note">Solo tres piezas por artista. Nada de catálogo infinito. Lo mejor de cada uno, con espacio para verse bien.</p>
          </div>
          <div className="tsr-num-divider" aria-hidden="true" />
          <div className="tsr-num-item" data-reveal data-delay="2">
            <b className="tsr-num-dig tsr-num-word">Cierra.</b>
            <p className="tsr-num-label">Cuando cierra, cierra</p>
            <p className="tsr-num-note">No es un catálogo permanente. Cuando la temporada termina, lo que no se vendió, se fue. Para siempre.</p>
          </div>
        </div>
      </section>

      {/* ── CRITERIO PARA COLECCIONISTAS ─────────────────── */}
      <section className="tsr-manifesto">
        <div className="wrap tsr-manifesto-inner" data-reveal>
          <blockquote className="tsr-manifesto-q">
            "No vendemos arte. Presentamos artistas que alguien creyó primero."
          </blockquote>
          <div className="tsr-manifesto-body">
            <p>La diferencia entre un coleccionista y alguien que compra arte decorativo es el criterio. En MANCHA, el criterio ya está hecho. Revisamos a mano, elegimos pocos, y protegemos la atención del que colecciona.</p>
            <p>Sin algoritmos, sin popularidad, sin número de seguidores. La obra habla primero. Lo que encuentras aquí ya pasó un filtro que la mayoría de los artistas no pasa.</p>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA PARA COLECCIONISTAS ────────────── */}
      <section className="tsr-steps-artistas">
        <div className="wrap">
          <div className="tsr-steps-head" data-reveal>
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="tsr-steps-title">Cuatro pasos,<br /><em>cero vueltas.</em></h2>
          </div>
          <div className="tsr-steps-row">
            {[
              { n: '01', title: 'Exploras.', body: 'Un catálogo pequeño y curado. Pocos artistas, pocas piezas. Lo suficiente para que algo te detenga.' },
              { n: '02', title: 'Pujas.', body: 'Eliges una pieza y pones tu oferta por encima de la puja mínima. Sin costos extra del lado comprador.' },
              { n: '03', title: 'Sigues.', body: 'Si alguien te supera, puedes volver a pujar cuando quieras. La temporada dura tres meses.' },
              { n: '04', title: 'Ganas.', body: 'Si tu puja cierra primera, coordinamos el pago y el envío directamente contigo por correo.' },
            ].map((s, i) => (
              <div className="tsr-step" key={s.n} data-reveal data-delay={String(i)}>
                <span className="tsr-step-n">{s.n}</span>
                <h3 className="tsr-step-title">{s.title}</h3>
                <p className="tsr-step-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTISTAS ACTUALES (solo en temporada activa) ─── */}
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

      {/* ── BLOG ─────────────────────────────────────────── */}
      <section className="tsr-blog">
        <div className="wrap">
          <div className="tsr-blog-head" data-reveal>
            <div>
              <p className="eyebrow">MANCHA Editorial</p>
              <h2 className="tsr-blog-title">Arte, historia, criterio.</h2>
            </div>
            <a href="/notas" className="tsr-blog-all">Todas las notas →</a>
          </div>
          <div className="tsr-blog-grid">
            {articles.slice(0, 3).map((article, i) => (
              <a href={`/notas/${article.slug}`} className="tsr-blog-card" key={article.slug} data-reveal data-delay={String(i)}>
                <div className="tsr-blog-img">
                  {article.image && <img src={article.image} alt={article.imageAlt || article.title} />}
                </div>
                <div className="tsr-blog-info">
                  <p className="tsr-blog-date">{article.date}</p>
                  <h3 className="tsr-blog-card-title">{article.title}</h3>
                  <p className="tsr-blog-excerpt">{article.excerpt}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVISO / WAITLIST ─────────────────────────────── */}
      {!temporadaActiva && (
        <section className="tsr-aviso" id="aviso">
          <div className="wrap tsr-aviso-inner">
            <div className="tsr-aviso-text" data-reveal>
              <p className="eyebrow" style={{ color: 'rgba(250,239,225,0.4)' }}>Para coleccionistas</p>
              <h2 className="tsr-aviso-title">
                Sé el primero en ver<br />la Temporada 01.
              </h2>
              <p className="tsr-aviso-sub">
                La galería abre el 1 de septiembre. Deja tu correo y te avisamos en el momento en que el catálogo esté listo — antes que nadie.
              </p>
            </div>
            <div className="tsr-aviso-form" data-reveal data-delay="1">
              <WaitlistForm redirectTo="/para-coleccionistas" label="Avísame cuando abra →" />
            </div>
          </div>
        </section>
      )}

      {/* ── ROLE SWITCH ──────────────────────────────────── */}
      <div className="role-switch-bar">
        <div className="wrap">
          <RoleSwitch currentRole="coleccionista" />
        </div>
      </div>

      <Footer />
    </>
  );
}
