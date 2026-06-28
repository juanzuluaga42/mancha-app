import { getTranslations } from 'next-intl/server';
import { joinWaitlist } from '@/app/leads/actions';

export default async function WaitlistForm({ pieceId, redirectTo = '/', label }) {
  const t = await getTranslations('waitlist');
  const defaultLabel = label ?? (pieceId ? t('notify') : t('join'));
  return (
    <form action={joinWaitlist} className="waitlist-form">
      <input type="hidden" name="pieceId" value={pieceId || ''} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input
        type="email"
        name="email"
        required
        placeholder={t('emailPh')}
        className="waitlist-input"
        aria-label={t('emailAria')}
      />
      <button type="submit" className="waitlist-btn">{defaultLabel}</button>
    </form>
  );
}
