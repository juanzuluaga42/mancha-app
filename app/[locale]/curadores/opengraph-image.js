import { ImageResponse } from 'next/og';
import { manchaFonts } from '@/lib/og';

export const alt = 'MANCHA — El Consejo Curatorial';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { locale } = await params;
  const en = locale === 'en';
  const kicker = en ? 'The standard' : 'El estándar';
  const l1 = en ? 'Who looks' : 'Quién mira';
  const em = en ? 'first.' : 'primero.';
  const sub = en ? 'The Curatorial Council · Every work, judged blind' : 'El Consejo Curatorial · Cada obra, a ciegas';
  const fonts = await manchaFonts(`${kicker} ${l1} ${em} ${sub} MANCHA`);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#16110D', padding: '80px 90px' }}>
        <span style={{ fontFamily: 'Unbounded', fontWeight: 800, fontSize: 24, color: '#E5402B', letterSpacing: 6, marginBottom: 30 }}>MANCHA.</span>
        <div style={{ display: 'flex', fontSize: 22, color: '#F2B705', letterSpacing: 5, textTransform: 'uppercase', marginBottom: 18 }}>{kicker}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'Unbounded', fontWeight: 800, fontSize: 88, color: '#FAF3E6', letterSpacing: -3, lineHeight: 1 }}>{l1}</span>
          <span style={{ fontFamily: 'Newsreader', fontStyle: 'italic', fontSize: 88, color: '#E5402B', lineHeight: 1 }}>{em}</span>
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: 'rgba(250,243,230,0.45)', letterSpacing: 2, marginTop: 40 }}>{sub}</div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) },
  );
}
