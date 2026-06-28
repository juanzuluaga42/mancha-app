import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import SoloArtista from '@/components/SoloArtista';
import { createClient } from '@/utils/supabase/server';
import { isPreLaunch, isConvocatoria } from '@/lib/fase';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  return { title: t('aboutTitle'), description: t('aboutDesc') };
}

export default async function SobreManchaPage() {
  const prelaunch = isPreLaunch();
  const convocatoria = isConvocatoria() || prelaunch;
  const t = await getTranslations('about');

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let isArtist = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    isArtist = profile?.role === 'artist';
  }

  return (
    <>
      <Nav />
      <ScrollReveal />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="sobre-hero">
        <div className="wrap sobre-hero-inner">
          <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>{t('heroKicker')}</p>
          <h1 className="sobre-hero-title">
            {t('heroTitle1')}<br />
            {t('heroTitle2')}<br />
            <em>{t('heroTitleEm')}</em>
          </h1>
          <p className="sobre-hero-sub">
            {t('heroSub1')}<br />
            {t('heroSub2')}
          </p>
        </div>
      </section>

      {/* ── NÚMEROS ──────────────────────────────────────── */}
      <section className="sobre-numbers">
        <div className="wrap">
          <div className="sobre-numbers-grid">
            <div className="sobre-number-item">
              <b className="sobre-number-dig sobre-number-word">{t('num1Big')}</b>
              <p className="sobre-number-label">{t('num1Label')}</p>
              <p className="sobre-number-note">{t('num1Note')}</p>
            </div>
            <div className="sobre-number-item">
              <b className="sobre-number-dig">3</b>
              <p className="sobre-number-label">{t('num2Label')}</p>
              <p className="sobre-number-note">{t('num2Note')}</p>
            </div>
            <div className="sobre-number-item sobre-number-last">
              <b className="sobre-number-dig">3</b>
              <p className="sobre-number-label">{t('num3Label')}</p>
              <p className="sobre-number-note">{t('num3Note')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MANIFIESTO ───────────────────────────────────── */}
      <section className="sobre-manifiesto">
        <div className="wrap sobre-manifiesto-inner">
          <p className="sobre-manifiesto-big">{t('manifBig1')}</p>
          <p className="sobre-manifiesto-body">{t('manifBody1')}</p>
          <div className="sobre-manifiesto-divisor" />
          <p className="sobre-manifiesto-big">{t('manifBig2')}</p>
          <p className="sobre-manifiesto-body">{t('manifBody2')}</p>
        </div>
      </section>

      {/* ── EL FILTRO (solo artista) ─────────────────────── */}
      <SoloArtista isArtist={isArtist}>
        <section className="el-filtro">
          <div className="wrap el-filtro-wrap">
            <h2 className="el-filtro-title">{t('filterTitle1')}<br />{t('filterTitle2')}</h2>
            <div className="el-filtro-body">
              <p>{t('filterP1')}</p>
              <p>{t('filterP2')}</p>
            </div>
          </div>
        </section>
      </SoloArtista>

      {/* ── CÓMO FUNCIONA / SIN CUOTAS (solo artista) ───── */}
      <SoloArtista isArtist={isArtist}>
      {convocatoria ? (
        <section className="sobre-puja">
          <div className="wrap sobre-puja-inner sobre-puja-single">
            <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>{t('pujaConvKicker')}</p>
            <h2 className="sobre-puja-title">{t('pujaConvTitle')}</h2>
            <p className="sobre-puja-body">{t('pujaConvP1')}</p>
            <p className="sobre-puja-body">{t('pujaConvP2')}</p>
          </div>
        </section>
      ) : (
        <section className="sobre-puja">
          <div className="wrap sobre-puja-inner sobre-puja-single">
            <p className="eyebrow" style={{ color: 'var(--yellow-deep)' }}>{t('pujaDefKicker')}</p>
            <h2 className="sobre-puja-title">{t('pujaDefTitle')}</h2>
            <p className="sobre-puja-body">{t('pujaDefP1')}</p>
            <p className="sobre-puja-body">{t('pujaDefP2')}</p>
          </div>
        </section>
      )}
      </SoloArtista>

      {/* ── POR QUÉ "MANCHA" ─────────────────────────────── */}
      <section className="sobre-etymology">
        <div className="wrap sobre-etymology-inner">
          <p className="eyebrow">{t('etymKicker')}</p>
          <blockquote className="sobre-etymology-quote">{t('etymQuote')}</blockquote>
          <p className="sobre-etymology-body">{t('etymBody')}</p>
        </div>
      </section>

      {/* ── MANIFIESTO DE COLECCIONISTAS (público) ───────── */}
      <section className="sobre-etymology">
        <div className="wrap sobre-etymology-inner">
          <p className="eyebrow">{t('collectorsKicker')}</p>
          <blockquote className="sobre-etymology-quote">{t('collectorsQuote')}</blockquote>
          <p className="sobre-etymology-body">{t('collectorsBody')}</p>
          <Link href="/antes-que-el-mundo" className="sobre-closing-ghost" style={{ display: 'inline-block', marginTop: 18 }}>
            {t('collectorsLink')} →
          </Link>
        </div>
      </section>

      {/* ── CIERRE / CONVOCATORIA (solo artista) ─────────── */}
      <SoloArtista isArtist={isArtist}>
      <section className="sobre-closing">
        <div className="wrap sobre-closing-inner">
          {prelaunch ? (
            <>
              <p className="sobre-closing-line">{t('closePreLine')}</p>
              <p className="sobre-closing-line sobre-closing-accent">{t('closeSeasonAccent')}</p>
              <div className="sobre-closing-ctas">
                <Link href="/registro" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                  {t('ctaApply')}
                </Link>
                <Link href="/manifiesto" className="sobre-closing-ghost">
                  {t('ctaCriteria')}
                </Link>
              </div>
            </>
          ) : convocatoria ? (
            <>
              <p className="sobre-closing-line">{t('closeConvLine')}</p>
              <p className="sobre-closing-line sobre-closing-accent">{t('closeSeasonAccent')}</p>
              <div className="sobre-closing-ctas">
                <Link href="/postular" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                  {t('ctaApply')}
                </Link>
                <Link href="/manifiesto" className="sobre-closing-ghost">
                  {t('ctaCriteria')}
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="sobre-closing-line">{t('closeActiveLine')}</p>
              <p className="sobre-closing-line sobre-closing-accent">{t('closeActiveAccent')}</p>
              <div className="sobre-closing-ctas">
                <Link href="/seleccionados" className="btn-primary" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                  {t('ctaSelected')}
                </Link>
                <Link href="/postular" className="sobre-closing-ghost">
                  {t('ctaApplyArtist')}
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
      </SoloArtista>

      <Footer />
    </>
  );
}
