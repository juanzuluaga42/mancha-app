import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = { title: 'MANCHA — Términos y privacidad' };

export default function LegalPage() {
  return (
    <>
      <Nav />
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow">Legal</p>
          <h1>Términos y privacidad</h1>
          <p className="sub" style={{ margin: 0 }}>La versión simple de lo que recopilamos, cómo funcionan las pujas y a quién escribirle si algo no cuadra.</p>
        </div>
      </header>

      <section className="content">
        <div className="wrap" style={{ maxWidth: 680, fontFamily: 'var(--font-body)', fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--ink-soft)' }}>

          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', fontSize: '1.4rem', marginTop: 36, marginBottom: 10 }}>Qué datos recopilamos</h2>
          <p>Cuando creas una cuenta, postulas como artista o te sumas a la lista de espera, guardamos tu nombre, correo, y según el caso, ciudad, biografía, Instagram o portfolio. Cuando pujas, guardamos el monto y la pieza. El pago en sí lo procesa Stripe — MANCHA nunca ve ni guarda el número de tu tarjeta.</p>

          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', fontSize: '1.4rem', marginTop: 36, marginBottom: 10 }}>Para qué los usamos</h2>
          <p>Para confirmarte pujas, avisarte si ganaste una pieza, coordinar pago y envío, y notificarte sobre nuevos artistas o temporadas si te sumaste a la lista de espera. No vendemos tus datos a terceros. Podemos usar herramientas de analítica para entender cómo se usa el sitio, sin identificarte personalmente.</p>

          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', fontSize: '1.4rem', marginTop: 36, marginBottom: 10 }}>Pujar es un compromiso</h2>
          <p>Al pujar por una pieza te comprometes a pagar si eres quien más ofrece cuando cierra la temporada. Si ganas y no completas el pago en un plazo razonable, nos reservamos el derecho de ofrecerle la pieza a la siguiente puja más alta.</p>

          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', fontSize: '1.4rem', marginTop: 36, marginBottom: 10 }}>Comisión para artistas</h2>
          <p>De cada venta, el 75% es para el artista y el 25% para MANCHA. No cobramos nada por postular ni por exponer durante la temporada.</p>

          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', fontSize: '1.4rem', marginTop: 36, marginBottom: 10 }}>Envío</h2>
          <p>El envío se coordina por correo después de confirmado el pago, caso por caso. MANCHA ayuda a coordinar pero no es responsable de demoras o daños ocurridos durante el transporte una vez despachada la pieza.</p>

          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', fontSize: '1.4rem', marginTop: 36, marginBottom: 10 }}>Contacto</h2>
          <p>Para cualquier duda sobre tus datos, una puja, o lo que sea: escríbenos a <a href="mailto:mancha.gallery@gmail.com">mancha.gallery@gmail.com</a>.</p>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-soft)', marginTop: 40, opacity: 0.7 }}>Esta es una versión simple pensada para una etapa temprana de MANCHA, no un documento legal exhaustivo.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
