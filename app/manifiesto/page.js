import Link from 'next/link';
import Nav from '@/components/Nav';
import Splat from '@/components/Splat';
import Footer from '@/components/Footer';


export const metadata = {
  title: 'MANCHA — Lo que pasa por aquí queda marcado para siempre.',
  description: 'El manifiesto de MANCHA. Para los artistas que entienden que pertenecer a algo que vale la pena es un logro, no un trámite.',
  openGraph: {
    title: 'MANCHA — Lo que pasa por aquí queda marcado para siempre.',
    description: 'El manifiesto de MANCHA. Para los artistas que entienden que pertenecer a algo que vale la pena es un logro, no un trámite.',
    type: 'website',
  },
};

const PRINCIPIOS = [
  {
    n: '01',
    titulo: 'Entramos pocos.',
    cuerpo: 'No porque seamos exclusivos por capricho. Sino porque la atención es finita y la obra de verdad merece espacio real. Cada temporada son pocos artistas — elegidos, no seleccionados por volumen.',
  },
  {
    n: '02',
    titulo: 'Lo que entra, permanece.',
    cuerpo: 'Estar en MANCHA no es un momento — es una marca. El artista que pasó por aquí lleva eso consigo. Los coleccionistas lo saben. El mercado lo aprende.',
  },
  {
    n: '03',
    titulo: 'El creador siempre primero.',
    cuerpo: 'El 75% de cada venta va directo al artista. Sin comisiones ocultas, sin letra chica. Construimos para que el arte sea un sustento real, no una promesa.',
  },
  {
    n: '04',
    titulo: 'Crecemos juntos o no crecemos.',
    cuerpo: 'Estamos en etapa de expansión. Cada artista que entra es embajador de lo que estamos construyendo. Tu red, tu voz, tu obra — todo suma al peso del nombre.',
  },
  {
    n: '05',
    titulo: 'La obra habla primero.',
    cuerpo: 'No miramos seguidores ni premios ni academia. Miramos lo que hiciste. Si la obra tiene algo que el mundo todavía no vio, eso es lo que nos importa.',
  },
];

