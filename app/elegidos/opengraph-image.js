import { ImageResponse } from 'next/og';
import { manchaFonts } from '@/lib/og';

export const alt = 'MANCHA — Arte seleccionado a mano.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const fonts = await manchaFonts('Si estás leyendo esto, alguien pensó que merecías encontrarlo. Arte seleccionado a mano cada temporada.');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0D0C0A',
          padding: '80px 110px',
          textAlign: 'center',
        }}
      >
        {/* Marca */}
        <span style={{ fontFamily: 'Unbounded', fontWeight: 800, fontSize: 26, color: '#E5402B', letterSpacing: 6, marginBottom: 48 }}>
          MANCHA.
        </span>

        {/* Líneas editoriales */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', fontFamily: 'Newsreader', fontStyle: 'italic', fontSize: 54, color: 'rgba(250,243,230,0.7)', lineHeight: 1.25 }}>
            Si estás leyendo esto,
          </div>
          <div style={{ display: 'flex', fontFamily: 'Newsreader', fontStyle: 'italic', fontSize: 54, color: 'rgba(250,243,230,0.7)', lineHeight: 1.25 }}>
            alguien pensó que merecías
          </div>
          <div style={{ display: 'flex', fontFamily: 'Unbounded', fontWeight: 800, fontSize: 72, color: '#FAF3E6', lineHeight: 1.1, marginTop: 8, letterSpacing: -2 }}>
            encontrarlo.
          </div>
        </div>

        {/* Separador */}
        <div style={{ width: 48, height: 2, backgroundColor: '#E5402B', display: 'flex', marginTop: 48, marginBottom: 28 }} />

        {/* Sub */}
        <div style={{ display: 'flex', fontSize: 19, color: 'rgba(250,243,230,0.4)', letterSpacing: 3, textTransform: 'uppercase' }}>
          Arte seleccionado a mano · Cada temporada
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) }
  );
}
