'use client';
import { useState } from 'react';
import { signUp } from '@/app/registro/actions';
import SubmitButton from '@/components/SubmitButton';

export default function RegistroForm({ defaultRole = 'buyer' }) {
  const [role, setRole] = useState(defaultRole);
  const isArtist = role === 'artist';

  return (
    <form action={signUp}>
      <div className="role-toggle">
        <label className="role-option">
          <input
            type="radio" name="role" value="buyer"
            checked={role === 'buyer'} onChange={() => setRole('buyer')}
          />
          Soy coleccionista
        </label>
        <label className="role-option">
          <input
            type="radio" name="role" value="artist"
            checked={role === 'artist'} onChange={() => setRole('artist')}
          />
          Soy artista
        </label>
      </div>

      <div className="field">
        <label htmlFor="full_name">{isArtist ? 'Nombre o nombre artístico' : 'Nombre completo'}</label>
        <input id="full_name" name="full_name" type="text" required />
      </div>
      <div className="field">
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" name="email" type="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" minLength={6} required />
      </div>

      {isArtist && (
        <>
          <div className="field">
            <label htmlFor="medium">Técnica</label>
            <input id="medium" name="medium" type="text" placeholder="Óleo sobre lienzo" required={isArtist} />
          </div>
          <div className="field">
            <label htmlFor="location">Ciudad</label>
            <input id="location" name="location" type="text" placeholder="Ciudad, país" />
          </div>
          <div className="field">
            <label htmlFor="bio">Bio breve</label>
            <textarea id="bio" name="bio" rows={4} placeholder="Dos o tres frases sobre tu trabajo y qué te mueve a hacerlo." required={isArtist} />
          </div>

          <p className="registro-works-note">
            Después de confirmar tu correo entras a tu cuenta y subes tus obras (hasta 3: imagen, título y precio de salida).
            Puedes hacerlo de inmediato o más tarde — tu cuenta queda activa igual.
          </p>
        </>
      )}

      <SubmitButton className="auth-submit" pendingText={isArtist ? 'Creando tu cuenta…' : 'Creando cuenta…'}>
        Crear cuenta
      </SubmitButton>
    </form>
  );
}
