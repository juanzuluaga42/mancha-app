import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { isPreLaunch, isConvocatoria } from '@/lib/fase';

export const metadata = {
  title: 'MANCHA — Institución de descubrimiento artístico.',
  description: 'Por qué existe MANCHA: una institución que elige antes de que sea evidente, con criterio propio y sin catálogos abiertos.',
};

const REGLAS = [
  'Menos artistas. Más atención.',
  'La restricción no es un error. Es el punto.',
  'El creador se lleva la mayor parte. Siempre.',
  'No hay catálogo abierto. Hay selección.',
  'Lo que ves hoy puede no estar mañana.',
];

export default function SobreManchaPage() {
  const prelaunch = isPreLaunch();
  const convocatoria = isConvocatoria() || prelaunch;
  return (
    <>
      <Nav />
      <ScrollReveal />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="sobre-hero">
        <div className="wrap sobre-hero-inner">
          <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>Sobre MANCHA</p>
          <h1 className="sobre-hero-title">
            Elegimos antes<br />
            de que sea<br />
            <em>evidente.</em>
          </h1>
          <p className="sobre-hero-sub">
            Institución de descubrimiento<br />
            artístico. Est. 2026.
          </p>
        </div>
      </section>

      {/* ── NÚMEROS ──────────────────────────────────────── */}
      <section className="sobre-numbers">
        <div className="wrap">
          <div className="sobre-numbers-grid">
            <div className="sobre-number-item">
              <b className="sobre-number-dig sobre-number-word">Pocos.</b>
              <p className="sobre-number-label">Artistas<br />por temporada</p>
              <p className="sobre-number-note">No un catálogo abierto. Una selección hecha a mano, temporada por temporada.</p>
            </div>
            <div className="sobre-number-item">
              <b className="sobre-number-dig">3</b>
              <p className="sobre-number-label">Piezas<br />por artista</p>
              <p className="sobre-number-note">Lo mejor que tienen. Sin relleno. Sin obra de catálogo.</p>
            </div>
            <div className="sobre-number-item sobre-number-last">
              <b className="sobre-number-dig">3</b>
              <p className="sobre-number-label">Meses<br />por temporada</p>
              <p className="sobre-number-note">Cuando cierra, se fue. Lo que ves hoy puede no volver a estar disponible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFIESTO ───────────────────────────────────── */}
      <section className="sobre-manifiesto">
        <div className="wrap sobre-manifiesto-inner">
          <p className="sobre-manifiesto-big">
            El arte emergente muere en el ruido.
          </p>
          <p className="sobre-manifiesto-body">
            En ferias donde cientos de obras compiten por una mirada de tres segundos. En perfiles que se pierden en el scroll. En portafolios que nadie abre. El problema no es la falta de talento — es la falta de criterio.
          </p>
          <div className="sobre-manifiesto-divisor" />
          <p className="sobre-manifiesto-big">
            MANCHA es la respuesta institucional a ese problema.
          </p>
          <p className="sobre-manifiesto-body">
            Una temporada tiene pocos artistas — los que elegimos, no los que alcanzaron a anotarse. Cada uno expone exactamente tres piezas. Ni una más. Esa restricción no es un capricho: obliga a mostrar lo mejor, le da a cada obra el espacio para ser vista de verdad, y protege la atención del coleccionista. El criterio es el producto.
          </p>
        </div>
      </section>

      {/* ── REGLAS ───────────────────────────────────────── */}
      <section className="sobre-reglas">
        <div className="wrap">
          <p className="eyebrow">Las reglas de MANCHA</p>
          <div className="sobre-reglas-list">
            {REGLAS.map((regla, i) => (
              <div className="sobre-regla" key={i}>
                <span className="sobre-regla-n">{String(i + 1).padStart(2, '0')}</span>
                <p className="sobre-regla-text">{regla}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EL FILTRO ────────────────────────────────────── */}
      <section className="el-filtro">
        <div className="wrap el-filtro-wrap">
          <h2 className="el-filtro-title">No miramos tus seguidores.<br />Miramos tu obra.</h2>
          <div className="el-filtro-body">
            <p>
              Cada solicitud la revisa una persona, no un algoritmo. No nos importa si tienes mil seguidores o ninguno,
              si vienes de una academia o aprendiste solo. Nos importa una sola cosa: que la obra tenga algo que el resto todavía no vio.
            </p>
            <p>
              La mayoría de las solicitudes no entran. No por castigo — por estándar.
              Cada artista que aceptamos lleva el nombre de MANCHA con él.
            </p>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA: varía según fase ─────────────── */}
      {convocatoria ? (
        <section className="sobre-puja">
          <div className="wrap sobre-puja-inner sobre-puja-single">
            <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>La convocatoria</p>
            <h2 className="sobre-puja-title">Sin cuotas. Sin trampa.</h2>
            <p className="sobre-puja-body">
              Solicitar acceso a MANCHA es gratis. Revisamos cada solicitud de forma personal — sin filtros automáticos, sin métricas de seguidores.
              Si tu trabajo entra, te avisamos directamente y te guiamos en el proceso de subir tus piezas.
            </p>
            <p className="sobre-puja-body">
              Cuando la Temporada 01 abra el 1 de septiembre, los coleccionistas van a poder explorar, pujar y llevarse tu obra.
              Tú te llevas la mayor parte de lo que se vende. Siempre.
            </p>
          </div>
        </section>
      ) : (
        <section className="sobre-puja">
          <div className="wrap sobre-puja-inner sobre-puja-single">
            <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>Cómo funciona</p>
            <h2 className="sobre-puja-title">Una subasta sin trampa.</h2>
            <p className="sobre-puja-body">
              Cada pieza tiene una puja mínima y se subasta durante toda la temporada. Cuando cierra, quien ofreció más se lleva la obra — y paga exactamente eso, sin cargos extra del lado del comprador.
            </p>
            <p className="sobre-puja-body">
              Sin intermediarios, sin comisiones ocultas, sin letra chica. Solo la obra, el precio que pusiste, y el artista que la hizo.
            </p>
          </div>
        </section>
      )}

      {/* ── POR QUÉ "MANCHA" ─────────────────────────────── */}
      <section className="sobre-etymology">
        <div className="wrap sobre-etymology-inner">
          <p className="eyebrow">Por qué "MANCHA"</p>
          <blockquote className="sobre-etymology-quote">
            "Una mancha es el primer gesto sobre el lienzo en blanco."
          </blockquote>
          <p className="sobre-etymology-body">
            Antes del control, antes de la técnica — la intención pura. También es lo que queda, lo que no se va, lo que marca. El nombre dice las dos cosas al mismo tiempo: el comienzo de algo y la huella que deja. Los artistas que pasan por MANCHA quedan en el registro. Eso no cambia.
          </p>
        </div>
      </section>

      {/* ── CIERRE ───────────────────────────────────────── */}
      <section className="sobre-closing">
        <div className="wrap sobre-closing-inner">
          {prelaunch ? (
            <>
              <p className="sobre-closing-line">La convocatoria abre el 1 de agosto.</p>
              <p className="sobre-closing-line sobre-closing-accent">La Temporada 01 arranca el 1 de septiembre.</p>
              <div className="sobre-closing-ctas">
                <Link href="/registro" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                  Solicitar acceso →
                </Link>
                <Link href="/criterio" className="sobre-closing-ghost">
                  Leer el criterio →
                </Link>
              </div>
            </>
          ) : convocatoria ? (
            <>
              <p className="sobre-closing-line">La convocatoria está abierta.</p>
              <p className="sobre-closing-line sobre-closing-accent">La Temporada 01 arranca el 1 de septiembre.</p>
              <div className="sobre-closing-ctas">
                <Link href="/postular" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                  Solicitar acceso →
                </Link>
                <Link href="/criterio" className="sobre-closing-ghost">
                  Leer el criterio →
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="sobre-closing-line">El arte no se queda quieto.</p>
              <p className="sobre-closing-line sobre-closing-accent">Esta temporada todavía está abierta.</p>
              <div className="sobre-closing-ctas">
                <Link href="/seleccionados" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                  Ver los elegidos
                </Link>
                <Link href="/postular" className="sobre-closing-ghost">
                  Solicitar acceso como artista →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
