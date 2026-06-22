import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { tips } from '@/lib/tips';

export const metadata = {
  title: 'MANCHA — Tips artísticos',
  description: 'Cinco consejos concretos para quien empieza a pintar — paso a paso, con ejemplo real en cada uno.',
};

export default function TipsPage() {
  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="tips-header">
        <Splat width="200px" height="175px" top="-50px" right="-40px" color="yellow" rotate={-12} radius="r2" />
        <Splat width="120px" height="105px" bottom="-40px" left="-30px" color="red" rotate={16} radius="r4" />
        <Splat width="68px" height="60px" top="44%" left="7%" color="lilac" rotate={10} radius="r1" />
        <div className="wrap">
          <p className="eyebrow tips-eyebrow">Tips artísticos</p>
          <h1 className="tips-title">
            Cinco cosas que<br />
            <em>ayudan más de lo que parecen.</em>
          </h1>
          <p className="tips-sub">
            Para quien recién empieza a pintar como hobby — paso a paso,
            con un ejemplo concreto en cada uno.
          </p>
        </div>
      </header>

      {/* ── TIPS ─────────────────────────────────────────── */}
      <section className="tips-section">
        <div className="wrap tips-wrap">
          {tips.map((tip, i) => (
            <div className="tip-item" key={tip.title}>
              <div className="tip-item-head">
                <span className="tip-item-n">{String(i + 1).padStart(2, '0')}</span>
                <h2 className="tip-item-title">{tip.title}</h2>
              </div>

              <div className="tip-item-body">
                <ol className="tip-item-steps">
                  {tip.steps.map((step, j) => (
                    <li key={j}>
                      <span className="tip-step-n">{j + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="tip-item-example">
                  <p className="tip-example-label">Ejemplo concreto</p>
                  <p className="tip-example-text">{tip.example}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
