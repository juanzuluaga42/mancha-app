import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Splat from '@/components/Splat';
import Footer from '@/components/Footer';
import GoogleButton from '@/components/GoogleButton';
import { createClient } from '@/utils/supabase/server';

import { logIn } from './actions';
import { safePath } from '@/lib/utils';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  return { title: t('loginTitle') };
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  // Si ya hay sesión, no mostramos login: directo a la cuenta (o al destino).
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect(safePath(params?.next, '/cuenta'));

  const t = await getTranslations('auth');

  return (
    <>
      <Nav />

      <header className="auth-header">
        <Splat width="160px" height="140px" top="-45px" right="-35px" color="red" rotate={-10} radius="r2" />
        <Splat width="90px" height="80px" bottom="-28px" left="-22px" color="yellow" rotate={13} radius="r4" />
        <div className="wrap">
          <p className="auth-header-eyebrow">{t('welcomeBack')}</p>
          <h1 className="auth-header-title">{t('signInTitle')}</h1>
        </div>
      </header>

      <section className="auth-wrap">
        <div className="wrap">
          <div className="auth-card">
            {params?.error && <p className="auth-error">{params.error}</p>}

            <form action={logIn}>
              <input type="hidden" name="next" value={params?.next || '/cuenta'} />
              <div className="field">
                <label htmlFor="email">{t('email')}</label>
                <input id="email" name="email" type="email" required />
              </div>
              <div className="field">
                <label htmlFor="password">{t('password')}</label>
                <input id="password" name="password" type="password" required />
              </div>
              <button type="submit" className="auth-submit">{t('enter')}</button>
            </form>

            <div className="auth-divider"><span>{t('or')}</span></div>

            <GoogleButton next={safePath(params?.next, '/cuenta')} />

            <p className="auth-foot">{t('noAccount')} <Link href="/registro">{t('createAccount')}</Link></p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
