import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { createArtistProfile, addPiece, deletePiece } from './actions';
import SubmitButton from '@/components/SubmitButton';
import { cap } from '@/lib/utils';

export const metadata = { title: 'MANCHA — Mi cuenta' };

export default async function CuentaPage({ searchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/cuenta');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const isArtist = profile?.role === 'artist';
  const firstName = profile?.full_name?.split(' ')[0] || null;

  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="cuenta-header">
        <Splat width="180px" height="155px" top="-50px" right="-40px" color="yellow" rotate={-12} radius="r2" />
        <Splat width="100px" height="88px" bottom="-30px" left="-25px" color="red" rotate={14} radius="r4" />
        <div className="wrap">
          <p className="cuenta-eyebrow">{isArtist ? 'Cuenta de artista' : 'Mi cuenta'}</p>
          <h1 className="cuenta-title">
            {firstName ? <>Hola, <em>{cap(firstName)}.</em></> : <>Hola, de <em>nuevo.</em></>}
          </h1>
          <p className="cuenta-email">{user.email}</p>
        </div>
      </header>

      {/* ── DASHBOARD ────────────────────────────────────── */}
      <div className="cuenta-body">
        <div className="wrap cuenta-wrap">
          {params?.error && (
            <div className="cuenta-alert">
              <span>⚠</span> {params.error}
            </div>
          )}

          {isArtist ? (
            <ArtistDashboard supabase={supabase} userId={user.id} />
          ) : (
            <BuyerDashboard supabase={supabase} userId={user.id} />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

async function ArtistDashboard({ supabase, userId }) {
  const { data: artist } = await supabase.from('artists').select('*').eq('profile_id', userId).maybeSingle();

  if (!artist) {
    return (
      <div className="cuenta-section">
        <div className="cuenta-section-head">
          <p className="cuenta-section-label">Postulación</p>
          <h2 className="cuenta-section-title">Completa tu perfil de artista</h2>
          <p className="cuenta-section-sub">Esto es lo que va a ver la gente en el catálogo si tu postulación es aceptada.</p>
        </div>
        <div className="cuenta-card">
          <form action={createArtistProfile} className="cuenta-form">
            <div className="cuenta-field-row">
              <div className="field">
                <label htmlFor="display_name">Nombre artístico</label>
                <input id="display_name" name="display_name" type="text" required />
              </div>
              <div className="field">
                <label htmlFor="medium">Técnica</label>
                <input id="medium" name="medium" type="text" placeholder="Óleo sobre lienzo" required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="location">Ubicación</label>
              <input id="location" name="location" type="text" placeholder="Ciudad, país" />
            </div>
            <div className="field">
              <label htmlFor="bio">Bio corta</label>
              <textarea id="bio" name="bio" rows={4} placeholder="Dos o tres frases sobre tu trabajo y qué te mueve a hacerlo." required />
            </div>
            <SubmitButton pendingText="Enviando postulación...">Enviar postulación</SubmitButton>
          </form>
        </div>
      </div>
    );
  }

  if (artist.status === 'pending') {
    return (
      <div className="cuenta-section">
        <div className="cuenta-status-card cuenta-status-pending">
          <div className="cuenta-status-icon">⏳</div>
          <div>
            <p className="cuenta-status-label">Postulación en revisión</p>
            <h2 className="cuenta-status-name">{artist.display_name}</h2>
            <p className="cuenta-status-text">
              Recibimos tu postulación y la estamos revisando. Te avisamos por correo apenas tengamos una respuesta — normalmente en pocos días.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (artist.status === 'rejected') {
    return (
      <div className="cuenta-section">
        <div className="cuenta-status-card cuenta-status-rejected">
          <div className="cuenta-status-icon">—</div>
          <div>
            <p className="cuenta-status-label">Esta vez no avanzamos</p>
            <h2 className="cuenta-status-name">{artist.display_name}</h2>
            <p className="cuenta-status-text">
              No avanzamos con esta postulación. Si quieres más detalle, escríbenos. Nada impide volver a postular más adelante con un perfil distinto.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { data: pieces } = await supabase
    .from('pieces')
    .select('*, bids(amount), favorites(buyer_id)')
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: true });

  const myPieces = pieces ?? [];
  const totalBids = myPieces.reduce((sum, p) => sum + (p.bids?.length ?? 0), 0);
  const totalFollowers = myPieces.reduce((sum, p) => sum + (p.favorites?.length ?? 0), 0);

  return (
    <>
      {/* Stats bar */}
      <div className="cuenta-stats-bar">
        <div className="cuenta-stat">
          <b>{myPieces.length}<span>/3</span></b>
          <span>{myPieces.length === 1 ? 'pieza activa' : 'piezas activas'}</span>
        </div>
        <div className="cuenta-stat-sep" />
        <div className="cuenta-stat">
          <b>{totalBids}</b>
          <span>{totalBids === 1 ? 'puja recibida' : 'pujas recibidas'}</span>
        </div>
        <div className="cuenta-stat-sep" />
        <div className="cuenta-stat">
          <b>{totalFollowers}</b>
          <span>{totalFollowers === 1 ? 'siguiendo tu trabajo' : 'siguiendo tu trabajo'}</span>
        </div>
      </div>

      {/* Perfil */}
      <div className="cuenta-section">
        <div className="cuenta-section-head">
          <p className="cuenta-section-label">Tu perfil</p>
          <h2 className="cuenta-section-title">{artist.display_name}</h2>
        </div>
        <div className="cuenta-card cuenta-profile-card">
          <div className="cuenta-profile-row">
            <span className="cuenta-profile-key">Técnica</span>
            <span className="cuenta-profile-val">{artist.medium || '—'}</span>
          </div>
          {artist.location && (
            <div className="cuenta-profile-row">
              <span className="cuenta-profile-key">Ubicación</span>
              <span className="cuenta-profile-val">{artist.location}</span>
            </div>
          )}
          <div className="cuenta-profile-row cuenta-profile-bio">
            <span className="cuenta-profile-key">Bio</span>
            <span className="cuenta-profile-val cuenta-profile-bio-text">{artist.bio}</span>
          </div>
          <div className="cuenta-profile-row">
            <span className="cuenta-profile-key">Tu página</span>
            <Link href={`/artistas/${artist.id}`} className="cuenta-profile-link">Ver tu perfil público →</Link>
          </div>
        </div>
      </div>

      {/* Piezas */}
      <div className="cuenta-section">
        <div className="cuenta-section-head">
          <p className="cuenta-section-label">Esta temporada</p>
          <h2 className="cuenta-section-title">Tus piezas ({myPieces.length} de 3)</h2>
        </div>

        {myPieces.length === 0 ? (
          <div className="cuenta-empty">
            <p>Todavía no subiste ninguna pieza. Puedes subir hasta 3 por temporada.</p>
          </div>
        ) : (
          <div className="cuenta-pieces-list">
            {myPieces.map((p) => {
              const amounts = (p.bids ?? []).map((b) => Number(b.amount));
              const currentBid = amounts.length ? Math.max(...amounts) : Number(p.min_bid);
              return (
                <div className="cuenta-piece-item" key={p.id}>
                  <div className="cuenta-piece-info">
                    <p className="cuenta-piece-title">{p.title}</p>
                    <p className="cuenta-piece-meta">{p.technique}{p.dimensions ? ` · ${p.dimensions}` : ''}</p>
                  </div>
                  <div className="cuenta-piece-right">
                    <div className="cuenta-piece-bid">
                      <p className="cuenta-piece-amount">${Number(currentBid).toLocaleString('es-AR')} <span>USD</span></p>
                      <p className="cuenta-piece-meta">{amounts.length === 0 ? 'Sin pujas aún' : `${amounts.length} ${amounts.length === 1 ? 'puja' : 'pujas'}`}</p>
                    </div>
                    {amounts.length === 0 && (
                      <form action={deletePiece}>
                        <input type="hidden" name="pieceId" value={p.id} />
                        <button type="submit" className="cuenta-delete-btn">Borrar</button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agregar pieza */}
      {myPieces.length < 3 && (
        <div className="cuenta-section">
          <div className="cuenta-section-head">
            <p className="cuenta-section-label">Subir obra</p>
            <h2 className="cuenta-section-title">Agregar pieza</h2>
            <p className="cuenta-section-sub">Puedes subir hasta 3 piezas por temporada. Una vez que alguien puja, no se puede borrar.</p>
          </div>
          <div className="cuenta-card">
            <form action={addPiece} className="cuenta-form">
              <div className="cuenta-field-row">
                <div className="field">
                  <label htmlFor="title">Título</label>
                  <input id="title" name="title" type="text" required />
                </div>
                <div className="field">
                  <label htmlFor="year">Año</label>
                  <input id="year" name="year" type="number" placeholder="2024" />
                </div>
              </div>
              <div className="cuenta-field-row">
                <div className="field">
                  <label htmlFor="technique">Técnica</label>
                  <input id="technique" name="technique" type="text" required placeholder="Óleo sobre lienzo" />
                </div>
                <div className="field">
                  <label htmlFor="dimensions">Dimensiones</label>
                  <input id="dimensions" name="dimensions" type="text" placeholder="60 × 80 cm" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="description">Descripción breve</label>
                <textarea id="description" name="description" rows="3" placeholder="Una o dos frases sobre la pieza: de qué se trata, qué la inspiró." />
              </div>
              <div className="field">
                <label htmlFor="min_bid">Puja mínima (USD)</label>
                <input id="min_bid" name="min_bid" type="number" min="1" required />
              </div>
              <div className="field">
                <label htmlFor="image_file">Foto de la pieza</label>
                <div className="cuenta-photo-tips">
                  <p>Para que el catálogo se vea parejo:</p>
                  <ul>
                    <li>Obra sola, sin marco ni mueble alrededor</li>
                    <li>Luz natural y pareja — sin flash directo</li>
                    <li>La pieza ocupando casi todo el encuadre</li>
                    <li>Buena resolución, sin comprimir</li>
                  </ul>
                </div>
                <input id="image_file" name="image_file" type="file" accept="image/*" />
                <p className="cuenta-field-hint">Máximo 8 MB.</p>
              </div>
              <SubmitButton pendingText="Subiendo pieza...">Subir pieza</SubmitButton>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

async function BuyerDashboard({ supabase, userId }) {
  const { data: bids } = await supabase
    .from('bids')
    .select('*, pieces(id, title, min_bid, artists(display_name))')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, pieces(id, title, min_bid, artists(display_name))')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  const myBids = bids ?? [];
  const myFavs = favorites ?? [];

  return (
    <>
      {/* Stats bar */}
      <div className="cuenta-stats-bar">
        <div className="cuenta-stat">
          <b>{myBids.length}</b>
          <span>{myBids.length === 1 ? 'puja registrada' : 'pujas registradas'}</span>
        </div>
        <div className="cuenta-stat-sep" />
        <div className="cuenta-stat">
          <b>{myFavs.length}</b>
          <span>{myFavs.length === 1 ? 'pieza guardada' : 'piezas guardadas'}</span>
        </div>
      </div>

      {/* Pujas */}
      <div className="cuenta-section">
        <div className="cuenta-section-head">
          <p className="cuenta-section-label">Tus pujas</p>
          <h2 className="cuenta-section-title">Lo que pujaste</h2>
        </div>
        {myBids.length === 0 ? (
          <div className="cuenta-empty">
            <p>Todavía no pujaste por ninguna pieza.</p>
            <Link href="/obras" className="cuenta-empty-cta">Ver catálogo →</Link>
          </div>
        ) : (
          <div className="cuenta-pieces-list">
            {myBids.map((b) => (
              <Link href={`/obras/${b.pieces?.id}`} className="cuenta-piece-item cuenta-piece-link" key={b.id}>
                <div className="cuenta-piece-info">
                  <p className="cuenta-piece-title">{b.pieces?.title}</p>
                  <p className="cuenta-piece-meta">{b.pieces?.artists?.display_name}</p>
                </div>
                <div className="cuenta-piece-right">
                  <div className="cuenta-piece-bid">
                    <p className="cuenta-piece-amount">${Number(b.amount).toLocaleString('es-AR')} <span>USD</span></p>
                    <p className="cuenta-piece-meta">Tu puja</p>
                  </div>
                  <span className="cuenta-piece-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Favoritos */}
      <div className="cuenta-section">
        <div className="cuenta-section-head">
          <p className="cuenta-section-label">Guardadas</p>
          <h2 className="cuenta-section-title">Tus favoritas</h2>
        </div>
        {myFavs.length === 0 ? (
          <div className="cuenta-empty">
            <p>Todavía no guardaste ninguna pieza. Toca el ♡ en cualquier obra para guardarla acá.</p>
            <Link href="/obras" className="cuenta-empty-cta">Explorar catálogo →</Link>
          </div>
        ) : (
          <div className="cuenta-pieces-list">
            {myFavs.map((f) => (
              <Link href={`/obras/${f.pieces?.id}`} className="cuenta-piece-item cuenta-piece-link" key={f.id}>
                <div className="cuenta-piece-info">
                  <p className="cuenta-piece-title">{f.pieces?.title}</p>
                  <p className="cuenta-piece-meta">{f.pieces?.artists?.display_name}</p>
                </div>
                <div className="cuenta-piece-right">
                  <div className="cuenta-piece-bid">
                    <p className="cuenta-piece-amount">${Number(f.pieces?.min_bid).toLocaleString('es-AR')} <span>USD</span></p>
                    <p className="cuenta-piece-meta">Puja mínima</p>
                  </div>
                  <span className="cuenta-piece-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
