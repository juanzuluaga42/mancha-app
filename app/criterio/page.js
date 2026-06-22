import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';

export const metadata = {
  title: 'MANCHA — El criterio',
  description: 'Qué busca MANCHA en una obra. No es un algoritmo. Es un estándar.',
};

const PRINCIPIOS = [
  {
    n: '01',
    title: 'Voz, no perfección.',
    body: 'Una obra técnicamente impecable pero sin nada que decir no entra. Una obra imperfecta que no te puedes sacar de la cabeza, sí. Lo que buscamos es algo que todavía no vimos — no algo bien ejecutado sobre lo que ya existe.',
  },
  {
    n: '02',
    title: 'El nombre no pesa. La obra sí.',
    body: 'No miramos tus seguidores. No nos importa si vienes de una academia o aprendiste solo, si expusiste en galerías o nunca lo hiciste. Revisamos la obra. Eso es todo. Cada postulación la lee una persona, no un algoritmo.',
  },
  {
    n: '03',
    title: 'Cada temporada es un lanzamiento.',
    body: 'No somos un catálogo permanente. Tres meses, un grupo pequeño, y cuando cierra se fue. Esa restricción no es un capricho — es lo que le da peso a estar adentro. Un artista que entra en MANCHA no entra en un listado. Entra en un evento.',
  },
  {
    n: '04',
    title: 'La mayoría no entra. Eso no es un castigo.',
    body: 'Es la razón por la que entrar importa. El estándar es lo que le da valor al sello. Un espacio que acepta a todos no distingue a nadie. Rechazamos no para castigar — sino para que cuando alguien entre, el gesto tenga peso real.',
  },
];

export default function CriterioPage() {
  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="criterio-header">
        <Splat width="200px" height="175px" top="-55px" right="-40px" color="red" rotate={-12} radius="r2" />
        <Splat width="110px" height="96px" bottom="-35px" left="-28px" color="yellow" rotate={14} radius="r4" />
        <Splat width="66px" height="58px" top="42%" left="6%" color="lilac" rotate={8} radius="r1" />
        <div className="wrap">
          <p className="criterio-eyebrow">El criterio</p>
          <h1 className="criterio-title">
            Qué busca<br />
            <em>MANCHA.</em>
          </h1>
          <p className="criterio-sub">
            No es un algoritmo. No es una lista de requisitos.
            Es un estándar — y está escrito para que sepas exactamente a qué aspirar.
          </p>
        </div>
      </header>

      {/* ── INTRO ────────────────────────────────────────── */}
      <section className="criterio-intro">
        <div className="wrap criterio-intro-wrap">
          <p className="criterio-intro-text">
            Y Combinator publica qué busca en una startup. Nosotros publicamos qué buscamos en una obra.
            El estándar deja de ser implícito — el artista sabe a qué aspirar, el coleccionista sabe en qué confiar.
          </p>
        </div>
      </section>

      {/* ── PRINCIPIOS ───────────────────────────────────── */}
      <section className="criterio-section">
        <div className="wrap criterio-wrap">
          {PRINCIPIOS.map((p) => (
            <div className="criterio-item" key={p.n}>
              <div className="criterio-item-head">
                <span className="criterio-n">{p.n}</span>
                <h2 className="criterio-item-title">{p.title}</h2>
              </div>
              <p className="criterio-item-body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CIERRE ───────────────────────────────────────── */}
      <section className="criterio-closing">
        <Splat width="150px" height="132px" top="-45px" left="-35px" color="lilac" rotate={10} radius="r3" />
        <Splat width="90px" height="80px" bottom="-28px" right="-22px" color="red" rotate={-12} radius="r1" />
        <div className="wrap criterio-closing-inner">
          <p className="criterio-closing-line">Si crees que tu trabajo tiene algo que el resto todavía no vio,</p>
          <p className="criterio-closing-accent">eso es exactamente lo que necesitamos leer.</p>
          <Link href="/postular" className="criterio-closing-btn">Enviar postulación →</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
