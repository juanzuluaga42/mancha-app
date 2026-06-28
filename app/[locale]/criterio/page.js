import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Splat from '@/components/Splat';
import Footer from '@/components/Footer';


export async function generateMetadata() {
  const t = await getTranslations('meta');
  return { title: t('criteriaTitle'), description: t('criteriaDesc') };
}

export default async function CriterioPage() {
  const t = await getTranslations('criterioPage');
  const PRINCIPIOS = [
    { n: '01', title: t('p1Title'), body: t('p1Body') },
    { n: '02', title: t('p2Title'), body: t('p2Body') },
    { n: '03', title: t('p3Title'), body: t('p3Body') },
    { n: '04', title: t('p4Title'), body: t('p4Body') },
  ];

  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="criterio-header">
        <Splat width="200px" height="175px" top="-55px" right="-40px" color="red" rotate={-12} radius="r2" />
        <Splat width="110px" height="96px" bottom="-35px" left="-28px" color="yellow" rotate={14} radius="r4" />
        <Splat width="66px" height="58px" top="42%" left="6%" color="lilac" rotate={8} radius="r1" />
        <div className="wrap">
          <p className="criterio-eyebrow">{t('eyebrow')}</p>
          <h1 className="criterio-title">
            {t('title1')}<br />
            <em>{t('titleEm')}</em>
          </h1>
          <p className="criterio-sub">{t('sub')}</p>
        </div>
      </header>

      {/* ── INTRO ────────────────────────────────────────── */}
      <section className="criterio-intro">
        <div className="wrap criterio-intro-wrap">
          <p className="criterio-intro-text">{t('introText')}</p>
        </div>
      </section>

      {/* ── PRINCIPIOS ───────────────────────────────────── */}
      <section className="criterio-section">
        <div className="wrap criterio-wrap">
          {PRINCIPIOS.map((p) => (
            <div className="criterio-item" key={p.n}>
              <div className="criterio-item-head">
                <span className="criterio-n">{p.n}</span>
                <h2 className="criterio-item-title">{p.title}</h2>
              </div>
              <p className="criterio-item-body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CIERRE ───────────────────────────────────────── */}
      <section className="criterio-closing">
        <Splat width="150px" height="132px" top="-45px" left="-35px" color="lilac" rotate={10} radius="r3" />
        <Splat width="90px" height="80px" bottom="-28px" right="-22px" color="red" rotate={-12} radius="r1" />
        <div className="wrap criterio-closing-inner">
          <p className="criterio-closing-line">{t('closeLine')}</p>
          <p className="criterio-closing-accent">{t('closeAccent')}</p>
          <Link href="/postular" className="criterio-closing-btn">{t('closeBtn')}</Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
