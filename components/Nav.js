import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/app/cuenta/actions';
import NavMenu from './NavMenu';
import { isPreLaunch, isConvocatoria } from '@/lib/fase';

export default async function Nav() {
  const supabase = await createClient();
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
        { href: '/sobre-mancha', label: 'La institución' },
        { href: '/criterio', label: 'El criterio' },
        { href: '/notas', label: 'Notas' },
        { href: '/#compradores', label: 'Coleccionar →' },
      ]
    : convocatoria
    ? [
        { href: '/sobre-mancha', label: 'La institución' },
        { href: '/criterio', label: 'El criterio' },
        { href: '/postular', label: 'Solicitar acceso →' },
        { href: '/#compradores', label: 'Coleccionar' },
        ...(isArtist ? [{ href: '/manifiesto', label: 'Manifiesto' }] : []),
      ]
    : [
        { href: '/sobre-mancha', label: 'La institución' },
        { href: '/criterio', label: 'El criterio' },
        { href: '/seleccionados', label: 'Los elegidos' },
        { href: '/obras', label: 'Catálogo' },
        { href: '/postular', label: 'Solicitar acceso' },
        ...(isArtist ? [{ href: '/manifiesto', label: 'Manifiesto' }] : []),
      ];

  const authSlot = user ? (
    <>
      <Link href="/cuenta">Mi cuenta</Link>
      <form action={signOut}>
        <button type="submit">Salir</button>
      </form>
    </>
  ) : (
    <>
      <Link href="/login">Iniciar sesión</Link>
      <Link href="/registro" className="nav-cta">Crear cuenta</Link>
    </>
  );

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">MANCHA<span>.</span></Link>
        <NavMenu links={links} authSlot={authSlot} />
      </div>
    </nav>
  );
}
