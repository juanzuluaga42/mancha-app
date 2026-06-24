import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
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
  title: 'MANCHA — Para artistas. Solicitar acceso.',
  description: 'Elegimos artistas emergentes a mano. Sin métricas, sin seguidores. Solo la obra. Postula a la Temporada 01.',
};

const CONV_OPEN_DATE = '2026-07-01T00:00:00-05:00';
const LAUNCH_DATE    = '2026-07-31T00:00:00-05:00';

export default async function ParaArtistasPage({ searchParams }) {
  const params = await searchParams;
  const prelaunch = isPreLaunch();
  const convocatoria = isConvocatoria();
  const temporadaActiva = isTemporadaActiva();

  let artistCount = null;
  let season = null;
  if (!prelaunch) {
    const supabase = await createClient();
    const { count } = await supabase.from('artists').select('id', { count: 'exact', head: true }).eq('status', 'approved');
    artistCount = count;
    if (temporadaActiva) {
      const { data: s } = await supabase.from('seasons').select('*').eq('is_current', true).maybeSingle();
      season = s;
    }
  }

  return (
    <>
      <WelcomeModal />
      <Nav />
      <ScrollReveal />
      <Toast success={params?.success} error={params?.error} />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="tsr-hero">
        <div className="wrap tsr-hero-content">
          <p className="tsr-hero-tag">MANCHA · Para artistas · Temporada 01 · 2026</p>
          <h1 className="tsr-title">
            {convocatoria ? (
              <>
                <span className="tsr-tl">No buscamos</span>
                <span className="tsr-tl tsr-tl--em">artistas.</span>
              </>
            ) : (
              <>
                <span className="tsr-tl">Elegimos</span>
                <span className="tsr-tl tsr-tl--em">antes.</span>
              </>
            )}
          </h1>
          <div className="tsr-hero-cd">
            {prelaunch && <Countdown endsAt={CONV_OPEN_DATE} label="La convocatoria abre en" />}
            {convocatoria && <Countdown endsAt={LAUNCH_DATE} label="Cierra la convocatoria en" />}
            {temporadaActiva && season?.ends_at && <Countdown endsAt={season.ends_at} label="La temporada cierra en" />}
          </div>
          <div className="tsr-ctas">
            {prelaunch ? (
              <>
                <a href="/registro" className="tsr-cta-primary">Avisarme cuando abra</a>
                <a href="/notas" className="tsr-cta-ghost">Leer las notas →</a>
              </>
            ) : convocatoria ? (
              <>
                <a href="/postular" className="tsr-cta-primary">Solicitar acceso →</a>
                <a href="/criterio" className="tsr-cta-ghost">Leer el criterio →</a>
              </>
            ) : (
              <>
                <a href="/postular" className="tsr-cta-primary">Solicitar acceso →</a>
                <a href="/sobre-mancha" className="tsr-cta-ghost">La institución →</a>
              </>
            )}
          </div>
        </div>
        <div className="tsr-hero-foot">
          <div className="wrap tsr-hero-foot-inner">
            <span>Institución de descubrimiento artístico · Est. 2026</span>
            <span>
              {prelaunch
                ? 'La convocatoria abre el 1 de julio'
                : convocatoria
                  ? 'La Temporada 01 abre el 31 de julio'
                  : 'Temporada 01 en curso'}
            </span>
          </div>
        </div>
      </header>

      {/* ── NÚMEROS ──────────────────────────────────────── */}
      <section className="tsr-numbers">
        <div className="wrap tsr-numbers-inner">
          <div className="tsr-num-item" data-reveal>
            <b className="tsr-num-dig tsr-num-word">Pocos.</b>
            <p className="tsr-num-label">Artistas por temporada</p>
            <p className="tsr-num-note">No un catálogo abierto. Una selección hecha a mano, temporada por temporada.</p>
          </div>
          <div className="tsr-num-divider" aria-hidden="true" />
          <div className="tsr-num-item" data-reveal data-delay="1">
            <b className="tsr-num-dig">3</b>
            <p className="tsr-num-label">Piezas por artista</p>
            <p className="tsr-num-note">Lo mejor que tienen. Sin relleno. Sin obra de catálogo.</p>
          </div>
          <div className="tsr-num-divider" aria-hidden="true" />
          <div className="tsr-num-item" data-reveal data-delay="2">
            <b className="tsr-num-dig">75%</b>
            <p className="tsr-num-label">Para el artista</p>
            <p className="tsr-num-note">De cada venta. Sin costo por solicitar ni por exponer. Solo cobramos si hay venta.</p>
          </div>
        </div>
      </section>

      {/* ── MANIFIESTO ───────────────────────────────────── */}
      <section className="tsr-manifesto">
        <div className="wrap tsr-manifesto-inner" data-reveal>
          <blockquote className="tsr-manifesto-q">
            "El arte emergente no muere por falta de talento. Muere en el ruido."
          </blockquote>
          <div className="tsr-manifesto-body">
            <p>En ferias donde cientos de obras compiten por una mirada de tres segundos. En perfiles que se pierden en el scroll. En portafolios que nadie abre.</p>
            <p>MANCHA es la respuesta institucional a ese problema. Pocos artistas por temporada — los que elegimos, no los que alcanzaron a anotarse. Cada uno expone exactamente tres piezas. Esa restricción obliga a mostrar lo mejor.</p>
            <a href="/sobre-mancha" className="tsr-manifesto-link">La institución →</a>
          </div>
        </div>
      </section>

      {/* ── STATEMENT ────────────────────────────────────── */}
      <div className="tsr-statement">
        <div className="wrap tsr-statement-inner" data-reveal>
          <p className="tsr-statement-line">No miramos tus seguidores.</p>
          <p className="tsr-statement-line tsr-statement-line--muted">Miramos tu obra.</p>
          <p className="tsr-statement-sub">
            <a href="/criterio">Leer el criterio completo →</a>
          </p>
        </div>
      </div>

      {/* ── PASOS PARA ARTISTAS ───────────────────────────── */}
      <section className="tsr-steps-artistas">
        <div className="wrap">
          <div className="tsr-steps-head" data-reveal>
            <p className="eyebrow">El proceso</p>
            <h2 className="tsr-steps-title">Así funciona.<br /><em>Sin misterios.</em></h2>
          </div>
          <div className="tsr-steps-row">
            {[
              { n: '01', title: 'Envías tu trabajo.', body: 'Sin CV de galerías, sin portfolio perfectamente armado. Solo lo que has hecho, dicho en tus palabras.' },
              { n: '02', title: 'Lo revisamos.', body: 'Una persona, no un algoritmo. Si tu trabajo entra, te escribimos directamente con los próximos pasos.' },
              { n: '03', title: 'Expones tres piezas.', body: 'Tu propio espacio durante toda la temporada. Los coleccionistas pujan en vivo, sin intermediarios.' },
              { n: '04', title: 'Cobras el 75%.', body: 'De cada venta, directo a ti. MANCHA coordina el resto: envío, comunicación, logística.' },
            ].map((s, i) => (
              <div className="tsr-step" key={s.n} data-reveal data-delay={String(i)}>
                <span className="tsr-step-n">{s.n}</span>
                <h3 className="tsr-step-title">{s.title}</h3>
                <p className="tsr-step-body">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="tsr-steps-cta" data-reveal>
            {prelaunch
              ? <a href="/registro" className="tsr-cta-primary" style={{ display: 'inline-block' }}>Avisarme cuando abra la convocatoria →</a>
              : <a href="/postular" className="tsr-cta-primary" style={{ display: 'inline-block' }}>Solicitar acceso →</a>
            }
          </div>
        </div>
      </section>

      {/* ── BLOG ─────────────────────────────────────────── */}
      <section className="tsr-blog">
        <div className="wrap">
          <div className="tsr-blog-head" data-reveal>
            <div>
              <p className="eyebrow">MANCHA Editorial</p>
              <h2 className="tsr-blog-title">Lo que pensamos sobre el arte.</h2>
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

      {/* ── WAITLIST (pre-launch) / CTA (convocatoria) ───── */}
      <section className="tsr-aviso" id="compradores">
        <div className="wrap tsr-aviso-inner">
          <div className="tsr-aviso-text" data-reveal>
            <p className="eyebrow" style={{ color: 'rgba(250,239,225,0.4)' }}>
              {prelaunch ? 'Convocatoria · Pronto' : 'La institución'}
            </p>
            <h2 className="tsr-aviso-title">
              {prelaunch
                ? <>La convocatoria<br />abre el 1 de julio.</>
                : convocatoria
                  ? <>Solicitar acceso<br />antes del 31 de julio.</>
                  : <>Forma parte<br />del registro.</>
              }
            </h2>
            <p className="tsr-aviso-sub">
              {prelaunch
                ? 'Deja tu correo y te avisamos en el momento exacto en que la convocatoria abra.'
                : convocatoria
                  ? 'La convocatoria cierra el 31 de julio. La Temporada 01 abre ese mismo día.'
                  : 'Una vez que entras a MANCHA, quedas en el registro para siempre.'}
            </p>
          </div>
          <div className="tsr-aviso-form" data-reveal data-delay="1">
            {prelaunch
              ? <WaitlistForm redirectTo="/para-artistas" label="Avisarme cuando abra →" />
              : <div className="tsr-aviso-cta-wrap">
                  <a href="/postular" className="tsr-cta-primary">Solicitar acceso →</a>
                  <a href="/criterio" className="tsr-cta-ghost" style={{ marginTop: 16, display: 'block' }}>Leer el criterio →</a>
                </div>
            }
          </div>
        </div>
      </section>

      {/* ── ROLE SWITCH ──────────────────────────────────── */}
      <div className="role-switch-bar">
        <div className="wrap">
          <RoleSwitch currentRole="artista" />
        </div>
      </div>

      <Footer />
    </>
  );
}
