import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { articles } from '@/lib/news';

export const metadata = {
  title: 'MANCHA — Notas',
  description: 'Arte, mercado y oficio — notas de MANCHA.',
};

export default function NotasPage() {
  return (
    <>
      <Nav />
      <header className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <Splat width="160px" height="140px" top="-30px" left="-40px" color="red" rotate={18} radius="r3" />
        <Splat width="100px" height="90px" bottom="-30px" right="-30px" color="lilac" rotate={-12} radius="r1" />
        <div className="wrap">
          <p className="eyebrow">Notas</p>
          <h1>Arte, mercado y oficio</h1>
        </div>
      </header>

      <section className="news" style={{ borderTop: 'none' }}>
        <Splat width="70px" height="60px" top="20%" right="-25px" color="yellow" rotate={8} radius="r4" />
        <Splat width="55px" height="50px" bottom="10%" left="-20px" color="red" rotate={-10} radius="r2" />
        <div className="wrap news-list">
          {articles.map((article) => (
            <article className="news-item" key={article.slug}>
              <p className="news-date">{article.date}</p>
              <div>
                <Link href={`/notas/${article.slug}`} className="news-title" style={{ display: 'block' }}>
                  {article.title}
                </Link>
                <p className="news-excerpt">{article.excerpt}</p>
                <Link href={`/notas/${article.slug}`} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', borderBottom: '1.5px solid var(--ink)', paddingBottom: 2, display: 'inline-block', marginTop: 10 }}>
                  Leer nota →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
