import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import Toast from '@/components/Toast';
import SubmitButton from '@/components/SubmitButton';
import { createClient } from '@/utils/supabase/server';
import { submitApplication } from './actions';

export const metadata = {
  title: 'MANCHA — No publicamos arte. Elegimos artistas.',
  description: 'MANCHA no es una vitrina abierta a cualquiera. Postula y entérate si tu trabajo tiene un lugar en la próxima temporada.',
};

export default async function PostularPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { count: artistCount } = await supabase
    .from('artists')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved');

  return (
    <>
      <Nav />

      <header className="page-header postular-header-dark">
        <Splat width="200px" height="175px" top="-55px" right="-40px" color="lilac" rotate={10} radius="r1" />
        <Splat width="110px" height="95px" bottom="-30px" left="-30px" color="yellow" rotate={-12} radius="r3" />
        <Splat width="70px" height="60px" top="55%" left="5%" color="red" rotate={6} radius="r4" />
        <Splat width="60px" height="55px" top="-30px" left="40%" color="red" rotate={-8} radius="r2" />
        <Splat width="55px" height="50px" bottom="-25px" right="25%" color="yellow" rotate={14} radius="r1" />
        <div className="wrap">
          <p className="eyebrow">Acceso por postulación</p>
          <h1>No publicamos arte.<br />Elegimos artistas.</h1>
          <p className="sub">MANCHA no es una vitrina abierta a cualquiera. Cada temporada, un grupo muy reducido entra — el resto espera la próxima. {artistCount ? `Hoy mismo, solo ${artistCount} ${artistCount === 1 ? 'artista tiene' : 'artistas tienen'} un lugar.` : 'Esta temporada recién empieza a llenarse.'} Si tu trabajo entra, no compartes página con miles de perfiles iguales — tienes la tuya, sola, durante tres meses completos.</p>
        </div>
      </header>

      <Toast success={params?.success} error={params?.error} />

      <section className="content">
        <Splat width="130px" height="115px" top="6%" right="-40px" color="yellow" rotate={-10} radius="r2" />
        <Splat width="85px" height="75px" top="48%" left="-35px" color="lilac" rotate={14} radius="r3" />
        <div className="wrap" style={{ maxWidth: 640 }}>
          <div className="dash-card">
            <h3>Tu turno de convencernos</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--ink-soft)', marginBottom: 20 }}>Sin currículum de galerías ni jerga de portfolio. Solo tu trabajo, dicho simple.</p>
            <form action={submitApplication}>
              <div className="field">
                <label htmlFor="full_name">Nombre</label>
                <input id="full_name" name="full_name" type="text" required />
              </div>
              <div className="field">
                <label htmlFor="instagram">Instagram</label>
                <input id="instagram" name="instagram" type="text" placeholder="@tu_usuario" />
              </div>
              <div className="field">
                <label htmlFor="email">Correo</label>
                <input id="email" name="email" type="email" required />
              </div>
              <div className="field">
                <label htmlFor="city">Ciudad</label>
                <input id="city" name="city" type="text" placeholder="Ciudad, país" />
              </div>
              <div className="field">
                <label htmlFor="portfolio_url">Portfolio o sitio web</label>
                <input id="portfolio_url" name="portfolio_url" type="url" placeholder="https://" />
              </div>
              <div className="field">
                <label htmlFor="bio">Biografía</label>
                <textarea id="bio" name="bio" rows={4} required placeholder="Quién eres, qué técnica trabajas, qué te mueve a pintar."></textarea>
              </div>

              <div className="photo-guidelines">
                <p>3 imágenes de tus obras</p>
                <ul>
                  <li>La obra sola, sin marco ni pared alrededor, bien iluminada.</li>
                  <li>Puedes postular con solo 1 o 2 si todavía no tienes las tres — no es obligatorio completar las tres.</li>
                </ul>
              </div>
              <div className="field">
                <label htmlFor="image_1">Imagen 1</label>
                <input id="image_1" name="image_1" type="file" accept="image/*" />
              </div>
              <div className="field">
                <label htmlFor="image_2">Imagen 2</label>
                <input id="image_2" name="image_2" type="file" accept="image/*" />
              </div>
              <div className="field">
                <label htmlFor="image_3">Imagen 3</label>
                <input id="image_3" name="image_3" type="file" accept="image/*" />
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 6 }}>Máximo 8 MB por imagen.</p>
              </div>

              <SubmitButton pendingText="Enviando postulación...">Enviar postulación</SubmitButton>
            </form>
          </div>

          <div className="commission-card" style={{ marginTop: 28 }}>
            <div>
              <p className="eyebrow">Cómo se reparte una venta</p>
              <div className="split">
                <div className="for-artist"><b>75%</b><span>Para el artista</span></div>
                <div className="for-mancha"><b>25%</b><span>Comisión MANCHA</span></div>
              </div>
              <p className="small">Sin costo por postular, sin costo por exponer. Solo cobramos cuando se cierra una subasta.</p>
            </div>
          </div>

          <div className="faq" style={{ marginTop: 40 }}>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2>Antes de postular</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h4>¿Qué pasa después de postular?</h4>
                <p>Revisamos tu trabajo. Si entras a la próxima temporada, te escribimos por correo para que crees tu cuenta de artista y cargues tus piezas directo, sin pasar por otra revisión.</p>
              </div>
              <div className="faq-item">
                <h4>¿Cuántos artistas entran por temporada?</h4>
                <p>Un grupo chico — preferimos darle espacio real a pocos antes que diluir a muchos en la misma página.</p>
              </div>
              <div className="faq-item">
                <h4>¿Qué pasa si una pieza no recibe pujas que superen el mínimo?</h4>
                <p>La pieza no se vende al cerrar la temporada y puedes incluirla en una próxima postulación.</p>
              </div>
              <div className="faq-item">
                <h4>¿Quién se queda con el envío y el embalaje?</h4>
                <p>Eso se conversa al confirmar la venta — todavía no está automatizado, lo coordinamos por correo con cada artista.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
