'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/lib/email';

const MAX_SIZE = 8 * 1024 * 1024;

export async function submitApplication(formData) {
  const supabase = await createClient();

  const full_name = formData.get('full_name');
  const instagram = formData.get('instagram') || null;
  const email = formData.get('email');
  const city = formData.get('city') || null;
  const bio = formData.get('bio');
  const portfolio_url = formData.get('portfolio_url') || null;

  if (!full_name || !email || !bio) {
    redirect(`/postular?error=${encodeURIComponent('Completa al menos tu nombre, correo y biografía.')}`);
  }

  const imageUrls = [null, null, null];

  for (let i = 0; i < 3; i++) {
    const file = formData.get(`image_${i + 1}`);
    if (file && typeof file === 'object' && file.size > 0) {
      if (file.size > MAX_SIZE) {
        redirect(`/postular?error=${encodeURIComponent(`La imagen ${i + 1} pesa demasiado — el máximo son 8 MB.`)}`);
      }
      try {
        const ext = file.name.split('.').pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('applications').upload(path, file);
        if (!uploadError) {
          const { data: publicUrl } = supabase.storage.from('applications').getPublicUrl(path);
          imageUrls[i] = publicUrl.publicUrl;
        }
      } catch (e) {
        // Si una imagen falla, no bloqueamos toda la postulación por eso.
      }
    }
  }

  const { error } = await supabase.from('artist_applications').insert({
    full_name,
    instagram,
    email,
    city,
    bio,
    portfolio_url,
    image_url_1: imageUrls[0],
    image_url_2: imageUrls[1],
    image_url_3: imageUrls[2],
  });

  if (error) {
    redirect(`/postular?error=${encodeURIComponent('No pudimos enviar tu postulación — prueba de nuevo en un momento.')}`);
  }

  await sendEmail({
    to: email,
    subject: 'Recibimos tu postulación a MANCHA',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="margin-bottom: 4px;">¡Recibimos tu postulación, ${full_name}!</h2>
        <p>La estamos revisando. Si tu trabajo entra en la próxima temporada, te escribimos por este correo con los siguientes pasos.</p>
        <p style="font-size: 13px; color: #666; margin-top: 24px;">— El equipo de MANCHA</p>
      </div>
    `,
  });

  redirect(`/postular?success=${encodeURIComponent('¡Listo! Recibimos tu postulación. Te avisamos por correo apenas la revisemos.')}`);
}
