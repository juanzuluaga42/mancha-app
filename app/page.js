'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'mancha_role';

export default function RolePicker() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'coleccionista') {
      router.replace('/para-coleccionistas');
    } else if (saved === 'artista') {
      router.replace('/para-artistas');
    } else {
      setReady(true);
    }
  }, [router]);

  function choose(role) {
    localStorage.setItem(STORAGE_KEY, role);
    router.push(`/para-${role}`);
  }

  if (!ready) {
    return <div className="rp-loading" aria-hidden="true" />;
  }

  return (
    <div className="rp-root">

      {/* Header: logo centrado encima del split */}
      <header className="rp-header">
        <div className="rp-logo">MANCHA<span>.</span></div>
        <p className="rp-tagline">Institución de descubrimiento artístico · Est. 2026</p>
      </header>

      {/* Split: dos mitades */}
      <div className="rp-split">

        <button className="rp-option rp-option--collector" onClick={() => choose('coleccionista')}>
          <div className="rp-option-inner">
            <p className="rp-option-tag">Para coleccionistas</p>
            <h2 className="rp-option-title">
              Colecciono<br />
              <em>arte.</em>
            </h2>
            <p className="rp-option-desc">
              Quiero explorar artistas emergentes seleccionados a mano y coleccionar antes de que el mundo los descubra.
            </p>
            <span className="rp-option-cta">Entrar →</span>
          </div>
        </button>

        <button className="rp-option rp-option--artist" onClick={() => choose('artista')}>
          <div className="rp-option-inner">
            <p className="rp-option-tag">Para artistas</p>
            <h2 className="rp-option-title">
              Soy<br />
              <em>artista.</em>
            </h2>
            <p className="rp-option-desc">
              Quiero que MANCHA revise mi trabajo y lo presente a coleccionistas en la próxima temporada.
            </p>
            <span className="rp-option-cta">Entrar →</span>
          </div>
        </button>

      </div>

      <div className="rp-foot">
        <p>Temporada 01 · 2026</p>
      </div>
    </div>
  );
}
