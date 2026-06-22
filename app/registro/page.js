import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { signUp } from './actions';

export const metadata = { title: 'MANCHA — Crear cuenta' };

export default async function RegistroPage({ searchParams }) {
  const params = await searchParams;
  const defaultRole = params?.role === 'artist' ? 'artist' : 'buyer';

  return (
    <>
      <Nav />

      <header className="auth-header">
        <Splat width="160px" height="140px" top="-45px" right="-35px" color="lilac" rotate={-12} radius="r3" />
        <Splat width="90px" height="80px" bottom="-28px" left="-22px" color="red" rotate={11} radius="r1" />
        <div className="wrap">
          <p className="auth-header-eyebrow">Nueva cuenta</p>
          <h1 className="auth-header-title">Sumate a MANCHA</h1>
          <p className="auth-header-sub">Para pujar y guardar favoritos, o para postular como artista.</p>
        </div>
      </header>

      <section className="auth-wrap">
        <div className="wrap">
          <div className="auth-card">
            {params?.error && <p className="auth-error">{params.error}</p>}

            <form action={signUp}>
              <div className="role-toggle">
                <label className="role-option">
                  <input type="radio" name="role" value="buyer" defaultChecked={defaultRole === 'buyer'} />
                  Soy comprador
                </label>
                <label className="role-option">
                  <input type="radio" name="role" value="artist" defaultChecked={defaultRole === 'artist'} />
                  Soy artista
                </label>
              </div>

              <div className="field">
                <label htmlFor="full_name">Nombre completo</label>
                <input id="full_name" name="full_name" type="text" required />
              </div>
              <div className="field">
                <label htmlFor="email">Correo electrónico</label>
                <input id="email" name="email" type="email" required />
              </div>
              <div className="field">
                <label htmlFor="password">Contraseña</label>
                <input id="password" name="password" type="password" minLength={6} required />
              </div>

              <button type="submit" className="auth-submit">Crear cuenta</button>
            </form>

            <p className="auth-foot">¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
