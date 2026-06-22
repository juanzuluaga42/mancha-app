import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';

export const metadata = {
  title: 'MANCHA — Archivo de temporadas',
  description: 'Todas las temporadas de MANCHA — activas y cerradas. El registro de todo lo que pasó.',
};

export default async function TemporadasPage() {
  const supabase = await createClient();
  const { data: seasons } = await supabase
    .from('seasons')
    .select('*, artists(id)')
    .order('starts_at', { ascending: false });

  const list = seasons ?? [];
  const current = list.find((s) => s.is_current);
  const past = list.filter((s) => !s.is_current);

  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="archivo-header">
        <Splat width="220px" height="190px" top="-55px" right="-45px" color="lilac" rotate={10} radius="r2" />
        <Splat width="130px" height="115px" bottom="-40px" left="-35px" color="yellow" rotate={-14} radius="r3" />
        <Splat width="72px" height="64px" top="44%" left="8%" color="red" rotate={8} radius="r4" />
        <Splat width="58px" height="52px" top="-25px" left="44%" color="red" rotate={-10} radius="r1" />
        <div className="wrap">
          <p className="eyebrow archivo-eyebrow">Archivo</p>
          <h1 className="archivo-title">
            Cada temporada<br />
            <em>queda aquí.</em>
          </h1>
          <p className="archivo-sub">
            MANCHA guarda el registro de todo lo que pasó —
            artistas, piezas y pujas. Cierre o no.
          </p>
          {list.length > 0 && (
            <div className="archivo-meta">
              <span><b>{list.length}</b> temporada{list.length !== 1 ? 's' : ''}</span>
              <span className="archivo-meta-sep">·</span>
              <span><b>{list.reduce((acc, s) => acc + (s.artists?.length ?? 0), 0)}</b> artistas en total</span>
            </div>
          )}
        </div>
      </header>

      {/* ── CONTENIDO ────────────────────────────────────── */}
      <div className="archivo-body">
        <div className="wrap" style={{ maxWidth: 860 }}>

          {list.length === 0 ? (
            <div className="empty-state">Todavía no hay temporadas registradas.</div>
          ) : (
            <>
              {/* Temporada actual */}
              {current && (
                <div className="archivo-group">
                  <p className="archivo-group-label">Temporada actual</p>
                  <Link href={`/temporadas/${current.id}`} className="season-card season-card-current">
                    <div className="season-card-num">
                      {String(list.indexOf(current) + 1).padStart(2, '0')}
                    </div>
                    <div className="season-card-info">
                      <h2 className="season-card-name">{current.name}</h2>
                      <p className="season-card-dates">
                        {new Date(current.starts_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        {' — '}
                        {new Date(current.ends_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="season-card-stats">
                      <div className="season-card-stat">
                        <b>{current.artists?.length ?? 0}</b>
                        <span>artistas</span>
                      </div>
                      <span className="season-card-badge current">En curso</span>
                    </div>
                    <div className="season-card-arrow">→</div>
                  </Link>
                </div>
              )}

              {/* Temporadas pasadas */}
              {past.length > 0 && (
                <div className="archivo-group">
                  <p className="archivo-group-label">Temporadas anteriores</p>
                  <div className="season-past-list">
                    {past.map((s, i) => (
                      <Link href={`/temporadas/${s.id}`} className="season-card" key={s.id}>
                        <div className="season-card-num">
                          {String(list.indexOf(s) + 1).padStart(2, '0')}
                        </div>
                        <div className="season-card-info">
                          <h2 className="season-card-name">{s.name}</h2>
                          <p className="season-card-dates">
                            {new Date(s.starts_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                            {' — '}
                            {new Date(s.ends_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="season-card-stats">
                          <div className="season-card-stat">
                            <b>{s.artists?.length ?? 0}</b>
                            <span>artistas</span>
                          </div>
                          <span className="season-card-badge">Cerrada para siempre</span>
                        </div>
                        <div className="season-card-arrow">→</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
