import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import BlogImg from '@/components/BlogImg';
import ReadingProgress from '@/components/ReadingProgress';
import ShareNote from '@/components/ShareNote';
import { getArticleBySlug, getArticles } from '@/lib/news';

export function generateStaticParams() {
  return getArticles('es').map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const locale = await getLocale();
  const article = getArticleBySlug(slug, locale);
  if (!article) return { title: 'MANCHA — Notas' };
  return {
    title: `MANCHA — ${article.title}`,
    description: article.excerpt,
    // La tarjeta social la genera opengraph-image.js (dinámica, con el título).
    openGraph: { title: article.title, description: article.excerpt, type: 'article' },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations('notasPage');
  const article = getArticleBySlug(slug, locale);
  if (!article) notFound();

  const articles = getArticles(locale);
  const idx = articles.findIndex((a) => a.slug === slug);
  const prev = idx < articles.length - 1 ? articles[idx + 1] : null;
  const next = idx > 0 ? articles[idx - 1] : null;

  // Tiempo de lectura (~200 palabras/min).
  const words = article.body.join(' ').split(/\s+/).filter(Boolean).length;
  const readingMin = Math.max(1, Math.round(words / 200));

  return (
    <>
      <Nav />
      <ReadingProgress />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="nota-header">
        <Splat width="180px" height="155px" top="-50px" right="-40px" color="red" rotate={-14} radius="r2" />
        <Splat width="100px" height="88px" bottom="-35px" left="-25px" color="yellow" rotate={12} radius="r4" />
        <div className="wrap" style={{ maxWidth: 820 }}>
          <Link href="/notas" className="nota-back">{t('back')}</Link>
          <p className="nota-header-date">{article.date} · {t('readingTime', { min: readingMin })}</p>
          <h1 className="nota-header-title">{article.title}</h1>
          <p className="nota-header-excerpt">{article.excerpt}</p>
          <div className="nota-header-share"><ShareNote title={article.title} /></div>
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
                  <span className="nota-nav-dir">{t('prevDir')}</span>
                  <span className="nota-nav-label">{prev.title}</span>
                </Link>
              ) : <div />}
              {next && (
                <Link href={`/notas/${next.slug}`} className="nota-nav-link nota-nav-next">
                  <span className="nota-nav-dir">{t('nextDir')}</span>
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
