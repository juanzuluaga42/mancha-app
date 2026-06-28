import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import BlogImg from '@/components/BlogImg';
import { getArticles } from '@/lib/news';
import { getAtlas } from '@/lib/atlas';

export const metadata = {
  title: 'MANCHA — Lo que pensamos sobre el arte.',
  description: 'MANCHA Editorial: los 20 artistas más influyentes, los cuadros más caros, los grandes museos y lo que el arte dice sobre el mundo.',
  openGraph: {
    title: 'MANCHA — Lo que pensamos sobre el arte.',
    description: 'MANCHA Editorial: arte, historia, criterio. Sin algoritmos editoriales.',
    type: 'website',
  },
};

export default async function NotasPage() {
  const t = await getTranslations('notasPage');
  const locale = await getLocale();
  const articles = getArticles(locale);
  const { datosTicker, datosCuriosos, artistas, cuadrosCaros, museos, premios, movimientos } = getAtlas(locale);
  const [lead, ...rest] = articles;

  return (
    <>
      <Nav />
      <ScrollReveal />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="atlas-hero">
        <div className="wrap atlas-hero-inner">
          <p className="eyebrow atlas-hero-eyebrow">{t('heroKicker')}</p>
          <h1 className="atlas-hero-title">
            {t('heroTitle1')}<br />
            <em>{t('heroTitleEm')}</em>
          </h1>
          <p className="atlas-hero-sub">{t('heroSub')}</p>
          <div className="atlas-hero-jump">
            <a href="#lecturas">{t('jumpLecturas')}</a>
            <a href="#artistas">{t('jumpArtistas')}</a>
            <a href="#caros">{t('jumpCaros')}</a>
            <a href="#museos">{t('jumpMuseos')}</a>
            <a href="#premios">{t('jumpPremios')}</a>
          </div>
        </div>
      </header>

      {/* ── TICKER DATOS ─────────────────────────────────── */}
      <div className="atlas-ticker" aria-hidden="true">
        <div className="atlas-ticker-track">
          {[...datosTicker, ...datosTicker].map((d, i) => (
            <span className="atlas-ticker-item" key={i}>
              <span className="atlas-ticker-dot">●</span>{d}
            </span>
          ))}
        </div>
      </div>

      {/* ── LÍNEA DE TIEMPO ──────────────────────────────── */}
      <section className="atlas-timeline">
        <div className="wrap">
          <p className="atlas-section-kicker">{t('timelineKicker')}</p>
          <div className="atlas-timeline-track">
            {movimientos.map((m, i) => (
              <div className="atlas-tl-node" key={i}>
                <span className="atlas-tl-dot" style={{ background: m.color }} />
                <span className="atlas-tl-ano">{m.ano}</span>
                <span className="atlas-tl-nombre">{m.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LECTURAS (artículos) ─────────────────────────── */}
      <section className="atlas-lecturas" id="lecturas">
        <div className="wrap">
          <div className="atlas-section-head">
            <h2 className="atlas-section-title">{t('lecturasTitle')}</h2>
            <p className="atlas-section-desc">{t('lecturasDesc')}</p>
          </div>

          {/* Artículo destacado */}
          <Link href={`/notas/${lead.slug}`} className="atlas-lead">
            <div className="atlas-lead-media">
              <BlogImg src={lead.image} alt={lead.imageAlt} color="var(--ink)" />
            </div>
            <div className="atlas-lead-body">
              <p className="atlas-lead-date">{lead.date} · {t('featured')}</p>
              <h3 className="atlas-lead-title">{lead.title}</h3>
              <p className="atlas-lead-excerpt">{lead.excerpt}</p>
              <span className="atlas-lead-cta">{t('readFull')}</span>
            </div>
          </Link>

          {/* Resto */}
          <div className="atlas-lecturas-grid">
            {rest.map((a) => (
              <Link href={`/notas/${a.slug}`} className="atlas-art-card" key={a.slug}>
                <div className="atlas-art-media">
                  <BlogImg src={a.image} alt={a.imageAlt} color="var(--paper-dark)" />
                </div>
                <p className="atlas-art-date">{a.date}</p>
                <h3 className="atlas-art-title">{a.title}</h3>
                <p className="atlas-art-excerpt">{a.excerpt}</p>
                <span className="atlas-art-cta">{t('readShort')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 20 ARTISTAS ──────────────────────────────────── */}
      <section className="atlas-artistas" id="artistas">
        <div className="wrap">
          <div className="atlas-section-head atlas-section-head-dark">
            <h2 className="atlas-section-title">{t('artistasTitle')}</h2>
            <p className="atlas-section-desc">{t('artistasDesc')}</p>
          </div>
          <div className="atlas-artistas-list">
            {artistas.map((a) => (
              <div className="atlas-artista" key={a.n}>
                <span className="atlas-artista-n">{String(a.n).padStart(2, '0')}</span>
                <div className="atlas-artista-main">
                  <h3 className="atlas-artista-nombre">{a.nombre}</h3>
                  <p className="atlas-artista-meta">
                    <span style={{ color: a.color === 'var(--ink)' ? 'var(--yellow)' : a.color }}>{a.mov}</span>
                    <span className="atlas-artista-sep">·</span>{a.pais}
                    <span className="atlas-artista-sep">·</span>{a.anos}
                  </p>
                  <p className="atlas-artista-desc">{a.desc}</p>
                </div>
                <div className="atlas-artista-media">
                  <BlogImg src={a.img} alt={`${a.nombre} — ${a.obra}`} color={a.color} initials={a.nombre.split(' ').map((w) => w[0]).slice(0, 2).join('')} />
                  <span className="atlas-artista-obra">{a.obra}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUADROS MÁS CAROS ────────────────────────────── */}
      <section className="atlas-caros" id="caros">
        <div className="wrap">
          <div className="atlas-section-head">
            <h2 className="atlas-section-title">{t('carosTitle')}</h2>
            <p className="atlas-section-desc">{t('carosDesc')}</p>
          </div>
          <div className="atlas-caros-list">
            {cuadrosCaros.map((c) => (
              <div className="atlas-caro" key={c.pos}>
                <span className="atlas-caro-pos">{c.pos}</span>
                <div className="atlas-caro-info">
                  <h3 className="atlas-caro-obra">{c.obra}</h3>
                  <p className="atlas-caro-autor">{c.autor} · {c.ano}</p>
                  <p className="atlas-caro-nota">{c.nota}</p>
                </div>
                <div className="atlas-caro-precio">
                  <span className="atlas-caro-num">${c.precio}</span>
                  <span className="atlas-caro-m">{t('carosMillions')}</span>
                  <span className="atlas-caro-donde">{c.donde}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATOS CURIOSOS ───────────────────────────────── */}
      <section className="atlas-datos">
        <div className="wrap">
          <div className="atlas-section-head">
            <h2 className="atlas-section-title">{t('datosTitle')}</h2>
            <p className="atlas-section-desc">{t('datosDesc')}</p>
          </div>
          <div className="atlas-datos-grid">
            {datosCuriosos.map((d, i) => (
              <div className="atlas-dato" key={i} style={{ background: d.color }}>
                <span className="atlas-dato-mark">“”</span>
                <p className="atlas-dato-texto">{d.dato}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MUSEOS ───────────────────────────────────────── */}
      <section className="atlas-museos" id="museos">
        <div className="wrap">
          <div className="atlas-section-head atlas-section-head-dark">
            <h2 className="atlas-section-title">{t('museosTitle')}</h2>
            <p className="atlas-section-desc">{t('museosDesc')}</p>
          </div>
          <div className="atlas-museos-grid">
            {museos.map((m, i) => (
              <div className="atlas-museo" key={i}>
                <span className="atlas-museo-bar" style={{ background: m.color }} />
                <h3 className="atlas-museo-nombre">{m.nombre}</h3>
                <p className="atlas-museo-ciudad">{m.ciudad}</p>
                <p className="atlas-museo-joya">{m.joya}</p>
                <p className="atlas-museo-dato">{m.dato}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIOS ──────────────────────────────────────── */}
      <section className="atlas-premios" id="premios">
        <div className="wrap">
          <div className="atlas-section-head">
            <h2 className="atlas-section-title">{t('premiosTitle')}</h2>
            <p className="atlas-section-desc">{t('premiosDesc')}</p>
          </div>
          <div className="atlas-premios-list">
            {premios.map((p, i) => (
              <div className="atlas-premio" key={i}>
                <div className="atlas-premio-top">
                  <h3 className="atlas-premio-nombre">{p.nombre}</h3>
                  <span className="atlas-premio-desde">{t('premiosSince', { year: p.desde })}</span>
                </div>
                <p className="atlas-premio-donde">{p.donde}</p>
                <p className="atlas-premio-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CIERRE ───────────────────────────────────────── */}
      <section className="atlas-cierre">
        <div className="wrap atlas-cierre-inner">
          <p className="atlas-cierre-pre">{t('cierrePre')}</p>
          <h2 className="atlas-cierre-title">
            {t('cierreTitle1')}<br />
            <em>{t('cierreTitleEm')}</em>
          </h2>
          <p className="atlas-cierre-sub">{t('cierreSub')}</p>
          <div className="atlas-cierre-ctas">
            <Link href="/artistas" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
              {t('ctaSeason')}
            </Link>
            <Link href="/sobre-mancha" className="atlas-cierre-ghost">{t('ctaInstitution')}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
