import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = { title: 'MANCHA — Página no encontrada' };

export default function NotFound() {
  return (
    <>
      <Nav />
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow">404</p>
          <h1>Esta obra no está aquí.</h1>
          <p className="sub" style={{ margin: 0 }}>
            El link que seguiste puede haber cambiado, o la pieza ya no está disponible. Volvé al catálogo y seguí buscando.
          </p>
        </div>
      </header>

      <section className="content">
        <div className="wrap" style={{ maxWidth: 680, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Link href="/obras" className="piece-buy" style={{ display: 'inline-block' }}>Ver catálogo →</Link>
          <Link href="/" className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center' }}>← Volver al inicio</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
