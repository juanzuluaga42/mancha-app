'use client';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'mancha_role';

export default function RoleSwitch({ currentRole }) {
  const router = useRouter();
  const other = currentRole === 'coleccionista' ? 'artista' : 'coleccionista';
  const label = currentRole === 'coleccionista'
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
