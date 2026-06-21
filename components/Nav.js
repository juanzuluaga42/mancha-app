import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/app/cuenta/actions';
import NavDropdown from './NavDropdown';

export default async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const catalogItems = [
    { href: '/#artistas', label: 'Temporada actual' },
    { href: '/obras', label: 'Catálogo completo' },
    { href: '/temporadas', label: 'Temporadas pasadas' },
    { href: '/#favoritos', label: 'Favoritos' },
  ];

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">MANCHA<span>.</span></Link>
        <ul className="nav-links">
          <li><Link href="/sobre-mancha">Sobre MANCHA</Link></li>
          <NavDropdown label="Catálogo" items={catalogItems} />
          <li><Link href="/#notas">Notas</Link></li>
          <li><Link href="/#tips">Tips</Link></li>
          <li><Link href="/postular">¿Eres artista?</Link></li>
          {user ? (
            <>
              <li><Link href="/cuenta">Mi cuenta</Link></li>
              <li>
                <form action={signOut}>
                  <button type="submit" className="nav-cta" style={{ border: 'none' }}>Salir</button>
                </form>
              </li>
            </>
          ) : (
            <>
              <li><Link href="/login">Iniciar sesión</Link></li>
              <li><Link href="/registro" className="nav-cta">Crear cuenta</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
