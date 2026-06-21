import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';

export const alt = 'MANCHA';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: piece } = await supabase
    .from('pieces')
    .select('title, image_url, artists(display_name)')
    .eq('id', id)
    .maybeSingle();

  const hasPhoto = !!piece?.image_url;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#FAF3E6',
          backgroundImage: hasPhoto ? `url(${piece.image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '64px 70px',
            background: hasPhoto ? 'linear-gradient(transparent, rgba(22,17,13,0.88))' : 'transparent',
          }}
        >
          <div style={{ display: 'flex', fontSize: 26, color: '#E5402B', letterSpacing: 4, textTransform: 'uppercase' }}>MANCHA</div>
          <div style={{ display: 'flex', fontSize: 58, fontWeight: 700, color: hasPhoto ? '#FAF3E6' : '#16110D', marginTop: 14, lineHeight: 1.1 }}>
            {piece?.title ?? 'Una pieza de MANCHA'}
          </div>
          <div style={{ display: 'flex', fontSize: 30, color: hasPhoto ? 'rgba(250,247,240,0.82)' : '#6B6359', marginTop: 10 }}>
            {piece?.artists?.display_name ?? ''}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
