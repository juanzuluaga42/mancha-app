import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/app/[locale]/cuenta/actions';
import NavMenu from './NavMenu';
import NavLogoLink from './NavLogoLink';
import LocaleSwitch from './LocaleSwitch';
import { isPreLaunch, isConvocatoria } from '@/lib/fase';

export default async function Nav() {
  const supabase = await createClient();
  const t = await getTranslations('nav');
  const tc = await getTranslations('common');
  const { data: { user } } = await supabase.auth.getUser();
  const prelaunch = isPreLaunch();
  const convocatoria = isConvocatoria();

  let isArtist = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    isArtist = profile?.role === 'artist';
  }

  const links = prelaunch
    ? [
        { href: '/sobre-mancha', label: t('institution') },
        { href: '/criterio', label: t('criteria') },
        { href: '/notas', label: t('notes') },
        { href: '/#compradores', label: `${t('collect')} →` },
      ]
    : convocatoria
    ? [
        { href: '/sobre-mancha', label: t('institution') },
        { href: '/criterio', label: t('criteria') },
        { href: '/postular', label: `${t('apply')} →` },
        { href: '/#compradores', label: t('collect') },
        ...(isArtist ? [{ href: '/manifiesto', label: t('manifesto') }] : []),
      ]
    : [
        { href: '/sobre-mancha', label: t('institution') },
        { href: '/criterio', label: t('criteria') },
        { href: '/seleccionados', label: t('selected') },
        { href: '/obras', label: t('catalogue') },
        { href: '/postular', label: t('apply') },
        ...(isArtist ? [{ href: '/manifiesto', label: t('manifesto') }] : []),
      ];

  const authSlot = user ? (
    <>
      <Link href="/cuenta">{tc('account')}</Link>
      <form action={signOut}>
        <button type="submit">{tc('signOut')}</button>
      </form>
    </>
  ) : (
    <>
      <Link href="/login">{tc('signIn')}</Link>
      <Link href="/registro" className="nav-cta">{tc('createAccount')}</Link>
    </>
  );

  return (
    <nav className="nav">
      <div className="nav-inner">
        <NavLogoLink />
        <div className="nav-right">
          <LocaleSwitch />
          <NavMenu links={links} authSlot={authSlot} />
        </div>
      </div>
    </nav>
  );
}
