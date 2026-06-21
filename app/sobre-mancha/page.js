import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';

export const metadata = {
  title: 'MANCHA — Sobre nosotros',
  description: 'Por qué existe MANCHA: una galería con pocos artistas a la vez, tres piezas cada uno, tres meses por temporada.',
};

export default function SobreManchaPage() {
  return (
    <>
      <Nav />

      <header className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <Splat width="150px" height="130px" top="-30px" right="-40px" color="red" rotate={-12} radius="r2" />
        <Splat width="90px" height="80px" bottom="-30px" left="8%" color="lilac" rotate={14} radius="r3" />
        <div className="wrap">
          <p className="eyebrow">Sobre MANCHA</p>
          <h1 style={{ maxWidth: '18ch' }}>Una galería que elige menos, a propósito.</h1>
        </div>
      </header>

      <section className="content manifesto">
        <div className="wrap" style={{ maxWidth: '720px' }}>
          <p className="lead">MANCHA nació de una incomodidad: el arte joven se muestra hoy en ferias gigantes donde cientos de obras compiten por una mirada de tres segundos. Nos pareció que algo se perdía en ese ruido.</p>

          <p>Por eso construimos lo contrario. Una temporada en MANCHA dura tres meses y tiene pocos artistas — no cientos. Cada uno expone exactamente tres piezas. Ni una más. Esa restricción no es un capricho estético: obliga a cada artista a mostrar lo mejor que tiene, y le da a cada obra el espacio para ser vista de verdad.</p>

          <h2>Cómo funciona</h2>
          <p>Cada pieza tiene una puja mínima y se subasta durante toda la temporada. Quien ofrece más cuando la temporada cierra se lleva la obra. Del valor final, el 75% es para el artista y el 25% sostiene la galería. Sin intermediarios, sin comisiones ocultas, sin letra chica.</p>

          <h2>Cómo elegimos a los artistas</h2>
          <p>No publicamos a cualquiera que se postule. Buscamos una voz que se note, una obra que tenga algo para decir aunque todavía no tenga nombre en el mercado. Muchos de nuestros artistas exponen de forma individual por primera vez. Esa es justamente la idea: ser el lugar donde se los ve antes de que se vuelvan inevitables.</p>

          <h2>Por qué "MANCHA"</h2>
          <p>Una mancha es lo primero que cae sobre el lienzo en blanco — el gesto antes del control, la intención antes de la técnica. También es lo que queda, lo que no se va, lo que marca. Nos gustaba que el nombre significara las dos cosas al mismo tiempo: el comienzo de algo y la huella que deja.</p>

          <p className="closing">El arte no se queda quieto. Tú tampoco tienes por qué hacerlo.</p>

          <div className="manifesto-ctas">
            <Link href="/#artistas" className="btn-primary">Ver la temporada actual</Link>
            <Link href="/postular" className="btn-ghost">Postular como artista</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
