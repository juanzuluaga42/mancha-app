import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import BlogImg from '@/components/BlogImg';
import { articles } from '@/lib/news';
import {
  datosTicker, datosCuriosos, artistas, cuadrosCaros,
  museos, premios, movimientos,
} from '@/lib/atlas';

export const metadata = {
  title: 'MANCHA — Lo que pensamos sobre el arte.',
  description: 'MANCHA Editorial: los 20 artistas más influyentes, los cuadros más caros, los grandes museos y lo que el arte dice sobre el mundo.',
  openGraph: {
    title: 'MANCHA — Lo que pensamos sobre el arte.',
    description: 'MANCHA Editorial: arte, historia, criterio. Sin algoritmos editoriales.',
    type: 'website',
  },
};

export default function NotasPage() {
  const [lead, ...rest] = articles;

  return (
    <>
      <Nav />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="atlas-hero">
        <Splat width="240px" height="205px" top="-70px" right="-55px" color="red" rotate={-15} radius="r2" />
        <Splat width="150px" height="130px" bottom="-45px" left="-35px" color="lilac" rotate={12} radius="r3" />
        <Splat width="90px" height="80px" top="44%" left="10%" color="yellow" rotate={7} radius="r1" />
        <div className="wrap atlas-hero-inner">
          <p className="eyebrow atlas-hero-eyebrow">MANCHA Editorial</p>
          <h1 className="atlas-hero-title">
            Lo que pensamos<br />
            <em>sobre el arte.</em>
          </h1>
          <p className="atlas-hero-sub">
            Arte, historia, criterio. Cinco siglos de genios, récords imposibles,
            museos y datos que nadie te contó. Sin algoritmos editoriales.
          </p>
          <div className="atlas-hero-jump">
            <a href="#lecturas">Lecturas</a>
            <a href="#artistas">Los 20 artistas</a>
            <a href="#caros">Cuadros más caros</a>
            <a href="#museos">Museos</a>
            <a href="#premios">Premios</a>
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
          <p className="atlas-section-kicker">600 años en una línea</p>
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
            <h2 className="atlas-section-title">Lecturas</h2>
            <p className="atlas-section-desc">Historias largas para leer con calma.</p>
          </div>

          {/* Artículo destacado */}
          <Link href={`/notas/${lead.slug}`} className="atlas-lead">
            <div className="atlas-lead-media">
              <BlogImg src={lead.image} alt={lead.imageAlt} color="var(--ink)" />
            </div>
            <div className="atlas-lead-body">
              <p className="atlas-lead-date">{lead.date} · Destacado</p>
              <h3 className="atlas-lead-title">{lead.title}</h3>
              <p className="atlas-lead-excerpt">{lead.excerpt}</p>
              <span className="atlas-lead-cta">Leer nota completa →</span>
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
                <span className="atlas-art-cta">Leer →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 20 ARTISTAS ──────────────────────────────────── */}
      <section className="atlas-artistas" id="artistas">
        <Splat width="200px" height="175px" top="-50px" right="-40px" color="red" rotate={-12} radius="r1" />
        <Splat width="110px" height="95px" bottom="6%" left="-30px" color="yellow" rotate={10} radius="r3" />
        <div className="wrap">
          <div className="atlas-section-head atlas-section-head-dark">
            <h2 className="atlas-section-title">Los 20 más influyentes</h2>
            <p className="atlas-section-desc">
              No es un ranking de gusto — es un mapa de quiénes cambiaron las reglas
              del juego. Pasa el cursor sobre cada uno.
            </p>
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
            <h2 className="atlas-section-title">Los cuadros más caros del mundo</h2>
            <p className="atlas-section-desc">Cifras en millones de dólares. El mercado cotiza el relato tanto como la obra.</p>
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
                  <span className="atlas-caro-m">millones</span>
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
            <h2 className="atlas-section-title">Datos que no sabías</h2>
            <p className="atlas-section-desc">Pequeñas historias que vuelven el arte más humano.</p>
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
            <h2 className="atlas-section-title">Museos para ver una vez en la vida</h2>
            <p className="atlas-section-desc">Dónde vive el arte que cambió la historia.</p>
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
            <h2 className="atlas-section-title">Los grandes premios del arte</h2>
            <p className="atlas-section-desc">El reconocimiento que marca una carrera.</p>
          </div>
          <div className="atlas-premios-list">
            {premios.map((p, i) => (
              <div className="atlas-premio" key={i}>
                <div className="atlas-premio-top">
                  <h3 className="atlas-premio-nombre">{p.nombre}</h3>
                  <span className="atlas-premio-desde">desde {p.desde}</span>
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
        <Splat width="180px" height="155px" top="-50px" left="-40px" color="lilac" rotate={10} radius="r1" />
        <Splat width="110px" height="95px" bottom="-35px" right="-25px" color="yellow" rotate={-12} radius="r3" />
        <div className="wrap atlas-cierre-inner">
          <p className="atlas-cierre-pre">Toda esta historia empezó igual</p>
          <h2 className="atlas-cierre-title">
            Con alguien que vio<br />
            <em>algo primero.</em>
          </h2>
          <p className="atlas-cierre-sub">
            Los nombres de este atlas un día fueron artistas emergentes que nadie conocía.
            La próxima página de esta historia se está escribiendo ahora.
          </p>
          <div className="atlas-cierre-ctas">
            <Link href="/artistas" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
              Ver la temporada actual
            </Link>
            <Link href="/sobre-mancha" className="atlas-cierre-ghost">La institución →</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
