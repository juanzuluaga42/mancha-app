import { ImageResponse } from 'next/og';

export const alt = 'MANCHA — Arte emergente seleccionado a mano.';
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
          backgroundColor: '#16110D',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Manchas de color decorativas */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -60,
            width: 340,
            height: 300,
            borderRadius: '60% 40% 55% 45% / 50% 45% 55% 50%',
            background: 'radial-gradient(ellipse, rgba(242,183,5,0.18) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -40,
            width: 280,
            height: 240,
            borderRadius: '45% 55% 40% 60% / 55% 40% 60% 45%',
            background: 'radial-gradient(ellipse, rgba(142,111,209,0.2) 0%, transparent 70%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '40%',
            right: '18%',
            width: 160,
            height: 140,
            borderRadius: '50% 50% 45% 55% / 45% 55% 50% 50%',
            background: 'radial-gradient(ellipse, rgba(229,64,43,0.22) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Línea roja vertical izquierda */}
        <div
          style={{
            position: 'absolute',
            left: 70,
            top: 0,
            bottom: 0,
            width: 3,
            background: 'linear-gradient(to bottom, transparent, #E5402B 30%, #E5402B 70%, transparent)',
            display: 'flex',
          }}
        />

        {/* Contenido */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '70px 110px',
            gap: 0,
          }}
        >
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ width: 32, height: 2, backgroundColor: '#E5402B', display: 'flex' }} />
            <span style={{ fontSize: 14, color: 'rgba(250,243,230,0.5)', letterSpacing: 4, textTransform: 'uppercase' }}>
              Galería de arte online
            </span>
          </div>

          {/* Headline */}
          <div style={{ display: 'flex', fontSize: 80, fontWeight: 800, color: '#FAF3E6', lineHeight: 1.0, letterSpacing: -1 }}>
            Primero tú.
          </div>
          <div style={{ display: 'flex', fontSize: 80, fontWeight: 800, color: '#E5402B', fontStyle: 'italic', lineHeight: 1.0, letterSpacing: -1, marginTop: 4 }}>
            Después el mundo.
          </div>

          {/* Sub */}
          <div style={{ display: 'flex', fontSize: 24, color: 'rgba(250,243,230,0.55)', marginTop: 32, lineHeight: 1.5, maxWidth: 680 }}>
            Arte emergente seleccionado a mano. Pocos artistas por temporada, tres piezas cada uno.
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 48 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#FAF3E6', letterSpacing: 3 }}>MANCHA.</span>
            <div style={{ width: 1, height: 16, backgroundColor: 'rgba(250,243,230,0.2)', display: 'flex' }} />
            <span style={{ fontSize: 14, color: 'rgba(250,243,230,0.35)', letterSpacing: 1 }}>mancha-app.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
