import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/app/cuenta/actions';
import NavMenu from './NavMenu';

export default async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const links = [
    { href: '/sobre-mancha', label: 'Sobre MANCHA' },
    { href: '/#artistas', label: 'Temporada actual' },
    { href: '/obras', label: 'Catálogo completo' },
    { href: '/temporadas', label: 'Temporadas pasadas' },
    { href: '/#favoritos', label: 'Favoritos' },
    { href: '/notas', label: 'Notas' },
    { href: '/tips', label: 'Tips artísticos' },
    { href: '/postular', label: '¿Eres artista?' },
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