export default function ManifiestoPage() {
  return (
    <>
      <Nav />

      {/* ── INTRO OSCURA ──────────────────────────────────── */}
      <section className="mf-hero">
        <Splat width="260px" height="220px" top="-70px" right="-60px" color="red" rotate={-16} radius="r2" />
        <Splat width="140px" height="120px" bottom="-50px" left="-35px" color="lilac" rotate={12} radius="r3" />
        <Splat width="80px" height="70px" top="45%" left="8%" color="yellow" rotate={7} radius="r1" />
        <div className="wrap mf-hero-inner">
          <p className="eyebrow mf-eyebrow">Para artistas</p>
          <h1 className="mf-hero-title">
            Lo que pasa por aquí<br />
            <em>queda marcado</em><br />
            para siempre.
          </h1>
          <p className="mf-hero-sub">
            MANCHA no es una vitrina. Es una decisión.
          </p>
        </div>
      </section>

      {/* ── APERTURA ─────────────────────────────────────── */}
      <section className="mf-apertura">
        <div className="wrap mf-apertura-inner">
          <p className="mf-apertura-texto">
            Existe demasiado arte en el mundo y muy pocos lugares que se tomen en serio
            la tarea de separar lo que vale de lo que simplemente existe.
            MANCHA nació para ser ese lugar.
          </p>
          <p className="mf-apertura-texto mf-apertura-acento">
            No un algoritmo. No una feria de vanidades. Una mirada humana,
            temporada tras temporada, buscando la obra que tiene algo que el
            resto todavía no sabe nombrar.
          </p>
        </div>
      </section>

      {/* ── FRASE CENTRAL ────────────────────────────────── */}
      <section className="mf-cita">
        <Splat width="200px" height="175px" top="-55px" left="-45px" color="yellow" rotate={14} radius="r4" />
        <Splat width="120px" height="105px" bottom="-40px" right="-30px" color="lilac" rotate={-10} radius="r2" />
        <div className="wrap mf-cita-inner">
          <blockquote className="mf-cita-quote">
            "Quien llega a MANCHA no viene a exponer.<br />
            <span className="mf-cita-acento">Viene a pertenecer."</span>
          </blockquote>
        </div>
      </section>

      {/* ── LO QUE SIGNIFICA ─────────────────────────────── */}
      <section className="mf-significado">
        <div className="wrap">
          <div className="mf-significado-grid">
            <div className="mf-significado-col">
              <p className="eyebrow mf-sig-eyebrow">Qué es MANCHA</p>
              <p className="mf-sig-texto">
                Una galería de arte emergente online, construida sobre una premisa simple:
                la restricción crea valor. Pocos artistas por temporada. Tres piezas
                cada uno. Tiempo limitado. Sin catálogos infinitos ni ruido.
              </p>
              <p className="mf-sig-texto">
                Los coleccionistas llegan porque confían en el criterio.
                El criterio existe porque no dejamos entrar a cualquiera.
                Ese círculo no es arrogancia — es la arquitectura de algo que dura.
              </p>
            </div>
            <div className="mf-significado-col">
              <p className="eyebrow mf-sig-eyebrow">Dónde estamos</p>
              <p className="mf-sig-texto">
                Estamos creciendo. No lo ocultamos — lo decimos con orgullo.
                Cada temporada suma coleccionistas nuevos, obras nuevas,
                conversaciones nuevas sobre arte que vale la pena tener.
              </p>
              <p className="mf-sig-texto">
                Los artistas que entran ahora son parte de la fundación.
                Lo que construimos juntos hoy es la reputación que todos cargamos mañana.
                Eso tiene un peso que no se borra.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRINCIPIOS ───────────────────────────────────── */}
      <section className="mf-principios">
        <Splat width="180px" height="155px" top="-45px" right="-40px" color="red" rotate={-12} radius="r1" />
        <Splat width="90px" height="80px" bottom="-30px" left="10%" color="yellow" rotate={9} radius="r3" />
        <div className="wrap">
          <p className="eyebrow mf-eyebrow-dark">Los principios</p>
          <div className="mf-principios-lista">
            {PRINCIPIOS.map((p) => (
              <div className="mf-principio" key={p.n}>
                <span className="mf-principio-n">{p.n}</span>
                <div className="mf-principio-body">
                  <h3 className="mf-principio-titulo">{p.titulo}</h3>
                  <p className="mf-principio-texto">{p.cuerpo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LA MARCA QUE DEJA ────────────────────────────── */}
      <section className="mf-huella">
        <div className="wrap mf-huella-inner">
          <p className="eyebrow" style={{ color: 'rgba(250,243,230,0.4)', marginBottom: 28 }}>La huella</p>
          <h2 className="mf-huella-titulo">
            Esto no se quita<br />
            <em>con nada.</em>
          </h2>
          <div className="mf-huella-cols">
            <p className="mf-huella-texto">
              Un artista que pasó por MANCHA puede seguir su camino en cualquier
              dirección. Lo que no pierde es el registro de que hubo un momento —
              una temporada — en que alguien miró su obra y dijo: esto entra.
            </p>
            <p className="mf-huella-texto">
              Eso es coleccionable. Eso es lo que los compradores buscan:
              el rastro de alguien que vio primero. Y MANCHA existe para
              ser ese rastro en la historia de la obra.
            </p>
          </div>
        </div>
      </section>

      {/* ── LLAMADO ──────────────────────────────────────── */}
      <section className="mf-llamado">
        <Splat width="160px" height="140px" top="-45px" left="-35px" color="lilac" rotate={11} radius="r2" />
        <Splat width="100px" height="88px" bottom="-35px" right="-25px" color="red" rotate={-9} radius="r4" />
        <Splat width="65px" height="58px" top="30%" right="8%" color="yellow" rotate={6} radius="r1" />
        <div className="wrap mf-llamado-inner">
          <p className="mf-llamado-pre">Si estás leyendo esto,</p>
          <h2 className="mf-llamado-titulo">
            ya sabes si eres<br />
            <em>de los nuestros.</em>
          </h2>
          <p className="mf-llamado-sub">
            No pedimos perfección. Pedimos obra que tenga algo.
            Si eso eres tú — postula. Si no, guarda este link para cuando lo seas.
          </p>
          <div className="mf-llamado-ctas">
            <Link href="/postular" className="btn-primary mf-btn-postular">
              Postular a esta temporada →
            </Link>
            <Link href="/artistas" className="mf-llamado-ghost">
              Ver los artistas actuales
            </Link>
          </div>
        </div>
      </section>

      {/* ── FIRMA ────────────────────────────────────────── */}
      <section className="mf-firma">
        <div className="wrap mf-firma-inner">
          <div className="mf-firma-linea" />
          <p className="mf-firma-texto">
            Construido con criterio. Creciendo con intención.
          </p>
          <p className="mf-firma-brand">MANCHA.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
