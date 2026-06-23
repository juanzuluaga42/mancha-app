import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { isConvocatoria } from '@/lib/fase';

export const metadata = {
  title: 'MANCHA — No somos una galería. Somos el filtro.',
  description: 'Por qué existe MANCHA: pocos artistas, tres piezas cada uno, sin catálogos infinitos ni ruido.',
};

const REGLAS = [
  'Menos artistas significa más atención para cada obra.',
  'La restricción no es un error — es el punto.',
  'El creador siempre se lleva la mayor parte. Siempre.',
  'No hay catálogo abierto. Hay selección.',
  'Lo que ves hoy puede no estar mañana.',
];

export default function SobreManchaPage() {
  const convocatoria = isConvocatoria();
  return (
    <>
      <Nav />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="sobre-hero">
        <Splat width="220px" height="190px" top="-60px" right="-50px" color="red" rotate={-14} radius="r2" />
        <Splat width="130px" height="110px" bottom="-40px" left="-30px" color="lilac" rotate={10} radius="r3" />
        <Splat width="80px" height="70px" top="38%" right="6%" color="yellow" rotate={6} radius="r1" />
        <Splat width="55px" height="50px" top="20%" left="42%" color="red" rotate={-8} radius="r4" />
        <div className="wrap sobre-hero-inner">
          <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>Sobre MANCHA</p>
          <h1 className="sobre-hero-title">
            No somos<br />
            una galería.<br />
            <em>Somos el filtro.</em>
          </h1>
          <p className="sobre-hero-sub">
            Los elegimos antes<br />
            de que sean evidentes.
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
        <Splat width="160px" height="140px" top="-50px" left="-40px" color="yellow" rotate={12} radius="r1" />
        <Splat width="100px" height="88px" bottom="-40px" right="10%" color="lilac" rotate={-8} radius="r3" />
        <Splat width="64px" height="58px" top="42%" right="-28px" color="red" rotate={16} radius="r2" />
        <div className="wrap sobre-manifiesto-inner">
          <p className="sobre-manifiesto-big">
            El arte emergente muere en el ruido.
          </p>
          <p className="sobre-manifiesto-body">
            En ferias donde cientos de obras compiten por una mirada de tres segundos. En perfiles que se pierden en el scroll. En portafolios que nadie abre.
          </p>
          <div className="sobre-manifiesto-divisor" />
          <p className="sobre-manifiesto-big">
            Construimos lo contrario.
          </p>
          <p className="sobre-manifiesto-body">
            Una temporada dura tres meses. Tiene pocos artistas — los que elegimos, no los que alcanzaron a anotarse. Cada uno expone exactamente tres piezas. Ni una más. Esa restricción no es un capricho: obliga a mostrar lo mejor, y le da a cada obra el espacio para ser vista de verdad.
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
              Cada postulación la revisa una persona, no un algoritmo. No nos importa si tienes mil seguidores o ninguno,
              si vienes de una academia o aprendiste solo. Nos importa una sola cosa: que la obra tenga algo que el resto todavía no vio.
            </p>
            <p>
              La mayoría de las postulaciones no entran. No por castigo — por estándar.
              Cada artista que aceptamos lleva el nombre de MANCHA con él.
            </p>
          </div>
          <Link href="/criterio" className="el-filtro-link">Leer el criterio →</Link>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA: varía según fase ─────────────── */}
      {convocatoria ? (
        <section className="sobre-puja">
          <Splat width="120px" height="100px" top="-38px" right="8%" color="red" rotate={-10} radius="r2" />
          <Splat width="80px" height="70px" bottom="-30px" left="5%" color="yellow" rotate={12} radius="r4" />
          <div className="wrap sobre-puja-inner sobre-puja-single">
            <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>La convocatoria</p>
            <h2 className="sobre-puja-title">Sin cuotas. Sin trampa.</h2>
            <p className="sobre-puja-body">
              Postular a MANCHA es gratis. Revisamos cada postulación de forma personal — sin filtros automáticos, sin métricas de seguidores.
              Si tu trabajo entra, te avisamos directamente y te guiamos en el proceso de subir tus piezas.
            </p>
            <p className="sobre-puja-body">
              Cuando la Temporada 01 abra el 31 de julio, los coleccionistas van a poder explorar, pujar y llevarse tu obra.
              Tú te llevas la mayor parte de lo que se vende. Siempre.
            </p>
          </div>
        </section>
      ) : (
        <section className="sobre-puja">
          <Splat width="120px" height="100px" top="-38px" right="8%" color="red" rotate={-10} radius="r2" />
          <Splat width="80px" height="70px" bottom="-30px" left="5%" color="yellow" rotate={12} radius="r4" />
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
            Antes del control, antes de la técnica — la intención pura. También es lo que queda, lo que no se va, lo que marca. El nombre dice las dos cosas al mismo tiempo: el comienzo de algo y la huella que deja.
          </p>
        </div>
      </section>

      {/* ── CIERRE ───────────────────────────────────────── */}
      <section className="sobre-closing">
        <Splat width="180px" height="155px" top="-50px" left="-40px" color="lilac" rotate={10} radius="r1" />
        <Splat width="110px" height="95px" bottom="-35px" right="-25px" color="yellow" rotate={-12} radius="r3" />
        <Splat width="70px" height="62px" top="35%" right="12%" color="red" rotate={8} radius="r2" />
        <div className="wrap sobre-closing-inner">
          {convocatoria ? (
            <>
              <p className="sobre-closing-line">La Temporada 01 abre el 31 de julio.</p>
              <p className="sobre-closing-line sobre-closing-accent">La convocatoria está abierta ahora.</p>
              <div className="sobre-closing-ctas">
                <Link href="/postular" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                  Postular ahora →
                </Link>
                <Link href="/notas" className="sobre-closing-ghost">
                  Leer el blog →
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
                  Postular como artista →
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
