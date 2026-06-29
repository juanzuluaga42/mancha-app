import { ImageResponse } from 'next/og';
import { createClient } from '@/utils/supabase/server';
import { resolveCurator } from '@/lib/curatorAccess';
import { manchaFonts } from '@/lib/og';

export const contentType = 'image/png';

const ROLE_LABEL = {
  founder: 'Founder',
  council: 'Founding Curatorial Council',
  guest: 'Guest Curator',
};

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('No autorizado', { status: 401 });
  const curator = await resolveCurator(supabase, user);
  if (!curator) return new Response('No autorizado', { status: 403 });

  const name = curator.display_name || 'Curador';
  const roleLabel = ROLE_LABEL[curator.role] || ROLE_LABEL.council;
  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const fonts = await manchaFonts(`${name} ${roleLabel} ${today} Consejo Curatorial Fundador`);

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', padding: 36, backgroundColor: '#0D0C0A' }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'space-between', padding: '54px 60px',
          border: '1px solid rgba(250,243,230,0.18)', backgroundColor: '#16110D', color: '#FAF3E6',
        }}>
          {/* Marca */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: 4, fontFamily: 'Unbounded' }}>MANCHA.</span>
            <div style={{ width: 30, height: 2, backgroundColor: '#E5402B', display: 'flex' }} />
          </div>

          {/* Centro */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <span style={{ fontSize: 11, letterSpacing: 6, textTransform: 'uppercase', color: 'rgba(250,243,230,0.4)' }}>
              Certificado de nombramiento
            </span>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, fontFamily: 'Unbounded', marginTop: 26, lineHeight: 1.05 }}>
              {name}
            </div>
            <div style={{ display: 'flex', fontSize: 22, color: '#8E6FD1', marginTop: 18, letterSpacing: 1 }}>
              {roleLabel}
            </div>
            <div style={{ display: 'flex', fontSize: 16, color: 'rgba(250,243,230,0.62)', marginTop: 30, fontStyle: 'italic', fontFamily: 'Newsreader', maxWidth: 720, textAlign: 'center', lineHeight: 1.5 }}>
              Integra el consejo que evalúa la obra a ciegas y construye el estándar de MANCHA.
            </div>
            <div style={{ display: 'flex', fontSize: 15, color: '#F2B705', marginTop: 22, fontStyle: 'italic', fontFamily: 'Newsreader' }}>
              La obra habla primero.
            </div>
          </div>

          {/* Pie */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(250,243,230,0.3)' }}>{today}</span>
            <span style={{ fontSize: 11, letterSpacing: 1, color: 'rgba(250,243,230,0.3)' }}>manchagallery.com</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1240,
      height: 877,
      fonts,
      headers: { 'Content-Disposition': 'attachment; filename="MANCHA-consejo-curatorial.png"' },
    }
  );
}
