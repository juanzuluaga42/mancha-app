import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { signOut } from '@/app/cuenta/actions';

export default async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">MANCHA<span>.</span></Link>
        <ul className="nav-links">
          <li><Link href="/#artistas">Temporada actual</Link></li>
          <li><Link href="/#favoritos">Favoritos</Link></li>
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
