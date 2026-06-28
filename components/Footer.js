import Link from 'next/link';
import Splat from './Splat';
import OcultarColeccionista from './OcultarColeccionista';
import LocaleSwitch from './LocaleSwitch';
import { isPreLaunch, isConvocatoria } from '@/lib/fase';

export default function Footer() {
  const prelaunch = isPreLaunch();
  const convocatoria = isConvocatoria();

  return (
    <footer className="site-footer">
      <Splat width="180px" height="160px" bottom="-55px" right="-50px" color="yellow" rotate={-15} radius="r1" />
      <Splat width="110px" height="95px" top="-30px" left="-35px" color="lilac" rotate={16} radius="r2" />
      <Splat width="60px" height="55px" bottom="18%" right="-25px" color="red" rotate={-8} radius="r3" />
      <Splat width="55px" height="50px" top="10%" right="30%" color="red" rotate={12} radius="r4" />
      <Splat width="50px" height="46px" top="35%" left="40%" color="yellow" rotate={-10} radius="r2" />
      <Splat width="45px" height="42px" bottom="8%" left="20%" color="lilac" rotate={14} radius="r3" />
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="brand">MANCHA<span>.</span></Link>
            <p>
              {prelaunch || convocatoria
                ? 'Institución de descubrimiento artístico. Est. 2026.'
                : 'Institución de descubrimiento artístico. Est. 2026.'}
            </p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h5>La institución</h5>
              <OcultarColeccionista><Link href="/criterio">El criterio</Link></OcultarColeccionista>
              {prelaunch ? (
                <>
                  <Link href="/registro">Crear cuenta</Link>
                </>
              ) : convocatoria ? (
                <>
                  <Link href="/postular">Solicitar acceso →</Link>
                </>
              ) : (
                <>
                  <Link href="/seleccionados">Los elegidos</Link>
                  <Link href="/obras">Catálogo</Link>
                  <Link href="/postular">Solicitar acceso</Link>
                </>
              )}
              <Link href="/legal">Términos y privacidad</Link>
            </div>
            <div className="footer-col">
              <h5>Editorial</h5>
              <Link href="/notas">Editorial MANCHA →</Link>
              <h5 style={{ marginTop: 24 }}>Contacto</h5>
              <a href="mailto:mancha.gallery@gmail.com">mancha.gallery@gmail.com</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 MANCHA. Institución de descubrimiento artístico.</span>
          {prelaunch || convocatoria
            ? <span>Convocatoria 1–31 ago · Temporada 01 abre 1 sep 2026</span>
            : <span>Temporada en curso</span>}
          <LocaleSwitch />
        </div>
      </div>
    </footer>
  );
}
