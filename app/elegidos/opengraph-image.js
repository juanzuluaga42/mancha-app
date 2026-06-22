import { ImageResponse } from 'next/og';

export const alt = 'MANCHA — Arte seleccionado a mano.';
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
          backgroundColor: '#0a0807',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Manchas de color difusas */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            right: -80,
            width: 500,
            height: 420,
            borderRadius: '55% 45% 60% 40% / 45% 60% 40% 55%',
            background: 'radial-gradient(ellipse, rgba(142,111,209,0.25) 0%, transparent 65%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            left: -50,
            width: 420,
            height: 360,
            borderRadius: '40% 60% 55% 45% / 60% 40% 55% 45%',
            background: 'radial-gradient(ellipse, rgba(229,64,43,0.2) 0%, transparent 65%)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '35%',
            width: 200,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(242,183,5,0.12) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Contenido centrado */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '70px 100px',
            textAlign: 'center',
          }}
        >
          {/* Marca */}
          <span style={{ fontSize: 36, fontWeight: 800, color: '#E5402B', letterSpacing: 6, textTransform: 'uppercase', marginBottom: 40 }}>
            MANCHA.
          </span>

          {/* Línea principal */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', fontSize: 58, fontWeight: 700, color: 'rgba(250,243,230,0.75)', lineHeight: 1.2 }}>
              Si estás leyendo esto,
            </div>
            <div style={{ display: 'flex', fontSize: 58, fontWeight: 700, color: 'rgba(250,243,230,0.75)', lineHeight: 1.2 }}>
              alguien pensó que merecías
            </div>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, color: '#FAF3E6', lineHeight: 1.1, fontStyle: 'italic' }}>
              encontrarlo.
            </div>
          </div>

          {/* Separador */}
          <div style={{ width: 48, height: 2, backgroundColor: '#E5402B', display: 'flex', marginTop: 44, marginBottom: 28 }} />

          {/* Sub */}
          <div style={{ display: 'flex', fontSize: 20, color: 'rgba(250,243,230,0.4)', letterSpacing: 2, textTransform: 'uppercase' }}>
            Arte seleccionado a mano · Cada temporada
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
