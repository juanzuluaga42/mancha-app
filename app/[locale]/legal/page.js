import { getTranslations } from 'next-intl/server';
import Nav from '@/components/Nav';
import Splat from '@/components/Splat';
import Footer from '@/components/Footer';


export const metadata = {
  title: 'MANCHA — Términos y privacidad',
  description: 'Cómo funciona MANCHA, qué datos guardamos y cuáles son las reglas del juego. Sin letra chica.',
};

export default async function LegalPage() {
  const t = await getTranslations('legal');
  const SECCIONES = [
    { id: 'datos', n: '01', titulo: t('s1Title'), texto: [t('s1p1'), t('s1p2')] },
    { id: 'uso', n: '02', titulo: t('s2Title'), texto: [t('s2p1'), t('s2p2'), t('s2p3')] },
    { id: 'pujas', n: '03', titulo: t('s3Title'), texto: [t('s3p1'), t('s3p2')] },
    { id: 'precios', n: '04', titulo: t('s4Title'), texto: [t('s4p1'), t('s4p2')] },
    { id: 'envio', n: '05', titulo: t('s5Title'), texto: [t('s5p1'), t('s5p2')] },
    { id: 'privacidad', n: '06', titulo: t('s6Title'), texto: [t('s6p1'), t('s6p2')] },
    { id: 'contacto', n: '07', titulo: t('s7Title'), texto: [t('s7p1')], link: { href: 'mailto:mancha.gallery@gmail.com', label: 'mancha.gallery@gmail.com' } },
  ];
  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="legal-header">
        <Splat width="200px" height="175px" top="-55px" right="-40px" color="yellow" rotate={-10} radius="r2" />
        <Splat width="120px" height="105px" bottom="-35px" left="-30px" color="lilac" rotate={14} radius="r3" />
        <Splat width="70px" height="62px" top="50%" left="6%" color="red" rotate={8} radius="r4" />
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'rgba(250,243,230,0.45)' }}>{t('eyebrow')}</p>
          <h1 className="legal-header-title">{t('title1')}<br /><em>{t('titleEm')}</em></h1>
          <p className="legal-header-sub">{t('sub')}</p>
          <nav className="legal-nav">
            {SECCIONES.map((s) => (
              <a key={s.id} href={`#${s.id}`}>{s.n} {s.titulo}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── CONTENIDO ────────────────────────────────────── */}
      <div className="legal-body">
        <div className="wrap" style={{ maxWidth: 760 }}>
          {SECCIONES.map((s) => (
            <section className="legal-section" key={s.id} id={s.id}>
              <div className="legal-section-head">
                <span className="legal-n">{s.n}</span>
                <h2 className="legal-h2">{s.titulo}</h2>
              </div>
              <div className="legal-content">
                {s.texto.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {s.link && (
                  <a href={s.link.href} className="legal-link">{s.link.label} →</a>
                )}
              </div>
            </section>
          ))}

          <div className="legal-footer-note">
            <p>{t('footerNote1')}</p>
            <p style={{ marginTop: 8 }}>{t('footerNote2')}</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
