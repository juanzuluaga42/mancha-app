import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/app/cuenta/actions';
import NavMenu from './NavMenu';

export default async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isArtist = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    isArtist = profile?.role === 'artist';
  }

  const links = [
    { href: '/sobre-mancha', label: 'Sobre MANCHA' },
    { href: '/artistas', label: 'Temporada actual' },
    { href: '/obras', label: 'Catálogo completo' },
    { href: '/seleccionados', label: 'Los elegidos' },
    { href: '/temporadas', label: 'Temporadas' },
    { href: '/#favoritos', label: 'Favoritos' },
    { href: '/postular', label: '¿Eres artista?' },
    ...(isArtist ? [
      { href: '/criterio', label: 'El criterio' },
      { href: '/manifiesto', label: 'Manifiesto' },
    ] : []),
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
