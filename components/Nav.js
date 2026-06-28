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

  // Manifiestos visibles desde pre-launch. NavMenu los filtra por lado (cliente):
  // 'Deja una marca' (artista) se oculta a coleccionistas; 'Antes que el mundo'
  // (coleccionista) se oculta a artistas.
  const manifestos = [
    { href: '/manifiesto', label: t('manifesto') },
    { href: '/antes-que-el-mundo', label: t('beforeWorld') },
  ];

  const links = prelaunch
    ? [
        { href: '/sobre-mancha', label: t('institution') },
        ...manifestos,
        { href: '/notas', label: t('notes') },
        { href: '/#compradores', label: `${t('collect')} →` },
      ]
    : convocatoria
    ? [
        { href: '/sobre-mancha', label: t('institution') },
        ...manifestos,
        // 'Solicitar acceso' solo para visitantes sin sesión.
        ...(!user ? [{ href: '/postular', label: `${t('apply')} →` }] : []),
        { href: '/#compradores', label: t('collect') },
      ]
    : [
        { href: '/sobre-mancha', label: t('institution') },
        ...manifestos,
        { href: '/seleccionados', label: t('selected') },
        { href: '/obras', label: t('catalogue') },
        ...(!user ? [{ href: '/postular', label: t('apply') }] : []),
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
