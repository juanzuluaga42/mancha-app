import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { sendEmail, brandedEmail } from '@/lib/email';
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
              subject: 'Tu cuenta de artista en MANCHA está lista — sube tus obras',
              html: brandedEmail({
                heading: 'Tu cuenta de artista está lista',
                lead: `Bienvenido a MANCHA, ${escapeHtml(meta.full_name || '')}.`,
                paragraphs: [
                  `Confirmaste tu correo: ya eres parte del proceso de selección de la temporada.`,
                  `Todavía no subiste ninguna obra, y ese es el paso que falta. MANCHA solo puede revisar tu trabajo cuando hay al menos una pieza cargada.`,
                  `Entra a tu cuenta y sube <b>hasta 3 obras</b> —imagen en alta calidad, título, técnica y precio de salida— antes de que cierre la convocatoria. Cada temporada entra un grupo pequeño, elegido a mano: la calidad de lo que subas es lo que define tu lugar.`,
                ],
                cta: { label: 'Subir mis obras', href: `${siteUrl}/cuenta` },
                signoff: 'El equipo de MANCHA',
                note: 'Si no creaste esta cuenta, puedes ignorar este mensaje.',
              }),
            });
          }
        }
      }

      redirect(next);
    }
  }

  redirect(`/login?error=${encodeURIComponent('El enlace de confirmación no es válido o expiró.')}`);
}
