import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const metadata = { title: 'MANCHA — Pago recibido' };

export default async function PagoExitoPage({ searchParams }) {
  const params = await searchParams;
  const pieceId = params?.piece;

  return (
    <>
      <Nav />
      <header className="page-header">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <p className="eyebrow">Pago recibido</p>
          <h1>Gracias — ya es tuya.</h1>
          <p className="sub" style={{ margin: '0 auto' }}>Te escribimos por correo en las próximas horas para coordinar el envío. Si tienes alguna duda mientras tanto, escríbenos a mancha.gallery@gmail.com.</p>
          {pieceId && (
            <a href={`/obras/${pieceId}/certificado`} target="_blank" rel="noreferrer" className="btn-primary" style={{ marginTop: 26, display: 'inline-block' }}>
              Ver tu certificado de colección →
            </a>
          )}
        </div>
      </header>
      <Footer />
    </>
  );
}
