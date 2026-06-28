'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

// Selector de idioma con banderitas. Cambia el idioma conservando la ruta
// actual y guarda la elección en la cookie NEXT_LOCALE (lo hace next-intl).
const LOCALES = [
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
];

export default function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function change(next) {
    if (next !== locale) router.replace(pathname, { locale: next });
  }

  return (
    <div className="locale-switch" role="group" aria-label="Idioma / Language">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => change(l.code)}
          className={`locale-flag${locale === l.code ? ' active' : ''}`}
          aria-pressed={locale === l.code}
          aria-label={l.label}
          title={l.label}
        >
          {l.flag}
        </button>
      ))}
    </div>
  );
}
