import { ImageResponse } from 'next/og';
import { createAdminClient } from '@/utils/supabase/admin';

export const contentType = 'image/png';

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: piece } = await supabase
    .from('pieces')
    .select('title, image_url, sold, artists(display_name), bids(amount, buyer:profiles(full_name))')
    .eq('id', id)
    .maybeSingle();

  if (!piece || !piece.sold) {
    return new Response('Este certificado todavía no está disponible.', { status: 404 });
  }

  const bids = [...(piece.bids ?? [])].sort((a, b) => Number(b.amount) - Number(a.amount));
  const winner = bids[0];
  const collectorName = winner?.buyer?.full_name || 'Un coleccionista de MANCHA';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: '#16110D',
          color: '#FAF3E6',
          padding: '70px 80px',
        }}
      >
        <div style={{ display: 'flex', fontSize: 22, color: '#E5402B', letterSpacing: 6, textTransform: 'uppercase' }}>MANCHA.</div>
        <div style={{ display: 'flex', fontSize: 16, color: 'rgba(250,247,240,0.55)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 10 }}>
          Certificado de colección
        </div>

        <div
          style={{
            display: 'flex',
            width: 640,
            height: 640,
            marginTop: 50,
            border: '2px solid rgba(250,247,240,0.25)',
            backgroundColor: '#241c16',
            backgroundImage: piece.image_url ? `url(${piece.image_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <div style={{ display: 'flex', fontSize: 46, fontWeight: 700, marginTop: 50, textAlign: 'center' }}>{piece.title}</div>
        <div style={{ display: 'flex', fontSize: 26, color: 'rgba(250,247,240,0.65)', marginTop: 10 }}>
          {piece.artists?.display_name ?? ''}
        </div>

        <div style={{ display: 'flex', fontSize: 18, color: 'rgba(250,247,240,0.5)', marginTop: 48, letterSpacing: 1 }}>
          Adquirida por
        </div>
        <div style={{ display: 'flex', fontSize: 32, marginTop: 4 }}>{collectorName}</div>
      </div>
    ),
    { width: 1080, height: 1350 }
  );
}
