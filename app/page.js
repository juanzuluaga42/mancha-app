'use client';

export default function RolePicker() {
  function choose(role) {
    localStorage.setItem('mancha_role', role);
    window.location.href = `/para-${role}`;
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

        <button className="rp-option rp-option--collector" onClick={() => choose('coleccionistas')}>
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

        <button className="rp-option rp-option--artist" onClick={() => choose('artistas')}>
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
