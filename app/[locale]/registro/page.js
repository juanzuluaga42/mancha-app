import Link from 'next/link';
import Nav from '@/components/Nav';
import Splat from '@/components/Splat';
import Footer from '@/components/Footer';
import RegistroForm from '@/components/RegistroForm';
import GoogleButton from '@/components/GoogleButton';

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
          <p className="auth-header-sub">Para coleccionar y guardar favoritos, o para postular como artista — sube tus obras ahora o cuando quieras.</p>
        </div>
      </header>

      <section className="auth-wrap">
        <div className="wrap">
          <div className="auth-card">
            {params?.error && <p className="auth-error">{params.error}</p>}

            <RegistroForm defaultRole={defaultRole} />

            <div className="auth-divider"><span>o</span></div>

            <GoogleButton next="/cuenta" />

            <p className="auth-foot">¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></p>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
