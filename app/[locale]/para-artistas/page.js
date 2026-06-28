import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import Countdown from '@/components/Countdown';
import Toast from '@/components/Toast';
import WaitlistForm from '@/components/WaitlistForm';
import WelcomeModal from '@/components/WelcomeModal';
import ScrollReveal from '@/components/ScrollReveal';
import RoleSwitch from '@/components/RoleSwitch';
import { createClient } from '@/utils/supabase/server';
import { isPreLaunch, isConvocatoria, isTemporadaActiva } from '@/lib/fase';
import { articles } from '@/lib/news';

export const metadata = {
  title: 'MANCHA — Para artistas. Solicitar acceso.',
  description: 'Elegimos artistas emergentes a mano. Sin métricas, sin seguidores. Solo la obra. Postula a la Temporada 01.',
};

const CONV_OPEN_DATE  = '2026-08-01T00:00:00-05:00';
const CONV_CLOSE_DATE = '2026-08-31T00:00:00-05:00';
const LAUNCH_DATE     = '2026-09-01T00:00:00-05:00';

export default async function ParaArtistasPage({ searchParams }) {
  const params = await searchParams;
  const t = await getTranslations('artists');
  const prelaunch = isPreLaunch();
  const convocatoria = isConvocatoria();
  const temporadaActiva = isTemporadaActiva();

  let artistCount = null;
  let season = null;
  if (!prelaunch) {
    const supabase = await createClient();
    const { count } = await supabase.from('artists').select('id', { count: 'exact', head: true }).eq('status', 'approved');
    artistCount = count;
    if (temporadaActiva) {
      const { data: s } = await supabase.from('seasons').select('*').eq('is_current', true).maybeSingle();
      season = s;
    }
  }

  return (
    <>
      <WelcomeModal />
      <Nav />
      <ScrollReveal />
      <Toast success={params?.success} error={params?.error} />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="tsr-hero">
        <div className="wrap tsr-hero-content">
          <p className="tsr-hero-tag">{t('heroTag')}</p>
          <h1 className="tsr-title">
            {convocatoria ? (
              <>
                <span className="tsr-tl">{t('heroConvTitle1')}</span>
                <span className="tsr-tl tsr-tl--em">{t('heroConvTitleEm')}</span>
              </>
            ) : (
              <>
                <span className="tsr-tl">{t('heroDefaultTitle1')}</span>
                <span className="tsr-tl tsr-tl--em">{t('heroDefaultTitleEm')}</span>
              </>
            )}
          </h1>
          <div className="tsr-hero-cd">
            {prelaunch && <Countdown endsAt={CONV_OPEN_DATE} label={t('convOpensIn')} />}
            {convocatoria && <Countdown endsAt={CONV_CLOSE_DATE} label={t('convClosesIn')} />}
            {temporadaActiva && season?.ends_at && <Countdown endsAt={season.ends_at} label={t('seasonClosesIn')} />}
          </div>
          <div className="tsr-ctas">
            {prelaunch ? (
              <>
                <Link href="/registro" className="tsr-cta-primary">{t('ctaNotify')}</Link>
              </>
            ) : convocatoria ? (
              <>
                <Link href="/postular" className="tsr-cta-primary">{t('ctaApply')}</Link>
                <Link href="/criterio" className="tsr-cta-ghost">{t('ctaCriteria')}</Link>
              </>
            ) : (
              <>
                <Link href="/postular" className="tsr-cta-primary">{t('ctaApply')}</Link>
                <Link href="/sobre-mancha" className="tsr-cta-ghost">{t('ctaInstitution')}</Link>
              </>
            )}
          </div>
        </div>
        <div className="tsr-hero-foot">
          <div className="wrap tsr-hero-foot-inner">
            <span>{t('footLeft')}</span>
            <span>
              {prelaunch
                ? t('footConvOpensAug')
                : convocatoria
                  ? t('footSeasonOpensSep')
                  : t('footSeasonInProgress')}
            </span>
          </div>
        </div>
      </header>

      {/* ── NÚMEROS ──────────────────────────────────────── */}
      <section className="tsr-numbers">
        <div className="wrap tsr-numbers-inner">
          <div className="tsr-num-item" data-reveal>
            <b className="tsr-num-dig tsr-num-word">{t('num1Big')}</b>
            <p className="tsr-num-label">{t('num1Label')}</p>
            <p className="tsr-num-note">{t('num1Note')}</p>
          </div>
          <div className="tsr-num-divider" aria-hidden="true" />
          <div className="tsr-num-item" data-reveal data-delay="1">
            <b className="tsr-num-dig">3</b>
            <p className="tsr-num-label">{t('num2Label')}</p>
            <p className="tsr-num-note">{t('num2Note')}</p>
          </div>
          <div className="tsr-num-divider" aria-hidden="true" />
          <div className="tsr-num-item" data-reveal data-delay="2">
            <b className="tsr-num-dig">75%</b>
            <p className="tsr-num-label">{t('num3Label')}</p>
            <p className="tsr-num-note">{t('num3Note')}</p>
          </div>
        </div>
      </section>

      {/* ── MANIFIESTO ───────────────────────────────────── */}
      <section className="tsr-manifesto">
        <div className="wrap tsr-manifesto-inner" data-reveal>
          <blockquote className="tsr-manifesto-q">{t('quote')}</blockquote>
          <div className="tsr-manifesto-body">
            <p>{t('manifestoP1')}</p>
            <p>{t('manifestoP2')}</p>
          </div>
        </div>
      </section>

      {/* ── STATEMENT ────────────────────────────────────── */}
      <div className="tsr-statement">
        <div className="wrap tsr-statement-inner" data-reveal>
          <p className="tsr-statement-line">{t('stmt1')}</p>
          <p className="tsr-statement-line tsr-statement-line--muted">{t('stmt2')}</p>
          <p className="tsr-statement-sub">
            <Link href="/criterio">{t('stmtLink')}</Link>
          </p>
        </div>
      </div>

      {/* ── PASOS PARA ARTISTAS ───────────────────────────── */}
      <section className="tsr-steps-artistas">
        <div className="wrap">
          <div className="tsr-steps-head" data-reveal>
            <p className="eyebrow">{t('processKicker')}</p>
            <h2 className="tsr-steps-title">{t('processTitle1')}<br /><em>{t('processTitleEm')}</em></h2>
          </div>
          <div className="tsr-steps-row">
            {[
              { n: '01', title: t('step1Title'), body: t('step1Body') },
              { n: '02', title: t('step2Title'), body: t('step2Body') },
              { n: '03', title: t('step3Title'), body: t('step3Body') },
              { n: '04', title: t('step4Title'), body: t('step4Body') },
            ].map((s, i) => (
              <div className="tsr-step" key={s.n} data-reveal data-delay={String(i)}>
                <span className="tsr-step-n">{s.n}</span>
                <h3 className="tsr-step-title">{s.title}</h3>
                <p className="tsr-step-body">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="tsr-steps-cta" data-reveal>
            {prelaunch
              ? <Link href="/registro" className="tsr-cta-primary" style={{ display: 'inline-block' }}>{t('stepsCtaNotify')}</Link>
              : <Link href="/postular" className="tsr-cta-primary" style={{ display: 'inline-block' }}>{t('stepsCtaApply')}</Link>
            }
            <Link href="/sobre-mancha" className="tsr-manifesto-link" style={{ display: 'inline-block', marginTop: 20 }}>{t('ctaInstitution')}</Link>
          </div>
        </div>
      </section>

      {/* ── BLOG ─────────────────────────────────────────── */}
      <section className="tsr-blog">
        <div className="wrap">
          <div className="tsr-blog-head" data-reveal>
            <div>
              <p className="eyebrow">{t('editorialKicker')}</p>
              <h2 className="tsr-blog-title">{t('blogTitle')}</h2>
            </div>
            <Link href="/notas" className="tsr-blog-all">{t('allNotes')}</Link>
          </div>
          <div className="tsr-blog-grid">
            {articles.slice(0, 3).map((article, i) => (
              <Link href={`/notas/${article.slug}`} className="tsr-blog-card" key={article.slug} data-reveal data-delay={String(i)}>
                <div className="tsr-blog-img">
                  {article.image && <img src={article.image} alt={article.imageAlt || article.title} />}
                </div>
                <div className="tsr-blog-info">
                  <p className="tsr-blog-date">{article.date}</p>
                  <h3 className="tsr-blog-card-title">{article.title}</h3>
                  <p className="tsr-blog-excerpt">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WAITLIST (pre-launch) / CTA (convocatoria) ───── */}
      <section className="tsr-aviso" id="compradores">
        <div className="wrap tsr-aviso-inner">
          <div className="tsr-aviso-text" data-reveal>
            <p className="eyebrow" style={{ color: 'rgba(250,239,225,0.4)' }}>
              {prelaunch ? t('avisoKickerPre') : t('avisoKickerInst')}
            </p>
            <h2 className="tsr-aviso-title">
              {prelaunch
                ? <>{t('avisoTitlePre1')}<br />{t('avisoTitlePre2')}</>
                : convocatoria
                  ? <>{t('avisoTitleConv1')}<br />{t('avisoTitleConv2')}</>
                  : <>{t('avisoTitleActive1')}<br />{t('avisoTitleActive2')}</>
              }
            </h2>
            <p className="tsr-aviso-sub">
              {prelaunch
                ? t('avisoSubPre')
                : convocatoria
                  ? t('avisoSubConv')
                  : t('avisoSubActive')}
            </p>
          </div>
          <div className="tsr-aviso-form" data-reveal data-delay="1">
            {prelaunch
              ? <WaitlistForm redirectTo="/para-artistas" label={t('waitlistLabel')} />
              : <div className="tsr-aviso-cta-wrap">
                  <Link href="/postular" className="tsr-cta-primary">{t('ctaApply')}</Link>
                  <Link href="/criterio" className="tsr-cta-ghost" style={{ marginTop: 16, display: 'block' }}>{t('ctaCriteria')}</Link>
                </div>
            }
          </div>
        </div>
      </section>

      {/* ── ROLE SWITCH ──────────────────────────────────── */}
      <div className="role-switch-bar">
        <div className="wrap">
          <RoleSwitch currentRole="artista" />
        </div>
      </div>

      <Footer />
    </>
  );
}
