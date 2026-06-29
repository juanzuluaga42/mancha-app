'use client';
import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { signUp } from '@/app/[locale]/registro/actions';
import SubmitButton from '@/components/SubmitButton';
import { mediumOptions } from '@/lib/mediums';

export default function RegistroForm({ defaultRole = 'buyer' }) {
  const [role, setRole] = useState(defaultRole);
  const isArtist = role === 'artist';
  const t = useTranslations('auth');
  const locale = useLocale();
  const mediums = mediumOptions(locale);

  return (
    <form action={signUp}>
      <div className="role-toggle">
        <label className="role-option">
          <input
            type="radio" name="role" value="buyer"
            checked={role === 'buyer'} onChange={() => setRole('buyer')}
          />
          {t('roleCollector')}
        </label>
        <label className="role-option">
          <input
            type="radio" name="role" value="artist"
            checked={role === 'artist'} onChange={() => setRole('artist')}
          />
          {t('roleArtist')}
        </label>
      </div>

      <div className="field">
        <label htmlFor="full_name">{isArtist ? t('nameArtist') : t('nameFull')}</label>
        <input id="full_name" name="full_name" type="text" required />
      </div>
      <div className="field">
        <label htmlFor="email">{t('email')}</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">{t('password')}</label>
        <input id="password" name="password" type="password" minLength={6} required />
      </div>

      {isArtist && (
        <>
          <div className="field">
            <label htmlFor="medium">{t('technique')}</label>
            <input id="medium" name="medium" type="text" list="medium-options"
              placeholder={t('techniquePh')} required={isArtist} autoComplete="off" />
            <datalist id="medium-options">
              {mediums.map((m) => <option key={m} value={m} />)}
            </datalist>
            <p className="field-hint">{t('techniqueHint')}</p>
          </div>
          <div className="field">
            <label htmlFor="location">{t('city')}</label>
            <input id="location" name="location" type="text" placeholder={t('cityPh')} />
          </div>
          <div className="field">
            <label htmlFor="bio">{t('bioShort')}</label>
            <textarea id="bio" name="bio" rows={4} placeholder={t('bioPh')} required={isArtist} />
          </div>

          <p className="registro-works-note">{t('worksNote')}</p>
        </>
      )}

      <SubmitButton className="auth-submit" pendingText={isArtist ? t('creatingArtist') : t('creating')}>
        {t('createAccount')}
      </SubmitButton>
    </form>
  );
}
