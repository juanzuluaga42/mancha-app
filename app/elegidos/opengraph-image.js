import { ImageResponse } from 'next/og';

export const alt = 'MANCHA — No es para todos.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
          backgroundColor: '#0a0807',
          color: '#FAF3E6',
          padding: '70px 90px',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', fontSize: 24, color: '#E5402B', letterSpacing: 6, textTransform: 'uppercase', marginBottom: 30 }}>
          MANCHA.
        </div>
        <div style={{ display: 'flex', fontSize: 64, fontWeight: 700, lineHeight: 1.18 }}>
          No es para todos.
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: 'rgba(250,247,240,0.6)', marginTop: 26, maxWidth: 820, lineHeight: 1.4 }}>
          Si estás leyendo esto, alguien pensó que merecías encontrarlo.
        </div>
      </div>
    ),
    { ...size }
  );
}
