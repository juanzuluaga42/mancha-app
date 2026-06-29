'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { applyToCouncil } from '@/app/[locale]/consejo/actions';

function Submit() {
  const { pending } = useFormStatus();
  const t = useTranslations('council');
  return (
    <button type="submit" className="consejo-submit" disabled={pending}>
      {pending ? t('sending') : t('submit')}
    </button>
  );
}

export default function CouncilForm() {
  const t = useTranslations('council');
  return (
    <form action={applyToCouncil} className="consejo-form">
      <div className="consejo-field">
        <label htmlFor="cf-name">{t('nameLabel')}</label>
        <input id="cf-name" name="name" type="text" required maxLength={200} autoComplete="name" />
      </div>
      <div className="consejo-field">
        <label htmlFor="cf-email">{t('emailLabel')}</label>
        <input id="cf-email" name="email" type="email" required maxLength={200} autoComplete="email" />
      </div>
      <div className="consejo-field">
        <label htmlFor="cf-focus">{t('focusLabel')}</label>
        <input id="cf-focus" name="focus" type="text" maxLength={300} placeholder={t('focusPlaceholder')} />
      </div>
      <div className="consejo-field">
        <label htmlFor="cf-portfolio">{t('portfolioLabel')}</label>
        <input id="cf-portfolio" name="portfolio" type="text" maxLength={500} placeholder="https://" />
      </div>
      <div className="consejo-field">
        <label htmlFor="cf-statement">{t('statementLabel')}</label>
        <textarea id="cf-statement" name="statement" rows={4} maxLength={4000} placeholder={t('statementPlaceholder')} />
      </div>
      <Submit />
    </form>
  );
}
