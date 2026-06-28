import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Splat from '@/components/Splat';
import Footer from '@/components/Footer';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  return {
    title: t('beforeWorldTitle'),
    description: t('beforeWorldDesc'),
    openGraph: { title: t('beforeWorldTitle'), description: t('beforeWorldDesc'), type: 'website' },
  };
}

export default async function AntesQueElMundoPage() {
  const t = await getTranslations('collectorManifesto');
  const PRINCIPIOS = [
    { n: '01', titulo: t('p1Titulo'), cuerpo: t('p1Cuerpo') },
    { n: '02', titulo: t('p2Titulo'), cuerpo: t('p2Cuerpo') },
    { n: '03', titulo: t('p3Titulo'), cuerpo: t('p3Cuerpo') },
    { n: '04', titulo: t('p4Titulo'), cuerpo: t('p4Cuerpo') },
  ];
  return (
    <>
      <Nav />

      {/* ── INTRO OSCURA ──────────────────────────────────── */}
      <section className="mf-hero">
        <Splat width="260px" height="220px" top="-70px" right="-60px" color="yellow" rotate={-16} radius="r2" />
        <Splat width="140px" height="120px" bottom="-50px" left="-35px" color="lilac" rotate={12} radius="r3" />
        <Splat width="80px" height="70px" top="45%" left="8%" color="red" rotate={7} radius="r1" />
        <div className="wrap mf-hero-inner">
          <p className="eyebrow mf-eyebrow">{t('heroKicker')}</p>
          <h1 className="mf-hero-title">
            {t('heroTitle1')}<br />
            <em>{t('heroTitleEm')}</em><br />
            {t('heroTitle3')}
          </h1>
          <p className="mf-hero-sub">{t('heroSub')}</p>
        </div>
      </section>

      {/* ── APERTURA ─────────────────────────────────────── */}
      <section className="mf-apertura">
        <div className="wrap mf-apertura-inner">
          <p className="mf-apertura-texto">{t('aperturaP1')}</p>
          <p className="mf-apertura-texto mf-apertura-acento">{t('aperturaP2')}</p>
        </div>
      </section>

      {/* ── FRASE CENTRAL ────────────────────────────────── */}
      <section className="mf-cita">
        <Splat width="200px" height="175px" top="-55px" left="-45px" color="yellow" rotate={14} radius="r4" />
        <Splat width="120px" height="105px" bottom="-40px" right="-30px" color="lilac" rotate={-10} radius="r2" />
        <div className="wrap mf-cita-inner">
          <blockquote className="mf-cita-quote">
            {t('quote1')}<br />
            <span className="mf-cita-acento">{t('quoteAccent')}</span>
          </blockquote>
        </div>
      </section>

      {/* ── LO QUE SIGNIFICA ─────────────────────────────── */}
      <section className="mf-significado">
        <div className="wrap">
          <div className="mf-significado-grid">
            <div className="mf-significado-col">
              <p className="eyebrow mf-sig-eyebrow">{t('sigWhatLabel')}</p>
              <p className="mf-sig-texto">{t('sigWhatP1')}</p>
              <p className="mf-sig-texto">{t('sigWhatP2')}</p>
            </div>
            <div className="mf-significado-col">
              <p className="eyebrow mf-sig-eyebrow">{t('sigWhereLabel')}</p>
              <p className="mf-sig-texto">{t('sigWhereP1')}</p>
              <p className="mf-sig-texto">{t('sigWhereP2')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRINCIPIOS ───────────────────────────────────── */}
      <section className="mf-principios">
        <Splat width="180px" height="155px" top="-45px" right="-40px" color="red" rotate={-12} radius="r1" />
        <Splat width="90px" height="80px" bottom="-30px" left="10%" color="yellow" rotate={9} radius="r3" />
        <div className="wrap">
          <p className="eyebrow mf-eyebrow-dark">{t('principlesLabel')}</p>
          <div className="mf-principios-lista">
            {PRINCIPIOS.map((p) => (
              <div className="mf-principio" key={p.n}>
                <span className="mf-principio-n">{p.n}</span>
                <div className="mf-principio-body">
                  <h3 className="mf-principio-titulo">{p.titulo}</h3>
                  <p className="mf-principio-texto">{p.cuerpo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LA MARCA QUE DEJA ────────────────────────────── */}
      <section className="mf-huella">
        <div className="wrap mf-huella-inner">
          <p className="eyebrow" style={{ color: 'rgba(250,243,230,0.4)', marginBottom: 28 }}>{t('huellaLabel')}</p>
          <h2 className="mf-huella-titulo">
            {t('huellaTitle1')}<br />
            <em>{t('huellaTitleEm')}</em>
          </h2>
          <div className="mf-huella-cols">
            <p className="mf-huella-texto">{t('huellaP1')}</p>
            <p className="mf-huella-texto">{t('huellaP2')}</p>
          </div>
        </div>
      </section>

      {/* ── LLAMADO ──────────────────────────────────────── */}
      <section className="mf-llamado">
        <Splat width="160px" height="140px" top="-45px" left="-35px" color="lilac" rotate={11} radius="r2" />
        <Splat width="100px" height="88px" bottom="-35px" right="-25px" color="red" rotate={-9} radius="r4" />
        <Splat width="65px" height="58px" top="30%" right="8%" color="yellow" rotate={6} radius="r1" />
        <div className="wrap mf-llamado-inner">
          <p className="mf-llamado-pre">{t('llamadoPre')}</p>
          <h2 className="mf-llamado-titulo">
            {t('llamadoTitle1')}<br />
            <em>{t('llamadoTitleEm')}</em>
          </h2>
          <p className="mf-llamado-sub">{t('llamadoSub')}</p>
          <div className="mf-llamado-ctas">
            <Link href="/para-coleccionistas" className="btn-primary mf-btn-postular">
              {t('ctaPrimary')}
            </Link>
            <Link href="/notas" className="mf-llamado-ghost">
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FIRMA ────────────────────────────────────────── */}
      <section className="mf-firma">
        <div className="wrap mf-firma-inner">
          <div className="mf-firma-linea" />
          <p className="mf-firma-texto">{t('firmaText')}</p>
          <p className="mf-firma-brand">MANCHA.</p>
        </div>
      </section>

      <Footer />
    </>
  );
}
