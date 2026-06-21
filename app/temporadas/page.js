import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';

export const metadata = { title: 'MANCHA — Temporadas' };

export default async function TemporadasPage() {
  const supabase = await createClient();
  const { data: seasons } = await supabase
    .from('seasons')
    .select('*, artists(id)')
    .order('starts_at', { ascending: false });

  return (
    <>
      <Nav />
      <header className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <Splat width="140px" height="120px" top="-25px" right="-35px" color="lilac" rotate={10} radius="r2" />
        <div className="wrap">
          <p className="eyebrow">Archivo</p>
          <h1>Todas las temporadas</h1>
          <p className="sub">Cada temporada queda guardada acá, cierre o no — para que se vea todo lo que pasó por MANCHA.</p>
        </div>
      </header>

      <section className="content">
        <div className="wrap" style={{ maxWidth: '720px' }}>
          {(!seasons || seasons.length === 0) ? (
            <div className="empty-state">Todavía no hay temporadas registradas.</div>
          ) : (
            <div className="season-list">
              {seasons.map((s) => (
                <Link href={`/temporadas/${s.id}`} className="season-row" key={s.id}>
                  <div>
                    <p className="season-row-name">{s.name}</p>
                    <p className="season-row-dates">
                      {new Date(s.starts_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' — '}
                      {new Date(s.ends_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="season-row-right">
                    <span className="season-row-count">{s.artists?.length ?? 0} artistas</span>
                    <span className={`season-badge${s.is_current ? ' active' : ''}`}>{s.is_current ? 'Actual' : 'Cerrada'}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
