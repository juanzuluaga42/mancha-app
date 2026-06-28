import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { isConvocatoria } from '@/lib/fase';

export const metadata = { title: 'MANCHA — Página no encontrada' };

export default function NotFound() {
  const convocatoria = isConvocatoria();
  return (
    <>
      <Nav />

      <section className="nf-section">
        <Splat width="260px" height="230px" top="-70px" right="-55px" color="red" rotate={-12} radius="r2" />
        <Splat width="160px" height="140px" bottom="-45px" left="-40px" color="yellow" rotate={14} radius="r4" />
        <Splat width="90px" height="80px" top="55%" left="8%" color="lilac" rotate={8} radius="r1" />

        <div className="wrap nf-inner">
          <p className="nf-num">404</p>
          <h1 className="nf-title">Esta página<br /><em>no está aquí.</em></h1>
          <p className="nf-sub">
            El link que seguiste puede haber cambiado o ya no está disponible.
            Hay mucho más por explorar.
          </p>
          <div className="nf-ctas">
            <Link href="/" className="btn-primary">Volver al inicio</Link>
            {convocatoria
              ? <Link href="/postular" className="nf-ghost">Postular ahora →</Link>
              : <Link href="/seleccionados" className="nf-ghost">Ver los elegidos →</Link>}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
