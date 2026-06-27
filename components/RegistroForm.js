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

          <div className="registro-works">
            <p className="registro-works-head">Tus obras <span>opcional — puedes subirlas ahora o más tarde</span></p>
            <p className="registro-works-note">
              Ideal 3, mínimo 1 para entrar a revisión. Imagen, título y precio de salida. Máximo 8 MB por imagen.
              Si no las tienes a la mano, termina el registro y súbelas cuando quieras desde tu cuenta.
            </p>
            {[1, 2, 3].map((n) => (
              <div className="registro-work-row" key={n}>
                <label className="registro-work-file" htmlFor={`image_${n}`}>
                  <span>Obra {n}{n === 1 ? '' : ' · opcional'}</span>
                  <input id={`image_${n}`} name={`image_${n}`} type="file" accept="image/*" />
                </label>
                <input name={`title_${n}`} type="text" placeholder={`Título obra ${n}`} className="registro-work-title" />
                <input name={`min_bid_${n}`} type="number" min="1" placeholder="Precio salida USD" className="registro-work-bid" />
              </div>
            ))}
          </div>
        </>
      )}

      <SubmitButton className="auth-submit" pendingText={isArtist ? 'Creando tu cuenta…' : 'Creando cuenta…'}>
        Crear cuenta
      </SubmitButton>
    </form>
  );
}
