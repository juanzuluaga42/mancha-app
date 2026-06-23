import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import Toast from '@/components/Toast';
import SubmitButton from '@/components/SubmitButton';
import { createClient } from '@/utils/supabase/server';
import { submitApplication } from './actions';
import Countdown from '@/components/Countdown';
import { isConvocatoria } from '@/lib/fase';

export const metadata = {
  title: 'MANCHA — No publicamos arte. Elegimos artistas.',
  description: 'MANCHA selecciona a mano un grupo reducido cada temporada. Sin costo por postular, sin costo por exponer. Solo tu trabajo.',
};

export default async function PostularPage({ searchParams }) {
  const params = await searchParams;
  const convocatoria = isConvocatoria();
  const supabase = await createClient();
  const { count: artistCount } = await supabase
    .from('artists')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'approved');
  const { data: season } = convocatoria
    ? { data: null }
    : await supabase.from('seasons').select('ends_at').eq('is_current', true).maybeSingle();

  return (
    <>
      <Nav />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="page-header postular-header-dark">
        <Splat width="200px" height="175px" top="-55px" right="-40px" color="lilac" rotate={10} radius="r1" />
        <Splat width="110px" height="95px" bottom="-30px" left="-30px" color="yellow" rotate={-12} radius="r3" />
        <Splat width="70px" height="60px" top="55%" left="5%" color="red" rotate={6} radius="r4" />
        <Splat width="60px" height="55px" top="-30px" left="40%" color="red" rotate={-8} radius="r2" />
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>Acceso por postulación</p>
          <h1>No publicamos arte.<br />Elegimos artistas.</h1>
          <p className="sub">
            MANCHA no acepta todo. Cada temporada, un grupo entra.
            {artistCount ? ` Hoy mismo, solo ${artistCount} ${artistCount === 1 ? 'artista tiene' : 'artistas tienen'} un lugar.` : ''}
            {' '}Si tu trabajo entra, tienes tu propio espacio — solo, durante tres meses completos.
          </p>
          {convocatoria ? (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(250,247,240,0.5)', marginTop: 20 }}>
              La convocatoria cierra el 1 de julio de 2026. La Temporada 01 abre el 1 de agosto.
            </p>
          ) : season?.ends_at ? (
            <div style={{ marginTop: 24 }}>
              <Countdown endsAt={season.ends_at} />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, textTransform: 'uppercase', color: 'rgba(250,247,240,0.45)', marginTop: 8 }}>
                Tiempo restante esta temporada — si no llegas, tu postulación queda para la siguiente.
              </p>
            </div>
          ) : null}
          <ul className="postular-trust">
            <li>Sin costo por postular</li>
            <li>Sin costo por exponer</li>
            <li>75% de cada venta para ti</li>
          </ul>
        </div>
      </header>

      <Toast success={params?.success} error={params?.error} />

      {/* ── EL FILTRO ────────────────────────────────────── */}
      <section className="el-filtro">
        <div className="wrap el-filtro-wrap">
          <h2 className="el-filtro-title">No miramos tus seguidores.<br />Miramos tu obra.</h2>
          <div className="el-filtro-body">
            <p>
              Cada postulación la revisa una persona, no un algoritmo. No nos importa si tienes mil seguidores o ninguno,
              si vienes de una academia o aprendiste solo. Nos importa una sola cosa: que la obra tenga algo que el resto todavía no vio.
            </p>
            <p>
              La mayoría de las postulaciones no entran. No por castigo — por estándar.
              Cada artista que aceptamos lleva el nombre de MANCHA con él.
            </p>
          </div>
          <Link href="/criterio" className="el-filtro-link">Leer el criterio completo →</Link>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────── */}
      <section className="como-funciona">
        <div className="wrap">
          <p className="eyebrow">Cómo funciona para artistas</p>
          <h2>Así funciona.</h2>
          <div className="steps-row">
            <div className="step-col">
              <span className="step-n">01</span>
              <p>Postulas en minutos: sin CV de galerías, sin jerga. Solo tu trabajo y quién eres, en tus palabras.</p>
            </div>
            <div className="step-col">
              <span className="step-n">02</span>
              <p>Lo revisamos a mano. Si tu trabajo entra, te escribimos por correo con los pasos para crear tu perfil.</p>
            </div>
            <div className="step-col">
              <span className="step-n">03</span>
              <p>Expones hasta tres piezas con tu propio espacio durante toda la temporada. Los coleccionistas pujan en vivo.</p>
            </div>
            <div className="step-col">
              <span className="step-n">04</span>
              <p>Cuando una pieza se vende, <strong>recibes el 75%</strong> de la puja ganadora. El envío lo coordinamos contigo directamente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMISIÓN ─────────────────────────────────────── */}
      <div className="postular-commission-wrap">
        <div className="wrap" style={{ maxWidth: 680 }}>
          <div className="commission-card postular-commission-card">
            <p className="eyebrow" style={{ color: 'rgba(250,243,230,0.55)' }}>Cómo se reparte una venta</p>
            <div className="split">
              <div className="for-artist"><b>75%</b><span>Para ti</span></div>
              <div className="for-mancha"><b>25%</b><span>Comisión MANCHA</span></div>
            </div>
            <p className="small">Sin costo por postular, sin costo por exponer. Solo cobramos si se cierra una venta — nunca antes.</p>
          </div>
        </div>
      </div>

      {/* ── FORMULARIO ───────────────────────────────────── */}
      <section className="postular-form-section">
        <Splat width="130px" height="115px" top="4%" right="-40px" color="yellow" rotate={-10} radius="r2" />
        <Splat width="85px" height="75px" top="52%" left="-35px" color="lilac" rotate={14} radius="r3" />

        <div className="wrap" style={{ maxWidth: 660 }}>
          <div className="postular-card">

            <div className="postular-card-head">
              <h3>Muéstranos tu obra.</h3>
              <p>Sin currículum de galerías ni jerga de portfolio.<br />Solo tu trabajo, dicho en tus palabras.</p>
            </div>

            <form action={submitApplication} className="postular-form-inner">

              {/* 01 — Tu perfil */}
              <div className="form-section">
                <div className="form-section-head">
                  <span className="form-section-n">01</span>
                  <span className="form-section-title">Tu perfil</span>
                </div>

                <div className="form-row-2">
                  <div className="field">
                    <label htmlFor="full_name">
                      Nombre <span className="field-req">*</span>
                    </label>
                    <input
                      id="full_name" name="full_name" type="text" required
                      placeholder="Tu nombre artístico o real"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="email">
                      Correo <span className="field-req">*</span>
                    </label>
                    <input
                      id="email" name="email" type="email" required
                      placeholder="donde te escribimos si entras"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="field">
                    <label htmlFor="instagram">
                      Instagram <span className="field-opt">opcional</span>
                    </label>
                    <input id="instagram" name="instagram" type="text" placeholder="@tu_usuario" />
                  </div>
                  <div className="field">
                    <label htmlFor="city">
                      Ciudad <span className="field-opt">opcional</span>
                    </label>
                    <input id="city" name="city" type="text" placeholder="Ciudad, país" />
                  </div>
                </div>
              </div>

              {/* 02 — Tu trabajo */}
              <div className="form-section">
                <div className="form-section-head">
                  <span className="form-section-n">02</span>
                  <span className="form-section-title">Tu trabajo</span>
                </div>

                <div className="field">
                  <label htmlFor="bio">
                    ¿Quién eres y qué haces? <span className="field-req">*</span>
                  </label>
                  <textarea
                    id="bio" name="bio" rows={5} required
                    placeholder="Qué técnica trabajas, de dónde viene tu trabajo, qué te mueve. No hace falta sonar como un artista — escribe como hablas. Eso es exactamente lo que queremos leer."
                  />
                  <p className="field-hint">Esto es lo primero que leemos. Sé específico/a.</p>
                </div>

                <div className="field">
                  <label htmlFor="portfolio_url">
                    Portfolio o sitio web <span className="field-opt">opcional</span>
                  </label>
                  <input
                    id="portfolio_url" name="portfolio_url" type="url"
                    placeholder="https://"
                  />
                  <p className="field-hint">Un link a tu Instagram también sirve si ahí está tu trabajo.</p>
                </div>
              </div>

              {/* 03 — Tus obras */}
              <div className="form-section">
                <div className="form-section-head">
                  <span className="form-section-n">03</span>
                  <span className="form-section-title">Tus obras</span>
                </div>
                <p className="form-section-note">
                  Entre 1 y 3 imágenes de trabajos que quieras mostrar. La obra sola, bien iluminada, sin marco ni pared alrededor. Máximo 8 MB por imagen.
                </p>

                <div className="upload-grid">
                  {[
                    { n: 1, label: 'Primera obra', hint: 'Obligatoria' },
                    { n: 2, label: 'Segunda obra', hint: 'Opcional' },
                    { n: 3, label: 'Tercera obra', hint: 'Opcional' },
                  ].map(({ n, label, hint }) => (
                    <label key={n} className="upload-zone" htmlFor={`image_${n}`}>
                      <svg className="upload-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <span className="upload-zone-label">{label}</span>
                      <span className="upload-zone-hint">{hint}</span>
                      <input
                        id={`image_${n}`} name={`image_${n}`}
                        type="file" accept="image/*"
                        className="upload-input"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="postular-submit-wrap">
                <SubmitButton className="postular-submit" pendingText="Enviando postulación…">
                  Enviar postulación →
                </SubmitButton>
                <p className="postular-submit-note">
                  Te confirmamos por correo al instante. Si tu trabajo entra, te avisamos antes de que empiece la próxima temporada.
                </p>
              </div>

            </form>
          </div>

          {/* ── FAQ ──────────────────────────────────────── */}
          <div className="faq" style={{ marginTop: 56 }}>
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2>Antes de postular</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h4>¿Qué pasa después de postular?</h4>
                <p>Revisamos tu trabajo a mano. Si entras a la próxima temporada, te escribimos por correo para que crees tu cuenta de artista y cargues tus piezas directamente, sin pasar por otra revisión.</p>
              </div>
              <div className="faq-item">
                <h4>¿Cuántos artistas entran por temporada?</h4>
                <p>Un grupo pequeño — preferimos darle espacio real a pocos antes que diluir a muchos en la misma página. Si no entraste en esta, tu postulación queda para la siguiente.</p>
              </div>
              <div className="faq-item">
                <h4>¿Qué pasa si una pieza no recibe pujas?</h4>
                <p>La pieza no se vende al cerrar la temporada y puedes incluirla de nuevo en la próxima postulación. El riesgo es cero: no te cobramos nada por exponer.</p>
              </div>
              <div className="faq-item">
                <h4>¿Quién se encarga del envío?</h4>
                <p>Lo coordinamos contigo por correo una vez confirmada la venta. Todavía no está automatizado — lo hacemos de forma directa con cada artista.</p>
              </div>
              <div className="faq-item">
                <h4>¿Puedo postular si nunca expuse en ningún lado?</h4>
                <p>Sí — de hecho eso es exactamente lo que buscamos. Muchos de los artistas que elegimos exponen en forma individual por primera vez aquí.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
