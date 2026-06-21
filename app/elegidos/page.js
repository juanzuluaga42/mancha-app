import Link from 'next/link';
import CursorTrail from '@/components/CursorTrail';

export const metadata = {
  title: 'MANCHA — No es para todos.',
  description: 'Si estás leyendo esto, alguien pensó que merecías encontrarlo.',
  openGraph: {
    title: 'MANCHA — No es para todos.',
    description: 'Si estás leyendo esto, alguien pensó que merecías encontrarlo.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MANCHA — No es para todos.',
    description: 'Si estás leyendo esto, alguien pensó que merecías encontrarlo.',
  },
};

export default function ElegidosPage() {
  return (
    <div className="elegidos-page">
      <CursorTrail />
      <div className="elegidos-nav">
        <Link href="/" className="elegidos-logo">MANCHA.</Link>
      </div>

      <section className="elegidos-hero">
        <p className="elegidos-line">Si estás leyendo esto,</p>
        <p className="elegidos-line">alguien pensó que merecías</p>
        <p className="elegidos-line elegidos-accent">encontrarlo.</p>
      </section>

      <section className="elegidos-beat">
        <p>MANCHA no recluta artistas.</p>
        <p className="elegidos-bold">Los encuentra.</p>
      </section>

      <section className="elegidos-beat">
        <p>Cada temporada, un puñado muy reducido entra.</p>
        <p>Tres piezas. Tres meses. Una página que es solo tuya —</p>
        <p>no un perfil más perdido entre miles.</p>
      </section>

      <section className="elegidos-beat">
        <p>La mayoría de quienes postulan, no entra esta vez.</p>
        <p className="elegidos-bold">Eso no es un castigo.</p>
        <p>Es la razón por la que, cuando entras, importa.</p>
      </section>

      <section className="elegidos-cta">
        <p className="elegidos-cta-line">¿Tu trabajo está listo para que lo veamos?</p>
        <Link href="/postular" className="elegidos-btn">Quiero ser de los elegidos →</Link>
        <Link href="/" className="elegidos-back">o conoce MANCHA primero</Link>
      </section>
    </div>
  );
}
