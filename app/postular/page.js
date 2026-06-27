import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import Toast from '@/components/Toast';
import SubmitButton from '@/components/SubmitButton';
import { createClient } from '@/utils/supabase/server';
import { submitApplication } from './actions';
import Countdown from '@/components/Countdown';
import { isPreLaunch, isConvocatoria } from '@/lib/fase';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'MANCHA — Solicitar acceso. Temporada 01.',
  description: 'MANCHA selecciona a mano un grupo reducido de artistas cada temporada. Sin costo por solicitar, sin costo por exponer. Solo tu trabajo.',
};

export default async function PostularPage({ searchParams }) {
  if (isPreLaunch()) redirect('/');
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
      <ScrollReveal />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="page-header postular-header-dark">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>Temporada 01 · Acceso restringido</p>
          <h1>No publicamos arte.<br />Elegimos artistas.</h1>
          <p className="sub">
            MANCHA no acepta todo. Cada temporada, un grupo entra.
            {artistCount ? ` Hoy mismo, solo ${artistCount} ${artistCount === 1 ? 'artista tiene' : 'artistas tienen'} un lugar.` : ''}
            {' '}Si tu trabajo entra, tienes tu propio espacio — solo, durante tres meses completos.
          </p>
          {convocatoria ? (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(250,247,240,0.5)', marginTop: 20 }}>
              La convocatoria abre el 1 de agosto y cierra el 31. La Temporada 01 arranca el 1 de septiembre de 2026.
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
            <li>Sin costo por solicitar</li>
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
          <p className="eyebrow">El proceso</p>
          <h2>Así funciona.</h2>
          <div className="steps-row">
            <div className="step-col">
              <span className="step-n">01</span>
              <p>Envías tu trabajo. Sin CV de galerías, sin portfolio perfectamente armado. Solo lo que has hecho, dicho en tus palabras.</p>
            </div>
            <div className="step-col">
              <span className="step-n">02</span>
              <p>Lo revisamos. Una persona, no un algoritmo. Si tu trabajo entra, te escribimos directamente con los próximos pasos.</p>
            </div>
            <div className="step-col">
              <span className="step-n">03</span>
              <p>Expones tres piezas. Tu propio espacio durante toda la temporada. Los coleccionistas pujan en vivo — sin intermediarios.</p>
            </div>
            <div className="step-col">
              <span className="step-n">04</span>
              <p>Cobras. <strong>El 75%</strong> de cada venta va directo a ti. MANCHA coordina el resto — envío, comunicación, logística.</p>
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
        <div className="wrap" style={{ maxWidth: 660 }}>
          <div className="postular-card">

            <div className="postular-card-head">
              <h3>Tu trabajo primero.</h3>
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
                <SubmitButton className="postular-submit" pendingText="Enviando solicitud…">
                  Solicitar acceso →
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
            <h2>Antes de solicitar</h2>
            <div className="faq-list">
              <div className="faq-item">
                <h4>¿Qué significa que la selección es a mano?</h4>
                <p>Una persona lee tu solicitud. Revisa tu trabajo, mira tus imágenes, lee lo que escribiste. No hay filtro automático, no hay puntaje de seguidores. Si algo en tu obra nos detiene, entramos en contacto.</p>
              </div>
              <div className="faq-item">
                <h4>¿Cuántos artistas entran por temporada?</h4>
                <p>Un grupo pequeño — preferimos darle espacio real a pocos antes que diluir a muchos. Si tu solicitud no entra en esta temporada, queda registrada para la siguiente.</p>
              </div>
              <div className="faq-item">
                <h4>¿Qué pasa si una pieza no se vende?</h4>
                <p>La pieza cierra la temporada sin venta y puedes incluirla de nuevo en la siguiente. El riesgo es cero: solicitar es gratis, exponer es gratis. Solo cobramos si hay una venta.</p>
              </div>
              <div className="faq-item">
                <h4>¿Cuánto cuesta solicitar acceso?</h4>
                <p>Nada. Solicitar es gratis, exponer es gratis. MANCHA cobra el 25% solo cuando se cierra una venta — nunca antes, nunca por adelantado.</p>
              </div>
              <div className="faq-item">
                <h4>¿Puedo solicitar si nunca expuse en ningún lado?</h4>
                <p>Sí — de hecho eso es exactamente lo que buscamos. Muchos de los artistas que elegimos exponen en forma individual por primera vez aquí. La historia previa no es el criterio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
