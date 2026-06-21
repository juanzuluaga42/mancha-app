import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { tips } from '@/lib/tips';

export const metadata = {
  title: 'MANCHA — Tips artísticos',
  description: 'Cinco consejos paso a paso, con ejemplo, para quien recién empieza a pintar como hobby.',
};

export default function TipsPage() {
  return (
    <>
      <Nav />
      <header className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <Splat width="160px" height="140px" top="-30px" right="-40px" color="yellow" rotate={-12} radius="r2" />
        <Splat width="100px" height="90px" bottom="-30px" left="-30px" color="red" rotate={16} radius="r4" />
        <div className="wrap">
          <p className="eyebrow">Tips artísticos</p>
          <h1>Cinco cosas que ayudan más de lo que parecen</h1>
          <p className="sub">Pensados para quien recién empieza a pintar como hobby — paso a paso, con un ejemplo concreto en cada uno.</p>
        </div>
      </header>

      <section className="tips" style={{ borderTop: 'none' }}>
        <Splat width="65px" height="58px" top="20%" right="4%" color="lilac" rotate={-8} radius="r1" />
        <Splat width="55px" height="50px" bottom="12%" left="42%" color="yellow" rotate={10} radius="r3" />
        <div className="wrap">
          {tips.map((tip) => (
            <div className="tip-card" key={tip.title}>
              <h3>{tip.title}</h3>
              <ol className="tip-steps">
                {tip.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
              <div className="tip-example">
                <b>Ejemplo</b>
                {tip.example}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
