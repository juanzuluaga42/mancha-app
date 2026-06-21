import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
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

  return (
    <>
      <Nav />
      <header className="page-header">
        <div className="wrap" style={{ maxWidth: '760px' }}>
          <Link href="/notas" className="eyebrow" style={{ display: 'inline-block', marginBottom: 18 }}>← Volver a notas</Link>
          <p className="eyebrow">{article.date}</p>
          <h1 style={{ maxWidth: '20ch' }}>{article.title}</h1>
        </div>
      </header>

      <section className="content" style={{ paddingTop: 50 }}>
        <div className="wrap" style={{ maxWidth: '720px' }}>
          {article.body.map((paragraph, i) => (
            <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '1.08rem', lineHeight: 1.75, color: 'var(--ink)', marginBottom: 22 }}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
