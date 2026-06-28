'use client';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

// Selector ES / EN. Cambia el idioma conservando la ruta actual y guarda la
// elección en la cookie NEXT_LOCALE (lo hace next-intl al cambiar de locale).
export default function LocaleSwitch() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function change(next) {
    if (next !== locale) router.replace(pathname, { locale: next });
  }

  return (
    <div className="locale-switch" role="group" aria-label="Idioma / Language">
      <button
        type="button"
        onClick={() => change('es')}
        className={`locale-switch-btn${locale === 'es' ? ' active' : ''}`}
        aria-pressed={locale === 'es'}
      >
        ES
      </button>
      <span className="locale-switch-sep">/</span>
      <button
        type="button"
        onClick={() => change('en')}
        className={`locale-switch-btn${locale === 'en' ? ' active' : ''}`}
        aria-pressed={locale === 'en'}
      >
        EN
      </button>
    </div>
  );
}
