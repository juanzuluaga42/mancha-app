'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import { applyToCouncil } from '@/app/[locale]/consejo/actions';
import { SPECIALTY_KEYS } from '@/lib/curatorial';

const LS_KEY = 'mancha_council_application';
const TOTAL = 5;
const EMPTY = {
  name: '', email: '', country: '', current_title: '', organization: '',
  years_experience: '', links: '', statement: '', availability: '', specialties: [],
};

function SubmitBtn() {
  const { pending } = useFormStatus();
  const t = useTranslations('council');
  return (
    <button type="submit" className="consejo-submit" disabled={pending}>
      {pending ? t('sending') : t('submit')}
    </button>
  );
}

export default function CouncilApplication() {
  const t = useTranslations('council');
  const [step, setStep] = useState(1);
  const [data, setData] = useState(EMPTY);
  const [saved, setSaved] = useState(false);
  const hydrated = useRef(false);

  // Hidrata desde localStorage (autosave).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setData({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
    hydrated.current = true;
  }, []);

  // Persiste cada cambio.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
      setSaved(true);
    } catch {}
  }, [data]);

  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const toggleSpec = (key) =>
    setData((d) => ({
      ...d,
      specialties: d.specialties.includes(key)
        ? d.specialties.filter((k) => k !== key)
        : [...d.specialties, key],
    }));

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email);
  const canStep1 = data.name.trim().length > 0 && emailOk;
  const canStep4 = data.statement.trim().length >= 10;
  const canAdvance = step === 1 ? canStep1 : step === 4 ? canStep4 : true;

  const go = (n) => setStep(Math.min(TOTAL, Math.max(1, n)));

  return (
    <form
      action={applyToCouncil}
      className="consejo-wizard"
      onSubmit={() => { try { localStorage.removeItem(LS_KEY); } catch {} }}
    >
      {/* Progreso */}
      <div className="cw-progress">
        <div className="cw-progress-track"><i style={{ width: `${(step / TOTAL) * 100}%` }} /></div>
        <div className="cw-progress-meta">
          <span>{t('stepOf', { n: step, total: TOTAL })}</span>
          {saved && <span className="cw-saved">● {t('autosaved')}</span>}
        </div>
      </div>

      {/* Campos persistentes (siempre en el DOM para que el submit los envíe) */}
      <input type="hidden" name="specialties" value={JSON.stringify(data.specialties)} />

      {/* Paso 1 — Quién eres */}
      <fieldset className={`cw-step${step === 1 ? ' is-active' : ''}`} aria-hidden={step !== 1}>
        <h3 className="cw-step-title">{t('step1Title')}</h3>
        <p className="cw-step-sub">{t('step1Sub')}</p>
        <Field label={t('nameLabel')}>
          <input name="name" type="text" value={data.name} maxLength={200} autoComplete="name"
            onChange={(e) => set({ name: e.target.value })} tabIndex={step === 1 ? 0 : -1} />
        </Field>
        <Field label={t('emailLabel')}>
          <input name="email" type="email" value={data.email} maxLength={200} autoComplete="email"
            onChange={(e) => set({ email: e.target.value })} tabIndex={step === 1 ? 0 : -1} />
        </Field>
        <Field label={t('countryLabel')}>
          <input name="country" type="text" value={data.country} maxLength={120}
            onChange={(e) => set({ country: e.target.value })} tabIndex={step === 1 ? 0 : -1} />
        </Field>
      </fieldset>

      {/* Paso 2 — Trayectoria */}
      <fieldset className={`cw-step${step === 2 ? ' is-active' : ''}`} aria-hidden={step !== 2}>
        <h3 className="cw-step-title">{t('step2Title')}</h3>
        <p className="cw-step-sub">{t('step2Sub')}</p>
        <Field label={t('titleLabel')}>
          <input name="current_title" type="text" value={data.current_title} maxLength={200}
            placeholder={t('titlePlaceholder')} onChange={(e) => set({ current_title: e.target.value })} tabIndex={step === 2 ? 0 : -1} />
        </Field>
        <Field label={t('orgLabel')}>
          <input name="organization" type="text" value={data.organization} maxLength={200}
            onChange={(e) => set({ organization: e.target.value })} tabIndex={step === 2 ? 0 : -1} />
        </Field>
        <Field label={t('experienceLabel')}>
          <input name="years_experience" type="number" min="0" max="80" value={data.years_experience}
            onChange={(e) => set({ years_experience: e.target.value })} tabIndex={step === 2 ? 0 : -1} />
        </Field>
        <Field label={t('linksLabel')}>
          <input name="links" type="text" value={data.links} maxLength={600} placeholder="https://"
            onChange={(e) => set({ links: e.target.value })} tabIndex={step === 2 ? 0 : -1} />
        </Field>
      </fieldset>

      {/* Paso 3 — Especialidades */}
      <fieldset className={`cw-step${step === 3 ? ' is-active' : ''}`} aria-hidden={step !== 3}>
        <h3 className="cw-step-title">{t('step3Title')}</h3>
        <p className="cw-step-sub">{t('step3Sub')}</p>
        <p className="cw-spec-q">{t('specQuestion')}</p>
        <div className="cw-spec-grid">
          {SPECIALTY_KEYS.map((key) => (
            <button type="button" key={key}
              className={`cw-spec${data.specialties.includes(key) ? ' on' : ''}`}
              onClick={() => toggleSpec(key)} tabIndex={step === 3 ? 0 : -1}
              aria-pressed={data.specialties.includes(key)}>
              {t(`spec.${key}`)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Paso 4 — Motivación */}
      <fieldset className={`cw-step${step === 4 ? ' is-active' : ''}`} aria-hidden={step !== 4}>
        <h3 className="cw-step-title">{t('step4Title')}</h3>
        <p className="cw-step-sub">{t('step4Sub')}</p>
        <Field label={t('statementLabel')}>
          <textarea name="statement" rows={6} value={data.statement} maxLength={4000}
            placeholder={t('statementPlaceholder')} onChange={(e) => set({ statement: e.target.value })} tabIndex={step === 4 ? 0 : -1} />
        </Field>
        <Field label={t('availabilityLabel')}>
          <input name="availability" type="text" value={data.availability} maxLength={300}
            placeholder={t('availabilityPlaceholder')} onChange={(e) => set({ availability: e.target.value })} tabIndex={step === 4 ? 0 : -1} />
        </Field>
      </fieldset>

      {/* Paso 5 — Revisión */}
      <fieldset className={`cw-step${step === 5 ? ' is-active' : ''}`} aria-hidden={step !== 5}>
        <h3 className="cw-step-title">{t('step5Title')}</h3>
        <p className="cw-step-sub">{t('step5Sub')}</p>
        <dl className="cw-review">
          <Row k={t('nameLabel')} v={data.name} go={() => go(1)} edit={t('reviewEdit')} empty={t('emptyField')} />
          <Row k={t('emailLabel')} v={data.email} go={() => go(1)} edit={t('reviewEdit')} empty={t('emptyField')} />
          <Row k={t('countryLabel')} v={data.country} go={() => go(1)} edit={t('reviewEdit')} empty={t('emptyField')} />
          <Row k={t('titleLabel')} v={data.current_title} go={() => go(2)} edit={t('reviewEdit')} empty={t('emptyField')} />
          <Row k={t('orgLabel')} v={data.organization} go={() => go(2)} edit={t('reviewEdit')} empty={t('emptyField')} />
          <Row k={t('experienceLabel')} v={data.years_experience} go={() => go(2)} edit={t('reviewEdit')} empty={t('emptyField')} />
          <Row k={t('step3Title')} v={data.specialties.map((s) => t(`spec.${s}`)).join(' · ')} go={() => go(3)} edit={t('reviewEdit')} empty={t('emptyField')} />
          <Row k={t('statementLabel')} v={data.statement} go={() => go(4)} edit={t('reviewEdit')} empty={t('emptyField')} />
        </dl>
      </fieldset>

      {/* Navegación */}
      <div className="cw-nav">
        {step > 1 && (
          <button type="button" className="cw-back" onClick={() => go(step - 1)}>{t('prev')}</button>
        )}
        {step < TOTAL ? (
          <button type="button" className="consejo-submit cw-next" disabled={!canAdvance}
            onClick={() => canAdvance && go(step + 1)}>
            {step === TOTAL - 1 ? t('review') : t('next')}
          </button>
        ) : (
          <SubmitBtn />
        )}
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="consejo-field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function Row({ k, v, go, edit, empty }) {
  return (
    <div className="cw-review-row">
      <dt>{k}</dt>
      <dd>{v ? v : <span className="cw-review-empty">{empty}</span>}</dd>
      <button type="button" className="cw-review-edit" onClick={go}>{edit}</button>
    </div>
  );
}
