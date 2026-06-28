import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Countdown from '@/components/Countdown';
import Toast from '@/components/Toast';
import WaitlistForm from '@/components/WaitlistForm';
import WelcomeModal from '@/components/WelcomeModal';
import ScrollReveal from '@/components/ScrollReveal';
import RoleSwitch from '@/components/RoleSwitch';
import { createClient } from '@/utils/supabase/server';
import { isPreLaunch, isConvocatoria, isTemporadaActiva } from '@/lib/fase';
import { getArticles } from '@/lib/news';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  return { title: t('collectorsTitle'), description: t('collectorsDesc') };
}

const LAUNCH_DATE = '2026-09-01T00:00:00-05:00';

export default async function ParaColeccionistasPage({ searchParams }) {
  const params = await searchParams;
  const t = await getTranslations('collectors');
  const locale = await getLocale();
  const articles = getArticles(locale);
  const prelaunch = isPreLaunch();
  const convocatoria = isConvocatoria();
  const temporadaActiva = isTemporadaActiva();

  let season = null;
  let allArtists = [];
  if (temporadaActiva) {
    const supabase = await createClient();
    const { data: s } = await supabase.from('seasons').select('*').eq('is_current', true).maybeSingle();
    season = s;
    const { data: artists } = await supabase
      .from('artists')
      .select('id, display_name, medium, pieces(id, image_url, title, min_bid, bids(amount))')
      .eq('season_id', s?.id ?? '00000000-0000-0000-0000-000000000000')
      .eq('status', 'approved')
      .order('created_at', { ascending: true });
    allArtists = artists ?? [];
  }

  const accentColors = ['var(--red)', 'var(--yellow)', 'var(--lilac)', 'var(--red-deep)', 'var(--yellow-deep)', 'var(--lilac-deep)'];

  return (
    <>
      <WelcomeModal />
      <Nav />
      <ScrollReveal />
      <Toast success={params?.success} error={params?.error} />

      {/* ── HERO ─────────────────────────────────────────── */}
      <header className="tsr-hero col-hero">
        <div className="wrap tsr-hero-content">
          <p className="tsr-hero-tag">{t('heroTag')}</p>
          <h1 className="tsr-title">
            <span className="tsr-tl">{t('heroTitle1')}</span>
            <span className="tsr-tl tsr-tl--em col-em">{t('heroTitleEm')}</span>
          </h1>
          <div className="tsr-hero-cd">
            {(prelaunch || convocatoria) && (
              <Countdown endsAt={LAUNCH_DATE} label={t('galleryOpensIn')} />
            )}
            {temporadaActiva && season?.ends_at && (
              <Countdown endsAt={season.ends_at} label={t('seasonClosesIn')} />
            )}
          </div>
          <div className="tsr-ctas">
            {temporadaActiva ? (
              <>
                <Link href="/obras" className="tsr-cta-primary">{t('viewCatalogue')}</Link>
                <Link href="/seleccionados" className="tsr-cta-ghost">{t('theSelected')}</Link>
              </>
            ) : (
              <>
                <a href="#aviso" className="tsr-cta-primary">{t('notifyMe')}</a>
                <Link href="/notas" className="tsr-cta-ghost">{t('readNotes')}</Link>
              </>
            )}
          </div>
        </div>
        <div className="tsr-hero-foot">
          <div className="wrap tsr-hero-foot-inner">
            <span>{t('footLeft')}</span>
            <span>
              {prelaunch || convocatoria
                ? t('galleryOpensSep')
                : t('seasonInProgress', { name: season?.name ?? 'Temporada 01' })}
            </span>
          </div>
        </div>
      </header>

      {/* ── PORQUÉ COLECCIONAR ────────────────────────────── */}
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
            <b className="tsr-num-dig tsr-num-word">{t('num3Big')}</b>
            <p className="tsr-num-label">{t('num3Label')}</p>
            <p className="tsr-num-note">{t('num3Note')}</p>
          </div>
        </div>
      </section>

      {/* ── CRITERIO PARA COLECCIONISTAS ─────────────────── */}
      <section className="tsr-manifesto">
        <div className="wrap tsr-manifesto-inner" data-reveal>
          <blockquote className="tsr-manifesto-q">{t('quote')}</blockquote>
          <div className="tsr-manifesto-body">
            <p>{t('manifestoP1')}</p>
            <p>{t('manifestoP2')}</p>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA PARA COLECCIONISTAS ────────────── */}
      <section className="tsr-steps-artistas">
        <div className="wrap">
          <div className="tsr-steps-head" data-reveal>
            <p className="eyebrow">{t('howKicker')}</p>
            <h2 className="tsr-steps-title">{t('howTitle1')}<br /><em>{t('howTitleEm')}</em></h2>
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
        </div>
      </section>

      {/* ── ARTISTAS ACTUALES (solo en temporada activa) ─── */}
      {temporadaActiva && allArtists.length > 0 && (
        <section className="hp-season">
          <div className="wrap">
            <div className="hp-season-head">
              <div>
                <p className="eyebrow" style={{ color: 'var(--ink-soft)' }}>{t('seasonCurrentKicker')}</p>
                <h2 className="hp-season-title">{season?.name ?? t('currentArtistsFallback')}</h2>
              </div>
              <Link href="/seleccionados" className="hp-season-all">{t('viewAll')}</Link>
            </div>
            <div className="hp-season-grid">
              {allArtists.slice(0, 6).map((artist, i) => {
                const firstPiece = (artist.pieces ?? [])[0];
                return (
                  <Link href={`/artistas/${artist.id}`} className="hp-artist-card" key={artist.id}>
                    <div className="hp-artist-media" style={{ background: accentColors[i % accentColors.length] }}>
                      {firstPiece?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firstPiece.image_url} alt={firstPiece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="hp-artist-initials">
                          {artist.display_name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                        </span>
                      )}
                      <span className="hp-artist-overlay">
                        <span className="hp-artist-n">{String(i + 1).padStart(2, '0')}</span>
                      </span>
                    </div>
                    <div className="hp-artist-info">
                      <h3 className="hp-artist-name">{artist.display_name}</h3>
                      <p className="hp-artist-meta">{t('piecesAvailable', { count: (artist.pieces ?? []).length })}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

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

      {/* ── AVISO / WAITLIST ─────────────────────────────── */}
      {!temporadaActiva && (
        <section className="tsr-aviso" id="aviso">
          <div className="wrap tsr-aviso-inner">
            <div className="tsr-aviso-text" data-reveal>
              <p className="eyebrow" style={{ color: 'rgba(250,239,225,0.4)' }}>{t('avisoKicker')}</p>
              <h2 className="tsr-aviso-title">
                {t('avisoTitle1')}<br />{t('avisoTitle2')}
              </h2>
              <p className="tsr-aviso-sub">{t('avisoSub')}</p>
            </div>
            <div className="tsr-aviso-form" data-reveal data-delay="1">
              <WaitlistForm redirectTo="/para-coleccionistas" label={t('waitlistLabel')} />
            </div>
          </div>
        </section>
      )}

      {/* ── ROLE SWITCH ──────────────────────────────────── */}
      <div className="role-switch-bar">
        <div className="wrap">
          <RoleSwitch currentRole="coleccionista" />
        </div>
      </div>

      <Footer />
    </>
  );
}
