'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function WelcomeModal() {
  const t = useTranslations('misc');
  const tc = useTranslations('common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('mancha-welcome');
    if (!seen) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  function close() {
    sessionStorage.setItem('mancha-welcome', '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="wm-backdrop" onClick={close} role="dialog" aria-modal="true" aria-label={t('welcomeAria')}>
      <div className="wm-panel" onClick={(e) => e.stopPropagation()}>

        {/* Manchas decorativas */}
        <div className="wm-splat wm-splat-1" />
        <div className="wm-splat wm-splat-2" />
        <div className="wm-splat wm-splat-3" />

        {/* Cerrar */}
        <button className="wm-close" onClick={close} aria-label={tc('close')}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Eyebrow */}
        <p className="wm-eyebrow">{t('welcomeEyebrow')}</p>

        {/* Logo */}
        <div className="wm-brand">MANCHA.</div>

        {/* Separador rojo */}
        <div className="wm-rule" />

        {/* Cuerpo */}
        <p className="wm-headline">
          {t('welcomeHeadline1')}<br />
          <em>{t('welcomeHeadlineEm')}</em>
        </p>

        <p className="wm-body">{t('welcomeBody1')}</p>

        <p className="wm-body">{t('welcomeBody2')}</p>

        {/* Firma */}
        <div className="wm-footer">
          <div className="wm-footer-rule" />
          <p className="wm-mission">{t('welcomeMission')}</p>
        </div>

        {/* CTA */}
        <button className="wm-cta" onClick={close}>
          {t('welcomeCta')}
        </button>

      </div>
    </div>
  );
}
