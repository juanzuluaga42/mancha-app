'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';

const MAX_SIZE = 8 * 1024 * 1024;

export async function signUp(formData) {
  const supabase = await createClient();

  const email = formData.get('email');
  const password = formData.get('password');
  const full_name = formData.get('full_name');
  const role = formData.get('role') === 'artist' ? 'artist' : 'buyer';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, role },
      emailRedirectTo: `${siteUrl}/auth/confirm`,
    },
  });

  if (signUpError) {
    redirect(`/registro?error=${encodeURIComponent(signUpError.message)}&role=${role}`);
  }

  // Confirmación de email desactivada (decisión 1a): iniciamos sesión de inmediato
  // para que el artista pueda subir obras en el mismo momento del registro.
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  // Si la confirmación siguiera activa, signIn falla — caemos al flujo clásico.
  if (signInError || !signInData?.user) {
    if (role === 'buyer') redirect('/registro/revisa-tu-correo');
    redirect('/registro/revisa-tu-correo');
  }

  const user = signInData.user;

  // Aseguramos el email en el perfil (por si el trigger no lo guardó).
  await supabase.from('profiles').update({ email, full_name }).eq('id', user.id);

  if (role === 'buyer') {
    redirect('/para-coleccionistas');
  }

  // ── ARTISTA: crear fila artists + obras opcionales en un solo momento ──
  const { data: season } = await supabase.from('seasons').select('id').eq('is_current', true).maybeSingle();

  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .insert({
      profile_id: user.id,
      season_id: season?.id ?? null,
      display_name: full_name,
      medium: formData.get('medium') || null,
      location: formData.get('location') || null,
      bio: formData.get('bio') || null,
      status: 'pending',
    })
    .select('id')
    .single();

  if (artistError || !artist) {
    // La cuenta quedó creada igual; completará su perfil/obras desde /cuenta.
    redirect('/cuenta');
  }

  // Obras opcionales: cada bloque necesita imagen + título + precio de salida.
  let piecesUploaded = 0;
  for (let i = 1; i <= 3; i++) {
    const file = formData.get(`image_${i}`);
    const title = formData.get(`title_${i}`);
    const minBid = Number(formData.get(`min_bid_${i}`));

    if (!file || typeof file !== 'object' || file.size === 0) continue;
    if (!title || !minBid || minBid <= 0) continue;
    if (file.size > MAX_SIZE) continue;

    let image_url = null;
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${i}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('pieces').upload(path, file);
      if (!uploadError) {
        const { data: publicUrl } = supabase.storage.from('pieces').getPublicUrl(path);
        image_url = publicUrl.publicUrl;
      }
    } catch (e) {
      // Si una imagen falla, no bloqueamos el registro.
    }

    const { error: pieceError } = await supabase.from('pieces').insert({
      artist_id: artist.id,
      title,
      min_bid: minBid,
      image_url,
    });
    if (!pieceError) piecesUploaded++;
  }

  // Recordatorio inmediato (decisión 3a) a quien creó cuenta sin obras.
  if (piecesUploaded === 0) {
    await sendEmail({
      to: email,
      subject: 'Completa tu postulación a MANCHA — sube tus obras',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 4px;">¡Tu cuenta de artista en MANCHA está lista, ${full_name}!</h2>
          <p>Todavía no subiste ninguna obra. MANCHA solo puede revisar tu trabajo cuando tienes al menos una obra cargada.</p>
          <p>Entra a tu cuenta y sube hasta 3 piezas (imagen, título y precio de salida) antes de que cierre la temporada.</p>
          <p style="margin: 20px 0;"><a href="${siteUrl}/cuenta" style="background:#16110D;color:#FAF3E6;padding:12px 22px;border-radius:2px;text-decoration:none;font-size:14px;">Subir mis obras →</a></p>
          <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
        </div>
      `,
    });
  }

  redirect('/cuenta');
}
