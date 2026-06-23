import { joinWaitlist } from '@/app/leads/actions';

export default function WaitlistForm({ pieceId, redirectTo = '/', label }) {
  const defaultLabel = label ?? (pieceId ? 'Avísame' : 'Unirme');
  return (
    <form action={joinWaitlist} className="waitlist-form">
      <input type="hidden" name="pieceId" value={pieceId || ''} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input
        type="email"
        name="email"
        required
        placeholder="tu@correo.com"
        className="waitlist-input"
        aria-label="Correo electrónico"
      />
      <button type="submit" className="waitlist-btn">{defaultLabel}</button>
    </form>
  );
}
