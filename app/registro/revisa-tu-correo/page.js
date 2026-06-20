import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = { title: 'MANCHA — Revisa tu correo' };

export default function RevisaTuCorreoPage() {
  return (
    <>
      <Nav />
      <header className="page-header">
        <div className="wrap">
          <p className="eyebrow">Casi listo</p>
          <h1>Revisa tu correo</h1>
          <p className="sub">Te enviamos un enlace de confirmación. Apenas lo abras, tu cuenta queda activa y podés iniciar sesión.</p>
        </div>
      </header>
      <Footer />
    </>
  );
}
