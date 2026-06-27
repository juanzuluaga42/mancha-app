import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';
import { escapeHtml } from '@/lib/utils';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/cuenta';

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      // Si es artista y todavía no tiene perfil, lo creamos desde la metadata
      // que se guardó en el registro. Las obras se suben luego desde /cuenta.
      const { data: { user } } = await supabase.auth.getUser();
      const meta = user?.user_metadata ?? {};
      if (user && meta.role === 'artist') {
        const { data: existing } = await supabase.from('artists').select('id').eq('profile_id', user.id).maybeSingle();
        if (!existing) {
          const { data: season } = await supabase.from('seasons').select('id').eq('is_current', true).maybeSingle();
          const { error: insertError } = await supabase.from('artists').insert({
            profile_id: user.id,
            season_id: season?.id ?? null,
            display_name: meta.full_name || user.email,
            medium: meta.medium ?? null,
            location: meta.location ?? null,
            bio: meta.bio ?? null,
            status: 'pending',
          });

          // Recordatorio inmediato (decisión 3a): acaba de registrarse sin obras.
          if (!insertError && user.email) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
            await sendEmail({
              to: user.email,
              subject: 'Completa tu postulación a MANCHA — sube tus obras',
              html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
                  <h2 style="margin-bottom: 4px;">¡Tu cuenta de artista en MANCHA está lista, ${escapeHtml(meta.full_name || '')}!</h2>
                  <p>Todavía no subiste ninguna obra. MANCHA solo puede revisar tu trabajo cuando tienes al menos una obra cargada.</p>
                  <p>Entra a tu cuenta y sube hasta 3 piezas (imagen, título y precio de salida) antes de que cierre la temporada.</p>
                  <p style="margin: 20px 0;"><a href="${siteUrl}/cuenta" style="background:#16110D;color:#FAF3E6;padding:12px 22px;border-radius:2px;text-decoration:none;font-size:14px;">Subir mis obras →</a></p>
                  <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
                </div>
              `,
            });
          }
        }
      }

      redirect(next);
    }
  }

  redirect(`/login?error=${encodeURIComponent('El enlace de confirmación no es válido o expiró.')}`);
}
