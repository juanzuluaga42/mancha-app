import Nav from '@/components/Nav';
import Splat from '@/components/Splat';
import Footer from '@/components/Footer';


export const metadata = {
  title: 'MANCHA — Términos y privacidad',
  description: 'Cómo funciona MANCHA, qué datos guardamos y cuáles son las reglas del juego. Sin letra chica.',
};

const SECCIONES = [
  {
    id: 'datos',
    n: '01',
    titulo: 'Qué datos guardamos',
    texto: [
      'Cuando creas una cuenta, postulas como artista o te sumas a la lista de espera, guardamos tu nombre, correo y — según el caso — ciudad, biografía, Instagram o portfolio.',
      'Cuando pujas, guardamos el monto y la pieza. El pago lo procesa Stripe de forma segura. MANCHA nunca ve ni almacena el número de tu tarjeta.',
    ],
  },
  {
    id: 'uso',
    n: '02',
    titulo: 'Para qué los usamos',
    texto: [
      'Para confirmarte pujas, avisarte si ganaste una pieza, y coordinar el pago y el envío.',
      'Si te sumaste a la lista de espera, para avisarte cuando haya artistas nuevos o se abra la próxima temporada.',
      'No vendemos tus datos a terceros. Podemos usar herramientas de analítica para entender cómo se usa el sitio, sin identificarte personalmente.',
    ],
  },
  {
    id: 'pujas',
    n: '03',
    titulo: 'Pujar es un compromiso',
    texto: [
      'Al pujar por una pieza te comprometes a pagar si eres quien más ofrece cuando cierra la temporada. No es una reserva — es una oferta en firme.',
      'Si ganas y no completas el pago en un plazo razonable, nos reservamos el derecho de ofrecerle la pieza a la siguiente puja más alta y de inhabilitar tu cuenta.',
    ],
  },
  {
    id: 'precios',
    n: '04',
    titulo: 'Precios y comisiones',
    texto: [
      'Como comprador, pagas exactamente lo que pujaste. No hay cargos adicionales del lado del comprador — ni comisiones, ni tarifas de servicio, ni sorpresas.',
      'El desglose de la venta es un asunto interno entre MANCHA y el artista. Como comprador, lo único que te corresponde saber es que lo que ofreces es lo que pagas.',
    ],
  },
  {
    id: 'envio',
    n: '05',
    titulo: 'Envío',
    texto: [
      'El envío se coordina por correo directamente con el artista una vez confirmado el pago, caso por caso.',
      'MANCHA actúa como intermediario para facilitar la coordinación, pero no es responsable de demoras o daños ocurridos durante el transporte una vez despachada la pieza.',
    ],
  },
  {
    id: 'privacidad',
    n: '06',
    titulo: 'Privacidad y cookies',
    texto: [
      'Usamos cookies esenciales para que la sesión funcione. Nada de cookies de publicidad ni rastreo entre sitios.',
      'Puedes pedirte que eliminemos tus datos en cualquier momento escribiéndonos. Lo hacemos sin preguntas.',
    ],
  },
  {
    id: 'contacto',
    n: '07',
    titulo: 'Contacto',
    texto: [
      'Para cualquier duda sobre tus datos, una puja, o lo que sea — escríbenos a mancha.gallery@gmail.com. Respondemos a la brevedad.',
    ],
    link: { href: 'mailto:mancha.gallery@gmail.com', label: 'mancha.gallery@gmail.com' },
  },
];

export default function LegalPage() {
  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="legal-header">
        <Splat width="200px" height="175px" top="-55px" right="-40px" color="yellow" rotate={-10} radius="r2" />
        <Splat width="120px" height="105px" bottom="-35px" left="-30px" color="lilac" rotate={14} radius="r3" />
        <Splat width="70px" height="62px" top="50%" left="6%" color="red" rotate={8} radius="r4" />
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'rgba(250,243,230,0.45)' }}>Legal</p>
          <h1 className="legal-header-title">Sin letra chica.<br /><em>Sin trampa.</em></h1>
          <p className="legal-header-sub">
            Cómo funciona MANCHA, qué guardamos y cuáles son las reglas del juego —
            explicado como lo que somos: directos.
          </p>
          <nav className="legal-nav">
            {SECCIONES.map((s) => (
              <a key={s.id} href={`#${s.id}`}>{s.n} {s.titulo}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── CONTENIDO ────────────────────────────────────── */}
      <div className="legal-body">
        <div className="wrap" style={{ maxWidth: 760 }}>
          {SECCIONES.map((s) => (
            <section className="legal-section" key={s.id} id={s.id}>
              <div className="legal-section-head">
                <span className="legal-n">{s.n}</span>
                <h2 className="legal-h2">{s.titulo}</h2>
              </div>
              <div className="legal-content">
                {s.texto.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {s.link && (
                  <a href={s.link.href} className="legal-link">{s.link.label} →</a>
                )}
              </div>
            </section>
          ))}

          <div className="legal-footer-note">
            <p>Este documento es una explicación clara pensada para una etapa temprana de MANCHA. No reemplaza asesoramiento legal formal.</p>
            <p style={{ marginTop: 8 }}>Última actualización: junio 2025.</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
