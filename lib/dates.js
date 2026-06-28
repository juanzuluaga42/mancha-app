// lib/dates.js — Manejo centralizado de fechas (Frente 2: zona horaria).
//
// Regla de oro: guardar/definir instantes en UTC, convertir al MOSTRAR.
//
// Dos tipos de fecha en MANCHA, que se tratan distinto:
//
//  1) INSTANTE real (timestamptz): un momento exacto en el tiempo, p. ej. el
//     cierre de una subasta (`seasons.ends_at`) o un hito del calendario.
//     → Se muestra en la zona horaria DEL VISITANTE (`formatInstant` sin tz,
//       vía el componente cliente <LocalDate>). Cada quien lo ve en su hora.
//
//  2) FECHA de calendario (columna `date`, p. ej. `seasons.starts_at`):
//     un día del calendario sin hora ("1 de septiembre"), igual para todos.
//     → Se muestra SIEMPRE en UTC (`formatCalendarDate`). Convertirla a la hora
//       local rompería el día (ej.: "2026-09-01" se parsea como medianoche UTC
//       y en UTC-3 se vería "31 ago"). Es server-safe, no necesita cliente.

// Zona horaria de referencia de la galería (Colombia, UTC-5). Se usa como
// fallback en el primer render de <LocalDate> antes de conocer la del visitante.
export const GALLERY_TZ = 'America/Bogota';

// ── Hitos del calendario (instantes en UTC) ───────────────────────────────
// Calendario vigente: convocatoria 1–31 ago 2026, Temporada 01 abre 1 sep 2026.
// Definidos como medianoche UTC-5 (mismos instantes que los antiguos literales
// '…T00:00:00-05:00', para no alterar el countdown).
export const CONV_OPEN  = '2026-08-01T05:00:00.000Z'; // 1 ago 2026, 00:00 (UTC-5)
export const CONV_CLOSE = '2026-08-31T05:00:00.000Z'; // 31 ago 2026, 00:00 (UTC-5)
export const LAUNCH     = '2026-09-01T05:00:00.000Z'; // 1 sep 2026, 00:00 (UTC-5)

// Mapea el locale de next-intl ('es' | 'en') al locale de formato Intl.
function intlLocale(locale) {
  return locale === 'en' ? 'en-US' : 'es-AR';
}

// Formatea un INSTANTE (timestamptz / Date / ISO) en una zona horaria.
// Si `timeZone` se omite, usa la zona del runtime (en el navegador = la del
// visitante). Pensado para `ends_at` y los hitos del calendario.
export function formatInstant(value, locale = 'es', options = {}, timeZone) {
  const opts = { ...options };
  if (timeZone) opts.timeZone = timeZone;
  return new Intl.DateTimeFormat(intlLocale(locale), opts).format(new Date(value));
}

// Formatea una FECHA de calendario (columna `date`) fijada en UTC, para que el
// día mostrado sea el mismo para cualquier visitante. Server-safe.
export function formatCalendarDate(value, locale = 'es', options = {}) {
  return new Intl.DateTimeFormat(intlLocale(locale), { ...options, timeZone: 'UTC' }).format(new Date(value));
}
