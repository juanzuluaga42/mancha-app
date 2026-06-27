import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';
import { manchaFonts } from '@/lib/og';

export const alt = 'MANCHA';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: piece } = await supabase
    .from('pieces')
    .select('title, image_url, min_bid, artists(display_name)')
    .eq('id', id)
    .maybeSingle();

  const hasPhoto = !!piece?.image_url;
  const title = piece?.title ?? 'Una pieza de MANCHA';
  const artist = piece?.artists?.display_name ?? '';
  const fonts = await manchaFonts(`${title} ${artist} Subasta en curso`);

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
        {/* Imagen de fondo */}
        {hasPhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={piece.image_url}
            alt={title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.45,
            }}
          />
        )}

        {/* Gradiente lateral: oscuro a la derecha para el texto */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: hasPhoto
              ? 'linear-gradient(90deg, rgba(22,17,13,0.15) 0%, rgba(22,17,13,0.7) 48%, rgba(22,17,13,0.97) 100%)'
              : 'linear-gradient(135deg, #1e1510 0%, #16110D 100%)',
            display: 'flex',
          }}
        />

        {/* Acento rojo vertical */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 0,
            width: 4,
            height: 120,
            backgroundColor: '#E5402B',
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
            justifyContent: 'space-between',
            padding: '56px 70px',
          }}
        >
          {/* Top: marca */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: 'Unbounded', fontSize: 18, fontWeight: 800, color: '#FAF3E6', letterSpacing: 2 }}>
              MANCHA.
            </span>
            <div style={{ width: 1, height: 16, backgroundColor: 'rgba(250,243,230,0.2)', display: 'flex' }} />
            <span style={{ fontSize: 13, color: 'rgba(250,243,230,0.45)', letterSpacing: 2, textTransform: 'uppercase' }}>
              Subasta en curso
            </span>
          </div>

          {/* Bottom: título + artista */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', width: 48, height: 3, backgroundColor: '#E5402B', marginBottom: 20 }} />
            <div
              style={{
                display: 'flex',
                fontFamily: 'Unbounded',
                fontSize: title.length > 32 ? 52 : 64,
                fontWeight: 800,
                color: '#FAF3E6',
                lineHeight: 1.05,
                letterSpacing: -1,
                maxWidth: 900,
              }}
            >
              {title}
            </div>
            {artist && (
              <div style={{ display: 'flex', fontFamily: 'Newsreader', fontSize: 30, color: '#E5402B', marginTop: 16, fontStyle: 'italic' }}>
                {artist}
              </div>
            )}
            <div style={{ display: 'flex', fontSize: 16, color: 'rgba(250,243,230,0.4)', marginTop: 16, letterSpacing: 1 }}>
              mancha-app.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, ...(fonts.length ? { fonts } : {}) }
  );
}
