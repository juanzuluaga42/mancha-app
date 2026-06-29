import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  return transporter;
}

// Correo institucional de MANCHA (recibe los avisos internos).
export const INSTITUTIONAL_EMAIL = 'mancha.gallery@gmail.com';

// ────────────────────────────────────────────────────────────────
// Plantilla de correo institucional MANCHA. Tipografía editorial,
// generosa, con cabecera y pie de marca. Email-safe (tablas + estilos
// inline). Los valores dinámicos deben venir ya escapados por el caller.
//   heading   : título principal
//   lead      : bajada destacada (opcional)
//   paragraphs: array de párrafos (HTML simple permitido)
//   cta       : { label, href } (opcional)
//   note      : línea fina al pie del cuerpo (opcional)
//   signoff   : firma (por defecto institucional)
//   preheader : texto de vista previa en la bandeja (opcional)
// ────────────────────────────────────────────────────────────────
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

export function brandedEmail({ heading, lead, paragraphs = [], cta, note, signoff = 'MANCHA', preheader = '' } = {}) {
  const leadHtml = lead
    ? `<p style="margin:0 0 22px;font-family:${SERIF};font-size:20px;line-height:1.5;font-style:italic;color:#16110D;">${lead}</p>`
    : '';
  const parasHtml = paragraphs
    .map((p) => `<p style="margin:0 0 18px;font-family:${SANS};font-size:16px;line-height:1.7;color:#2c2620;">${p}</p>`)
    .join('');
  const ctaHtml = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 26px;">
         <tr><td style="border-radius:100px;background:#16110D;">
           <a href="${cta.href}" style="display:inline-block;padding:15px 30px;font-family:${SANS};font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:#FAF3E6;text-decoration:none;border-radius:100px;">${cta.label}</a>
         </td></tr>
       </table>`
    : '';
  const noteHtml = note
    ? `<p style="margin:22px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:#8a8178;">${note}</p>`
    : '';

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="x-apple-disable-message-reformatting"/></head>
<body style="margin:0;padding:0;background:#0D0C0A;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0D0C0A;">
  <tr><td align="center" style="padding:36px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#FAF3E6;">
      <!-- Cabecera -->
      <tr><td style="background:#16110D;padding:30px 40px;">
        <div style="font-family:${SERIF};font-weight:bold;font-size:26px;letter-spacing:1px;color:#FAF3E6;">MANCHA<span style="color:#E5402B;">.</span></div>
        <div style="font-family:${SANS};font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#8c8378;margin-top:8px;">Galería de arte emergente</div>
      </td></tr>
      <!-- Cuerpo -->
      <tr><td style="padding:42px 40px 36px;">
        <h1 style="margin:0 0 20px;font-family:${SERIF};font-size:27px;line-height:1.28;color:#16110D;">${heading}</h1>
        ${leadHtml}
        ${parasHtml}
        ${ctaHtml}
        <p style="margin:30px 0 0;font-family:${SERIF};font-size:16px;font-style:italic;color:#6b6359;">— ${signoff}</p>
        ${noteHtml}
      </td></tr>
      <!-- Pie -->
      <tr><td style="background:#16110D;padding:24px 40px;">
        <a href="https://manchagallery.com" style="font-family:${SANS};font-size:13px;letter-spacing:.04em;color:#FAF3E6;text-decoration:none;">manchagallery.com</a>
        <span style="color:#5a5249;"> · </span>
        <a href="https://instagram.com/mancha.gallery" style="font-family:${SANS};font-size:13px;color:#8c8378;text-decoration:none;">@mancha.gallery</a>
        <div style="font-family:${SANS};font-size:11px;color:#5a5249;margin-top:10px;">Lo que ves aquí, lo viste antes que el mundo.</div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

// Aviso interno al equipo de MANCHA. Mejor esfuerzo: nunca bloquea el flujo
// del usuario si el correo falla.
export async function notifyAdmin({ subject, html }) {
  try {
    return await sendEmail({ to: INSTITUTIONAL_EMAIL, subject: `MANCHA · ${subject}`, html });
  } catch (e) {
    console.error('No se pudo enviar el aviso interno:', e?.message);
    return { sent: false };
  }
}

export async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  if (!t) {
    console.error('Faltan las variables GMAIL_USER / GMAIL_APP_PASSWORD — no se envió el correo.');
    return { sent: false };
  }

  try {
    await t.sendMail({
      from: `MANCHA <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return { sent: true };
  } catch (e) {
    console.error('Error enviando correo:', e.message);
    return { sent: false };
  }
}
