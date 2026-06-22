import { ImageResponse } from 'next/og';
import { createAdminClient } from '@/utils/supabase/admin';

export const contentType = 'image/png';

export async function GET(request, { params }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: piece } = await supabase
    .from('pieces')
    .select('title, technique, dimensions, year, image_url, sold, artists(display_name, season:seasons(name)), bids(amount, buyer:profiles(full_name))')
    .eq('id', id)
    .maybeSingle();

  if (!piece || !piece.sold) {
    return new Response('Este certificado todavía no está disponible.', { status: 404 });
  }

  const bids = [...(piece.bids ?? [])].sort((a, b) => Number(b.amount) - Number(a.amount));
  const winner = bids[0];
  const collectorName = winner?.buyer?.full_name || 'Un coleccionista de MANCHA';
  const artistName = piece.artists?.display_name ?? '';
  const seasonName = piece.artists?.season?.name ?? null;
  const meta = [piece.technique, piece.dimensions, piece.year].filter(Boolean).join(' · ');
  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const discoveryLine = seasonName
    ? `${collectorName} descubrió a ${artistName} en la ${seasonName} de MANCHA.`
    : `${collectorName} descubrió a ${artistName} en MANCHA.`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: '#16110D',
          color: '#FAF3E6',
        }}
      >
        {/* ── LEFT: imagen de la obra ── */}
        <div
          style={{
            width: '44%',
            height: '100%',
            display: 'flex',
            position: 'relative',
            backgroundColor: '#241c16',
            flexShrink: 0,
          }}
        >
          {piece.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={piece.image_url}
              alt={piece.title}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#E5402B,#F2B705)', display: 'flex' }} />
          )}
          {/* overlay inferior */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '40%',
              background: 'linear-gradient(to top, rgba(22,17,13,0.92), transparent)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '28px 32px',
            }}
          >
            <span style={{ fontSize: 11, color: 'rgba(250,243,230,0.45)', letterSpacing: 4, textTransform: 'uppercase' }}>
              Obra original · Única
            </span>
          </div>
        </div>

        {/* ── RIGHT: contenido del certificado ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '52px 50px',
            borderLeft: '1px solid rgba(250,243,230,0.08)',
          }}
        >
          {/* Marca */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#FAF3E6', letterSpacing: 3, textTransform: 'uppercase' }}>MANCHA.</span>
            <div style={{ width: 28, height: 2, backgroundColor: '#E5402B', display: 'flex' }} />
          </div>

          {/* Certificado label */}
          <span style={{ fontSize: 10, color: 'rgba(250,243,230,0.35)', letterSpacing: 5, textTransform: 'uppercase', marginTop: 44 }}>
            Certificado de colección
          </span>

          {/* Título */}
          <div
            style={{
              display: 'flex',
              fontSize: piece.title.length > 28 ? 30 : 38,
              fontWeight: 700,
              color: '#FAF3E6',
              marginTop: 12,
              lineHeight: 1.1,
            }}
          >
            {piece.title}
          </div>

          {/* Artista */}
          <div style={{ display: 'flex', fontSize: 17, color: '#E5402B', marginTop: 8, fontStyle: 'italic' }}>
            {artistName}
          </div>

          {/* Meta técnica */}
          {meta && (
            <div style={{ display: 'flex', fontSize: 12, color: 'rgba(250,243,230,0.38)', marginTop: 8, letterSpacing: 1 }}>
              {meta}
            </div>
          )}

          {/* Separador */}
          <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(250,243,230,0.08)', display: 'flex', marginTop: 32 }} />

          {/* Coleccionista */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 26, gap: 10 }}>
            <span style={{ fontSize: 10, color: 'rgba(250,243,230,0.35)', letterSpacing: 4, textTransform: 'uppercase' }}>
              Coleccionista
            </span>
            <span style={{ fontSize: 18, color: '#FAF3E6', fontWeight: 600, lineHeight: 1.35 }}>
              {discoveryLine}
            </span>
          </div>

          {/* Separador */}
          <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(250,243,230,0.08)', display: 'flex', marginTop: 26 }} />

          {/* Manifiesto */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22, gap: 6 }}>
            <span style={{ fontSize: 13, color: '#F2B705', fontStyle: 'italic', lineHeight: 1.5 }}>
              "Quien descubre a un artista antes que el mundo no compra arte. Deja una marca."
            </span>
          </div>

          {/* Pie */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto', gap: 5 }}>
            <span style={{ fontSize: 10, color: 'rgba(250,243,230,0.25)', letterSpacing: 2, textTransform: 'uppercase' }}>
              {today}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(250,243,230,0.2)', letterSpacing: 1 }}>
              mancha-app.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 800 }
  );
}
