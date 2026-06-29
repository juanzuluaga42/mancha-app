import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import CursorTrail from '@/components/CursorTrail';
import LocaleSwitch from '@/components/LocaleSwitch';
import CouncilApplication from '@/components/CouncilApplication';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  const title = t('councilTitle');
  const description = t('councilDesc');
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ConsejoPage({ searchParams }) {
  const sp = await searchParams;
  const t = await getTranslations('council');
  const sent = sp?.sent;
  const errored = sp?.error;

  return (
    <div className="elegidos-page">
      <CursorTrail />
      <div className="elegidos-nav">
        <Link href="/para-artistas" className="elegidos-logo">MANCHA.</Link>
        <LocaleSwitch />
      </div>

      <section className="elegidos-hero">
        <p className="elegidos-line">{t('line1')}</p>
        <p className="elegidos-line">{t('line2')}</p>
        <p className="elegidos-line elegidos-accent">{t('line3')}</p>
      </section>

      <section className="elegidos-beat">
        <p>{t('beat1a')}</p>
        <p className="elegidos-bold">{t('beat1b')}</p>
      </section>

      <section className="elegidos-beat">
        <p>{t('beat2a')}</p>
        <p className="elegidos-bold">{t('beat2b')}</p>
        <p>{t('beat2c')}</p>
      </section>

      <section className="elegidos-beat">
        <p>{t('beat3a')}</p>
        <p>{t('beat3b')}</p>
        <p>{t('beat3c')}</p>
      </section>

      {/* Credibilidad / proceso */}
      <section className="consejo-proof">
        <p className="consejo-kicker">{t('proofKicker')}</p>
        <div className="consejo-proof-grid">
          {[1, 2, 3].map((n) => (
            <div className="consejo-proof-card" key={n}>
              <span className="consejo-proof-n">0{n}</span>
              <h3>{t(`proof${n}Title`)}</h3>
              <p>{t(`proof${n}Body`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="consejo-apply" id="postular">
        <p className="consejo-kicker">{t('formKicker')}</p>
        <h2 className="consejo-title">{t('formTitle')}</h2>
        <p className="consejo-sub">{t('formSub')}</p>

        {sent ? (
          <div className="consejo-success">{t('success')}</div>
        ) : (
          <>
            {errored && <div className="consejo-error">{t('errorMsg')}</div>}
            <CouncilApplication />
          </>
        )}

        <Link href="/sobre-mancha" className="elegidos-back">{t('back')}</Link>
      </section>
    </div>
  );
}
