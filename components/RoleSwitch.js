'use client';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

const STORAGE_KEY = 'mancha_role';

export default function RoleSwitch({ currentRole }) {
  const router = useRouter();
  const t = useTranslations('misc');
  // Normalizamos a plural para que coincida con el selector y NavLogoLink.
  const isCollector = (currentRole || '').startsWith('colec');
  const other = isCollector ? 'artistas' : 'coleccionistas';
  const label = isCollector ? t('roleSwitchToArtist') : t('roleSwitchToCollector');

  function switchRole() {
    localStorage.setItem(STORAGE_KEY, other);
    router.push(`/para-${other}`);
  }

  return (
    <button onClick={switchRole} className="role-switch-btn" type="button">
      {label}
    </button>
  );
}
