import { ImageResponse } from 'next/og';
import { manchaFonts } from '@/lib/og';
import { getArticleBySlug, getArticles } from '@/lib/news';

export const alt = 'MANCHA — Notas';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getArticles('es').map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }) {
  const { slug, locale } = await params;
  const article = getArticleBySlug(slug, locale === 'en' ? 'en' : 'es');
  const title = article?.title || 'Notas';
  const kicker = locale === 'en' ? 'MANCHA · Journal' : 'MANCHA · Notas';
  const fonts = await manchaFonts(`${title} ${kicker}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', backgroundColor: '#16110D', padding: '76px 84px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 16, height: 16, borderRadius: 16, backgroundColor: '#E5402B', display: 'flex' }} />
          <span style={{ fontFamily: 'Unbounded', fontWeight: 800, fontSize: 26, color: '#FAF3E6', letterSpacing: 2 }}>MANCHA</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 22, color: '#F2B705', letterSpacing: 5, textTransform: 'uppercase' }}>{kicker}</div>
          <div style={{ display: 'flex', fontFamily: 'Unbounded', fontWeight: 800, fontSize: title.length > 60 ? 52 : 64, color: '#FAF3E6', lineHeight: 1.06, letterSpacing: -2, maxWidth: 1010 }}>
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 20, color: 'rgba(250,243,230,0.42)', letterSpacing: 2 }}>
          {article?.date || 'manchagallery.com'}
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) },
  );
}
