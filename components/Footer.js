import Link from 'next/link';
import Splat from './Splat';

export default function Footer() {
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
            <p>Una galería con pocos artistas a la vez. El arte cambia, tú también puedes.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <h5>Explorar</h5>
              <Link href="/sobre-mancha">Sobre MANCHA</Link>
              <Link href="/obras">Catálogo</Link>
              <Link href="/#artistas">Temporada actual</Link>
              <Link href="/temporadas">Temporadas</Link>
              <Link href="/#favoritos">Favoritos</Link>
              <Link href="/notas">Notas</Link>
              <Link href="/tips">Tips artísticos</Link>
              <Link href="/postular">¿Eres artista?</Link>
              <Link href="/legal">Términos y privacidad</Link>
            </div>
            <div className="footer-col">
              <h5>Contacto</h5>
              <a href="mailto:mancha.gallery@gmail.com">mancha.gallery@gmail.com</a>
            </div>
            <div className="footer-col">
              <h5>Síguenos</h5>
              <span>Instagram</span>
              <span>Pinterest</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 MANCHA. Galería independiente.</span>
          <span>Temporada 01 cierra el 19 sep 2026</span>
        </div>
      </div>
    </footer>
  );
}
