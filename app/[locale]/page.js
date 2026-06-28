'use client';
import { useTranslations } from 'next-intl';

export default function RolePicker() {
  const t = useTranslations('picker');

  function choose(role) {
    localStorage.setItem('mancha_role', role);
    window.location.href = `/para-${role}`;
  }

  return (
    <div className="rp-root">

      {/* Header: logo centrado encima del split */}
      <header className="rp-header">
        <div className="rp-logo">MANCHA<span>.</span></div>
        <p className="rp-tagline">{t('tagline')}</p>
      </header>

      {/* Split: dos mitades */}
      <div className="rp-split">

        <button className="rp-option rp-option--collector" onClick={() => choose('coleccionistas')}>
          <div className="rp-option-inner">
            <p className="rp-option-tag">{t('forCollectors')}</p>
            <h2 className="rp-option-title">
              {t('collectTitle1')}<br />
              <em>{t('collectTitleEm')}</em>
            </h2>
            <p className="rp-option-desc">{t('collectDesc')}</p>
            <span className="rp-option-cta">{t('enter')}</span>
          </div>
        </button>

        <button className="rp-option rp-option--artist" onClick={() => choose('artistas')}>
          <div className="rp-option-inner">
            <p className="rp-option-tag">{t('forArtists')}</p>
            <h2 className="rp-option-title">
              {t('artistTitle1')}<br />
              <em>{t('artistTitleEm')}</em>
            </h2>
            <p className="rp-option-desc">{t('artistDesc')}</p>
            <span className="rp-option-cta">{t('enter')}</span>
          </div>
        </button>

      </div>

      <div className="rp-foot">
        <p>{t('season')}</p>
      </div>
    </div>
  );
}
