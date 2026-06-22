import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { articles } from '@/lib/news';

export const metadata = {
  title: 'MANCHA — Notas',
  description: 'Arte, mercado y oficio — notas de MANCHA sobre el mundo del arte emergente.',
};

export default function NotasPage() {
  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="notas-header">
        <Splat width="200px" height="175px" top="-55px" left="-40px" color="red" rotate={18} radius="r3" />
        <Splat width="120px" height="105px" bottom="-40px" right="-30px" color="lilac" rotate={-12} radius="r1" />
        <Splat width="72px" height="64px" top="38%" right="8%" color="yellow" rotate={6} radius="r2" />
        <div className="wrap">
          <p className="eyebrow notas-eyebrow">Notas</p>
          <h1 className="notas-title">
            Arte, mercado<br />
            <em>y oficio.</em>
          </h1>
          <p className="notas-sub">
            Lo que no cabe en una ficha de catálogo — el contexto, la conversación,
            el fondo detrás de cada pieza y cada temporada.
          </p>
        </div>
      </header>

      {/* ── ARTÍCULOS ────────────────────────────────────── */}
      <section className="notas-section">
        <div className="wrap notas-wrap">
          {articles.length === 0 ? (
            <div className="empty-state">No hay notas publicadas todavía.</div>
          ) : (
            <div className="notas-grid">
              {articles.map((article, i) => (
                <Link href={`/notas/${article.slug}`} className="nota-card" key={article.slug}>
                  <div className="nota-card-inner">
                    {article.image ? (
                      <div className="nota-card-img-wrap">
                        <img src={article.image} alt={article.imageAlt || article.title} className="nota-card-img" />
                      </div>
                    ) : (
                      <div className={`nota-card-art g${(i % 12) + 1}`} aria-hidden="true">
                        <span className="nota-card-num">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                    )}
                    <div className="nota-card-body">
                      <p className="nota-card-date">{article.date}</p>
                      <h2 className="nota-card-title">{article.title}</h2>
                      <p className="nota-card-excerpt">{article.excerpt}</p>
                      <span className="nota-card-cta">Leer nota →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
