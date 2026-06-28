import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import CursorTrail from '@/components/CursorTrail';
import LocaleSwitch from '@/components/LocaleSwitch';

export const metadata = {
  title: 'MANCHA — Arte seleccionado a mano.',
  description: 'Si estás leyendo esto, alguien pensó que merecías encontrarlo.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'MANCHA — Arte seleccionado a mano.',
    description: 'Si estás leyendo esto, alguien pensó que merecías encontrarlo.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MANCHA — Arte seleccionado a mano.',
    description: 'Si estás leyendo esto, alguien pensó que merecías encontrarlo.',
  },
};

export default async function ElegidosPage() {
  const t = await getTranslations('elegidos');
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
        <p>{t('beat2b')}</p>
        <p>{t('beat2c')}</p>
      </section>

      <section className="elegidos-beat">
        <p>{t('beat3a')}</p>
        <p className="elegidos-bold">{t('beat3b')}</p>
        <p>{t('beat3c')}</p>
      </section>

      <section className="elegidos-cta">
        <p className="elegidos-cta-line">{t('ctaLine')}</p>
        <Link href="/para-artistas" className="elegidos-btn">{t('applyNow')}</Link>
        <Link href="/para-artistas" className="elegidos-back">{t('learnFirst')}</Link>
      </section>
    </div>
  );
}
