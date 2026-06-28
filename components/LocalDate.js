'use client';

// <LocalDate> — muestra un INSTANTE (timestamptz) en la zona horaria del
// visitante. (Frente 2: zona horaria.)
//
// Primer render (servidor + hidratación): formatea en la zona de referencia de
// la galería (GALLERY_TZ) → es determinista, así servidor y cliente coinciden y
// no hay mismatch de hidratación, y queda contenido válido para SEO / sin-JS.
// Tras montar: re-formatea en la zona horaria real del navegador.
//
// Para fechas de CALENDARIO (columna `date`, p. ej. seasons.starts_at) NO uses
// este componente: usá formatCalendarDate() server-side (fijo en UTC).

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { formatInstant, GALLERY_TZ } from '@/lib/dates';

export default function LocalDate({ iso, options = {} }) {
  const locale = useLocale();
  const optsKey = JSON.stringify(options);

  const [text, setText] = useState(() => formatInstant(iso, locale, options, GALLERY_TZ));

  useEffect(() => {
    // Ya en el navegador: sin timeZone → usa la del visitante.
    setText(formatInstant(iso, locale, options));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso, locale, optsKey]);

  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}
