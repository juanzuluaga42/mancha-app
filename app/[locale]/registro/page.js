import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Splat from '@/components/Splat';
import Footer from '@/components/Footer';
import RegistroForm from '@/components/RegistroForm';
import GoogleButton from '@/components/GoogleButton';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  return { title: t('registroTitle') };
}

export default async function RegistroPage({ searchParams }) {
  const params = await searchParams;
  const defaultRole = params?.role === 'artist' ? 'artist' : 'buyer';
  const t = await getTranslations('auth');

  return (
    <>
      <Nav />

      <header className="auth-header">
        <Splat width="160px" height="140px" top="-45px" right="-35px" color="lilac" rotate={-12} radius="r3" />
        <Splat width="90px" height="80px" bottom="-28px" left="-22px" color="red" rotate={11} radius="r1" />
        <div className="wrap">
          <p className="auth-header-eyebrow">{t('newAccount')}</p>
          <h1 className="auth-header-title">{t('joinTitle')}</h1>
          <p className="auth-header-sub">{t('joinSubtitle')}</p>
        </div>
      </header>

      <section className="auth-wrap">
        <div className="wrap">
          <div className="auth-card">
            {params?.error && <p className="auth-error">{params.error}</p>}

            <RegistroForm defaultRole={defaultRole} />

            <div className="auth-divider"><span>{t('or')}</span></div>

            <GoogleButton next="/cuenta" />

            <p className="auth-foot">{t('alreadyAccount')} <Link href="/login">{t('signInLink')}</Link></p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
