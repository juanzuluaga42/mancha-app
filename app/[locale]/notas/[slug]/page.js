import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import BlogImg from '@/components/BlogImg';
import { getArticleBySlug, articles } from '@/lib/news';

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: 'MANCHA — Notas' };
  return {
    title: `MANCHA — ${article.title}`,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, images: ['/og-default.jpg'], type: 'article' },
    twitter: { card: 'summary_large_image', images: ['/og-default.jpg'] },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const idx = articles.findIndex((a) => a.slug === slug);
  const prev = idx < articles.length - 1 ? articles[idx + 1] : null;
  const next = idx > 0 ? articles[idx - 1] : null;

  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="nota-header">
        <Splat width="180px" height="155px" top="-50px" right="-40px" color="red" rotate={-14} radius="r2" />
        <Splat width="100px" height="88px" bottom="-35px" left="-25px" color="yellow" rotate={12} radius="r4" />
        <div className="wrap" style={{ maxWidth: 820 }}>
          <Link href="/notas" className="nota-back">← Todas las notas</Link>
          <p className="nota-header-date">{article.date}</p>
          <h1 className="nota-header-title">{article.title}</h1>
          <p className="nota-header-excerpt">{article.excerpt}</p>
        </div>
      </header>

      {/* ── IMAGEN PORTADA ───────────────────────────────── */}
      {article.image && (
        <div className="nota-cover">
          <div className="nota-cover-frame">
            <BlogImg src={article.image} alt={article.imageAlt || article.title} color="var(--ink)" />
          </div>
          {article.imageCaption && (
            <p className="nota-cover-caption">{article.imageCaption}</p>
          )}
        </div>
      )}

      {/* ── CUERPO ───────────────────────────────────────── */}
      <article className="nota-body">
        <div className="wrap nota-content">
          {article.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {/* Navegación entre notas */}
        {(prev || next) && (
          <div className="nota-nav">
            <div className="wrap nota-nav-inner">
              {prev ? (
                <Link href={`/notas/${prev.slug}`} className="nota-nav-link nota-nav-prev">
                  <span className="nota-nav-dir">← Anterior</span>
                  <span className="nota-nav-label">{prev.title}</span>
                </Link>
              ) : <div />}
              {next && (
                <Link href={`/notas/${next.slug}`} className="nota-nav-link nota-nav-next">
                  <span className="nota-nav-dir">Siguiente →</span>
                  <span className="nota-nav-label">{next.title}</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </>
  );
}
