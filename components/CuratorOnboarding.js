'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { completeOnboarding } from '@/app/[locale]/curaduria/actions';
import { SPECIALTY_KEYS } from '@/lib/curatorial';

const TOTAL = 6;

function FinishBtn({ disabled }) {
  const { pending } = useFormStatus();
  const t = useTranslations('onboarding');
  return (
    <button type="submit" className="onb-next" disabled={disabled || pending}>
      {pending ? t('completing') : t('finish')}
    </button>
  );
}

export default function CuratorOnboarding() {
  const t = useTranslations('onboarding');
  const tc = useTranslations('council');
  const [step, setStep] = useState(1);
  const [d, setD] = useState({ ethics: false, agreement: false, title: '', bio: '', availability: '', specialties: [] });

  const set = (patch) => setD((s) => ({ ...s, ...patch }));
  const toggleSpec = (k) =>
    setD((s) => ({ ...s, specialties: s.specialties.includes(k) ? s.specialties.filter((x) => x !== k) : [...s.specialties, k] }));

  const canNext = step === 2 ? d.ethics : step === 3 ? d.agreement : true;
  const go = (n) => setStep(Math.min(TOTAL, Math.max(1, n)));

  return (
    <form action={completeOnboarding} className="onb">
      <div className="onb-progress">
        <div className="onb-progress-track"><i style={{ width: `${(step / TOTAL) * 100}%` }} /></div>
        <span>{t('stepOf', { n: step, total: TOTAL })}</span>
      </div>

      {/* hidden persistentes */}
      <input type="hidden" name="ethics" value={d.ethics ? 'true' : ''} />
      <input type="hidden" name="agreement" value={d.agreement ? 'true' : ''} />
      <input type="hidden" name="specialties" value={JSON.stringify(d.specialties)} />
      <input type="hidden" name="title" value={d.title} />
      <input type="hidden" name="bio" value={d.bio} />
      <input type="hidden" name="availability" value={d.availability} />

      {/* 1 — Bienvenida */}
      <section className={`onb-step${step === 1 ? ' is-active' : ''}`} aria-hidden={step !== 1}>
        <p className="onb-kicker">{t('s1Kicker')}</p>
        <h2 className="onb-title">{t('s1Title')}</h2>
        <div className="onb-founder">
          <span className="onb-founder-label">{t('s1FounderLabel')}</span>
          <blockquote>{t('s1FounderMsg')}</blockquote>
        </div>
        <p className="onb-body">{t('s1Body')}</p>
      </section>

      {/* 2 — Código de Ética */}
      <section className={`onb-step${step === 2 ? ' is-active' : ''}`} aria-hidden={step !== 2}>
        <h2 className="onb-title">{t('s2Title')}</h2>
        <p className="onb-body">{t('s2Intro')}</p>
        <ul className="onb-list">
          {[1, 2, 3, 4, 5].map((n) => <li key={n}>{t(`s2p${n}`)}</li>)}
        </ul>
        <label className="onb-check">
          <input type="checkbox" checked={d.ethics} onChange={(e) => set({ ethics: e.target.checked })} />
          <span>{t('s2Accept')}</span>
        </label>
      </section>

      {/* 3 — Acuerdo */}
      <section className={`onb-step${step === 3 ? ' is-active' : ''}`} aria-hidden={step !== 3}>
        <h2 className="onb-title">{t('s3Title')}</h2>
        <p className="onb-body">{t('s3Intro')}</p>
        <ul className="onb-list">
          {[1, 2, 3, 4].map((n) => <li key={n}>{t(`s3p${n}`)}</li>)}
        </ul>
        <label className="onb-check">
          <input type="checkbox" checked={d.agreement} onChange={(e) => set({ agreement: e.target.checked })} />
          <span>{t('s3Accept')}</span>
        </label>
      </section>

      {/* 4 — Perfil */}
      <section className={`onb-step${step === 4 ? ' is-active' : ''}`} aria-hidden={step !== 4}>
        <h2 className="onb-title">{t('s4Title')}</h2>
        <p className="onb-body">{t('s4Sub')}</p>
        <div className="onb-field">
          <label>{t('s4TitleLabel')}</label>
          <input type="text" value={d.title} maxLength={200} placeholder={t('s4TitlePh')}
            onChange={(e) => set({ title: e.target.value })} tabIndex={step === 4 ? 0 : -1} />
        </div>
        <div className="onb-field">
          <label>{t('s4BioLabel')}</label>
          <textarea rows={4} value={d.bio} maxLength={2000} placeholder={t('s4BioPh')}
            onChange={(e) => set({ bio: e.target.value })} tabIndex={step === 4 ? 0 : -1} />
        </div>
      </section>

      {/* 5 — Preferencias */}
      <section className={`onb-step${step === 5 ? ' is-active' : ''}`} aria-hidden={step !== 5}>
        <h2 className="onb-title">{t('s5Title')}</h2>
        <p className="onb-body">{t('s5Sub')}</p>
        <p className="onb-sublabel">{t('s5SpecLabel')} <i>· {t('s5SpecHint')}</i></p>
        <div className="onb-specs">
          {SPECIALTY_KEYS.map((k) => (
            <button type="button" key={k} className={`onb-spec${d.specialties.includes(k) ? ' on' : ''}`}
              onClick={() => toggleSpec(k)} aria-pressed={d.specialties.includes(k)} tabIndex={step === 5 ? 0 : -1}>
              {tc(`spec.${k}`)}
            </button>
          ))}
        </div>
        <div className="onb-field" style={{ marginTop: 22 }}>
          <label>{t('s5AvailLabel')}</label>
          <input type="text" value={d.availability} maxLength={300} placeholder={t('s5AvailPh')}
            onChange={(e) => set({ availability: e.target.value })} tabIndex={step === 5 ? 0 : -1} />
        </div>
      </section>

      {/* 6 — Tutorial */}
      <section className={`onb-step${step === 6 ? ' is-active' : ''}`} aria-hidden={step !== 6}>
        <h2 className="onb-title">{t('s6Title')}</h2>
        <p className="onb-body">{t('s6Sub')}</p>
        <div className="onb-tut">
          {[1, 2, 3, 4].map((n) => (
            <div className="onb-tut-card" key={n}>
              <span className="onb-tut-n">0{n}</span>
              <h3>{t(`s6t${n}Title`)}</h3>
              <p>{t(`s6t${n}Body`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Navegación */}
      <div className="onb-nav">
        {step > 1 && <button type="button" className="onb-back" onClick={() => go(step - 1)}>{t('prev')}</button>}
        {step < TOTAL ? (
          <button type="button" className="onb-next" disabled={!canNext} onClick={() => canNext && go(step + 1)}>{t('next')}</button>
        ) : (
          <FinishBtn disabled={!d.ethics || !d.agreement} />
        )}
      </div>
    </form>
  );
}
