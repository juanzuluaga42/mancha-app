import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  // 'as-needed': el idioma por defecto (es) va sin prefijo ("/"), inglés en "/en/...".
  localePrefix: 'as-needed',
  // Detecta el idioma del navegador y guarda la elección en cookie NEXT_LOCALE.
  localeDetection: true,
});
