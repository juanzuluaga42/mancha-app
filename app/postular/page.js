import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';

export const metadata = { title: 'MANCHA — Postula como artista' };

export default function PostularPage() {
  return (
    <>
      <Nav />

      <header className="page-header">
        <Splat width="200px" height="175px" top="-55px" right="-40px" color="lilac" rotate={10} radius="r1" />
        <Splat width="110px" height="95px" bottom="-30px" left="-30px" color="yellow" rotate={-12} radius="r3" />
        <Splat width="70px" height="60px" top="55%" left="5%" color="red" rotate={6} radius="r4" />
        <Splat width="60px" height="55px" top="-30px" left="40%" color="red" rotate={-8} radius="r2" />
        <Splat width="55px" height="50px" bottom="-25px" right="25%" color="yellow" rotate={14} radius="r1" />
        <div className="wrap">
          <p className="eyebrow">Para artistas</p>
          <h1>Postula, exhibe, vende.</h1>
          <p className="sub">Le damos espacio real a pocos artistas por temporada. Si tu trabajo entra, tienes tu propio rincón del catálogo durante tres meses.</p>
        </div>
      </header>

      <section className="content">
        <Splat width="130px" height="115px" top="6%" right="-40px" color="yellow" rotate={-10} radius="r2" />
        <Splat width="85px" height="75px" top="48%" left="-35px" color="lilac" rotate={14} radius="r3" />
        <Splat width="95px" height="85px" bottom="8%" right="-30px" color="red" rotate={-6} radius="r4" />
        <Splat width="55px" height="50px" bottom="-25px" left="30%" color="lilac" rotate={10} radius="r1" />
        <div className="wrap">
          <div className="content-grid">
            <div className="steps">
              <div className="step">
                <span className="step-n">01</span>
                <div className="step-text">
                  <h4>Creas tu cuenta de artista</h4>
                  <p>Te registras eligiendo "soy artista" y completas tu bio, técnica y ubicación.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-n">02</span>
                <div className="step-text">
                  <h4>Elegimos a los artistas de la temporada</h4>
                  <p>Armamos un grupo chico por ciclo — elegir con cuidado es lo que nos diferencia de un catálogo infinito.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-n">03</span>
                <div className="step-text">
                  <h4>Subes hasta 3 piezas</h4>
                  <p>Desde tu cuenta cargas título, técnica, dimensiones y la puja mínima de cada una.</p>
                </div>
              </div>
              <div className="step">
                <span className="step-n">04</span>
                <div className="step-text">
                  <h4>Tus piezas salen a subasta</h4>
                  <p>La gente puja durante toda la temporada y, al cerrar, quien ofreció más se lleva la obra.</p>
                </div>
              </div>
            </div>

            <div className="commission-card">
              <div>
                <p className="eyebrow">Cómo se reparte una venta</p>
                <div className="split">
                  <div className="for-artist"><b>75%</b><span>Para el artista</span></div>
                  <div className="for-mancha"><b>25%</b><span>Comisión MANCHA</span></div>
                </div>
                <p className="small">Sin costo por postular, sin costo por exponer. Solo cobramos cuando se cierra una subasta.</p>
              </div>
              <Link href="/registro?role=artist" className="btn-primary" style={{ textAlign: 'center' }}>Crear cuenta de artista</Link>
            </div>
          </div>

          <div className="faq">
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2>Antes de postular</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h4>¿Cuántos artistas entran por temporada?</h4>
                <p>Un grupo chico — preferimos darle espacio real a pocos antes que diluir a muchos en la misma página.</p>
              </div>
              <div className="faq-item">
                <h4>¿Qué pasa si una pieza no recibe pujas que superen el mínimo?</h4>
                <p>La pieza no se vende al cerrar la temporada y puedes incluirla en una próxima postulación.</p>
              </div>
              <div className="faq-item">
                <h4>¿Puedo cargar mis piezas apenas creo la cuenta?</h4>
                <p>Sí, desde tu cuenta de artista puedes completar tu perfil y subir hasta 3 piezas cuando quieras — nosotros revisamos y confirmamos tu lugar en la temporada.</p>
              </div>
              <div className="faq-item">
                <h4>¿Quién se queda con el envío y el embalaje?</h4>
                <p>Eso se conversa al confirmar la venta — todavía no está automatizado, lo coordinamos por mail con cada artista.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
