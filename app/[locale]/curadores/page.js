import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';
import { createAdminClient } from '@/utils/supabase/admin';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  const title = t('curatorsTitle');
  const description = t('curatorsDesc');
  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function CuradoresPage() {
  const t = await getTranslations('curatorsPage');
  const tc = await getTranslations('council');

  // Lectura con service role: solo columnas seguras, nunca el correo ni el
  // user_id, y nunca el Founder (se filtra por rol). Solo curadores públicos.
  const admin = createAdminClient();
  const { data } = await admin
    .from('cur_curators')
    .select('display_name, title, bio, specialties, role')
    .in('role', ['council', 'guest'])
    .eq('active', true)
    .eq('public', true)
    .order('created_at', { ascending: true });
  const curators = data ?? [];

  return (
    <>
      <Nav />
      <ScrollReveal />

      {/* Hero */}
      <header className="cur-pub-hero">
        <div className="wrap">
          <p className="eyebrow cur-pub-kicker">{t('kicker')}</p>
          <h1 className="cur-pub-title">{t('title1')} <em>{t('titleEm')}</em></h1>
          <p className="cur-pub-sub">{t('sub')}</p>
        </div>
      </header>

      {/* Proceso */}
      <section className="cur-pub-process">
        <div className="wrap cur-pub-process-grid">
          {[1, 2, 3].map((n) => (
            <div className="cur-pub-proc" key={n} data-reveal data-delay={String(n - 1)}>
              <span className="cur-pub-proc-n">0{n}</span>
              <h3>{t(`p${n}Title`)}</h3>
              <p>{t(`p${n}Body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Consejo */}
      <section className="cur-pub-council">
        <div className="wrap">
          <div className="cur-pub-council-head" data-reveal>
            <h2>{t('councilTitle')}</h2>
            <p>{t('councilSub')}</p>
          </div>

          {curators.length === 0 ? (
            <p className="cur-pub-empty" data-reveal>{t('empty')}</p>
          ) : (
            <div className="cur-pub-grid">
              {curators.map((c, i) => {
                const specs = Array.isArray(c.specialties) ? c.specialties : [];
                return (
                  <article className="cur-pub-card" key={i} data-reveal data-delay={String(i % 3)}>
                    <div className="cur-pub-card-mono">{initials(c.display_name)}</div>
                    <h3 className="cur-pub-card-name">{c.display_name}</h3>
                    {c.title && <p className="cur-pub-card-title">{c.title}</p>}
                    {specs.length > 0 && (
                      <div className="cur-pub-card-specs">
                        {specs.map((s) => <span key={s}>{tc(`spec.${s}`)}</span>)}
                      </div>
                    )}
                    {c.bio && <p className="cur-pub-card-bio">{c.bio}</p>}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Founder anónimo */}
      <section className="cur-pub-founder">
        <div className="wrap cur-pub-founder-inner" data-reveal>
          <span className="cur-pub-founder-mark">—</span>
          <h2>{t('founderTitle')}</h2>
          <p>{t('founderBody')}</p>
        </div>
      </section>

      {/* CTA expertos */}
      <section className="cur-pub-cta">
        <div className="wrap cur-pub-cta-inner" data-reveal>
          <h2>{t('ctaExpertsTitle')}</h2>
          <p>{t('ctaExpertsBody')}</p>
          <div className="cur-pub-cta-btns">
            <Link href="/consejo" className="cur-pub-btn-primary">{t('ctaExpertsBtn')}</Link>
            <Link href="/curaduria" className="cur-pub-btn-ghost">{t('ctaPortalBtn')}</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}
