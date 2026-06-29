import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';
import { artistReminder } from '@/lib/emails';

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
      const loc = meta.locale === 'en' ? 'en' : 'es';
      // Persiste el idioma del usuario para enviarle correos en su lengua.
      if (user) {
        await supabase.from('profiles').update({ locale: loc }).eq('id', user.id);
      }
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
            const { subject, html } = artistReminder(loc, {
              name: meta.full_name || '',
              url: `${siteUrl}/cuenta`,
            });
            await sendEmail({ to: user.email, subject, html });
          }
        }
      }

      redirect(next);
    }
  }

  redirect(`/login?error=${encodeURIComponent('El enlace de confirmación no es válido o expiró.')}`);
}
