'use client';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'mancha_role';

export default function RoleSwitch({ currentRole }) {
  const router = useRouter();
  // Normalizamos a plural para que coincida con el selector y NavLogoLink.
  const isCollector = (currentRole || '').startsWith('colec');
  const other = isCollector ? 'artistas' : 'coleccionistas';
  const label = isCollector
    ? '¿Eres artista? Cambiar perfil →'
    : '¿Eres coleccionista? Cambiar perfil →';

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
