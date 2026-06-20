import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { logIn } from './actions';

export const metadata = { title: 'MANCHA — Iniciar sesión' };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;

  return (
    <>
      <Nav />
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow">Bienvenido de nuevo</p>
          <h1>Iniciar sesión</h1>
        </div>
      </header>

      <section className="auth-wrap">
        <div className="wrap">
          <div className="auth-card">
            {params?.error && <p className="auth-error">{params.error}</p>}

            <form action={logIn}>
              <input type="hidden" name="next" value={params?.next || '/cuenta'} />
              <div className="field">
                <label htmlFor="email">Correo electrónico</label>
                <input id="email" name="email" type="email" required />
              </div>
              <div className="field">
                <label htmlFor="password">Contraseña</label>
                <input id="password" name="password" type="password" required />
              </div>
              <button type="submit" className="auth-submit">Entrar</button>
            </form>

            <p className="auth-foot">¿No tienes cuenta? <Link href="/registro">Crear cuenta</Link></p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
