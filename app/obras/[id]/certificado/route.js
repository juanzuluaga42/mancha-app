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
  const finalAmount = winner ? `$${Number(winner.amount).toLocaleString('es-AR')} USD` : '';
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
            width: '46%',
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
          {/* overlay sutil en la parte inferior para el número */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '30%',
              background: 'linear-gradient(to top, rgba(22,17,13,0.85), transparent)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '24px 28px',
            }}
          >
            <span style={{ fontSize: 13, color: 'rgba(250,243,230,0.5)', letterSpacing: 3, textTransform: 'uppercase' }}>
              Obra original
            </span>
          </div>
        </div>

        {/* ── RIGHT: contenido del certificado ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '56px 52px',
            borderLeft: '1px solid rgba(250,243,230,0.1)',
          }}
        >
          {/* Marca */}
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#FAF3E6', letterSpacing: 2 }}>MANCHA.</span>
            </div>
            <div style={{ width: 32, height: 2, backgroundColor: '#E5402B', display: 'flex' }} />
          </div>

          {/* Certificado label */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 48 }}>
            <span style={{ fontSize: 10, color: 'rgba(250,243,230,0.4)', letterSpacing: 4, textTransform: 'uppercase' }}>
              Certificado de colección
            </span>
          </div>

          {/* Título */}
          <div
            style={{
              display: 'flex',
              fontSize: piece.title.length > 30 ? 32 : 40,
              fontWeight: 700,
              color: '#FAF3E6',
              marginTop: 14,
              lineHeight: 1.1,
              maxWidth: '100%',
            }}
          >
            {piece.title}
          </div>

          {/* Artista */}
          <div style={{ display: 'flex', fontSize: 18, color: '#E5402B', marginTop: 10, fontStyle: 'italic' }}>
            {artistName}
          </div>

          {/* Meta técnica */}
          {meta && (
            <div style={{ display: 'flex', fontSize: 13, color: 'rgba(250,243,230,0.45)', marginTop: 10, letterSpacing: 1 }}>
              {meta}
            </div>
          )}

          {/* Separador */}
          <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(250,243,230,0.1)', display: 'flex', marginTop: 36 }} />

          {/* Coleccionista */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 28 }}>
            <span style={{ fontSize: 10, color: 'rgba(250,243,230,0.4)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
              Adquirida por
            </span>
            <span style={{ fontSize: 20, color: '#FAF3E6', fontWeight: 600, lineHeight: 1.3, maxWidth: '100%' }}>{discoveryLine}</span>
            {finalAmount && (
              <span style={{ fontSize: 14, color: '#F2B705', marginTop: 8, letterSpacing: 1 }}>{finalAmount}</span>
            )}
          </div>

          {/* Separador */}
          <div style={{ width: '100%', height: 1, backgroundColor: 'rgba(250,243,230,0.1)', display: 'flex', marginTop: 28 }} />

          {/* Pie */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 24, gap: 6 }}>
            <span style={{ fontSize: 11, color: 'rgba(250,243,230,0.3)', letterSpacing: 2, textTransform: 'uppercase' }}>
              {today}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(250,243,230,0.25)', letterSpacing: 1 }}>
              mancha-app.vercel.app
            </span>
          </div>

          {/* Número decorativo de fondo */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 40,
              fontSize: 120,
              fontWeight: 900,
              color: 'rgba(250,243,230,0.03)',
              lineHeight: 1,
              display: 'flex',
              pointerEvents: 'none',
            }}
          >
            №
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 800 }
  );
}
