import { ImageResponse } from 'next/og';
import { manchaFonts } from '@/lib/og';

export const alt = 'MANCHA — Arte emergente seleccionado a mano.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fonts = await manchaFonts('Primero tú. Después el mundo. Arte emergente seleccionado a mano. Pocos por temporada. Galería de arte online.');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#0D0C0A',
          padding: '88px 96px',
          position: 'relative',
        }}
      >
        {/* Acento rojo vertical fino */}
        <div style={{ position: 'absolute', left: 0, top: 120, bottom: 120, width: 5, backgroundColor: '#E5402B', display: 'flex' }} />

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 34 }}>
          <div style={{ width: 28, height: 28, backgroundColor: '#E5402B', display: 'flex' }} />
          <span style={{ fontSize: 17, color: 'rgba(250,243,230,0.5)', letterSpacing: 5, textTransform: 'uppercase' }}>
            Galería de arte online
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontFamily: 'Unbounded', fontWeight: 800, fontSize: 88, color: '#FAF3E6', lineHeight: 1.0, letterSpacing: -2 }}>
            Primero tú.
          </div>
          <div style={{ display: 'flex', fontFamily: 'Unbounded', fontWeight: 800, fontSize: 88, color: '#E5402B', lineHeight: 1.0, letterSpacing: -2, marginTop: 8 }}>
            Después el mundo.
          </div>
        </div>

        {/* Sub editorial */}
        <div style={{ display: 'flex', fontFamily: 'Newsreader', fontStyle: 'italic', fontSize: 32, color: 'rgba(250,243,230,0.6)', marginTop: 36, lineHeight: 1.4, maxWidth: 760 }}>
          Arte emergente seleccionado a mano. Pocos por temporada, tres piezas cada uno.
        </div>

        {/* Footer marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 56 }}>
          <span style={{ fontFamily: 'Unbounded', fontWeight: 800, fontSize: 28, color: '#FAF3E6', letterSpacing: 1 }}>MANCHA.</span>
          <div style={{ width: 1, height: 22, backgroundColor: 'rgba(250,243,230,0.25)', display: 'flex' }} />
          <span style={{ fontSize: 16, color: 'rgba(250,243,230,0.4)', letterSpacing: 1 }}>mancha-app.vercel.app</span>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) }
  );
}
