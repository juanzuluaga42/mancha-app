import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import { resolveCurator } from '@/lib/curatorAccess';
import { biasLabel } from '@/lib/curatorial';

export const metadata = { title: 'MANCHA — Blind Integrity Index' };

function one(v) { return Array.isArray(v) ? v[0] : v; }

export default async function IntegridadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');
  if (curator.role !== 'founder') redirect('/curaduria');

  const { data: reveals } = await supabase
    .from('cur_reveal')
    .select('bias, justification, submitted_at, cur_assignments(cur_curators(display_name), cur_works(code, title))')
    .order('submitted_at', { ascending: false });

  const list = reveals ?? [];
  const total = list.length;
  const none = list.filter((r) => r.bias === 'none').length;
  const slight = list.filter((r) => r.bias === 'slight').length;
  const significant = list.filter((r) => r.bias === 'significant').length;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const integrity = pct(none); // % de juicios que la info del artista NO movió

  const moved = list.filter((r) => r.bias !== 'none' && r.justification);

  return (
    <>
      <Nav />
      <header className="cur-header">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--lilac)' }}>Founder · integridad del proceso</p>
          <h1 className="cur-header-title">Blind Integrity Index</h1>
          <p className="cur-header-sub">Con qué frecuencia, y cuánto, la información del artista mueve el juicio del consejo. Prueba verificable de objetividad.</p>
          <Link href="/curaduria" className="cur-back" style={{ marginTop: 18 }}>← Sala curatorial</Link>
        </div>
      </header>

      <div className="cur-body">
        <div className="wrap" style={{ maxWidth: 880 }}>
          {total === 0 ? (
            <div className="cur-empty">Aún no hay mediciones de sesgo. Aparecen cuando los curadores completan la Fase 2.</div>
          ) : (
            <>
              <section className="cur-section">
                <div className="cur-integrity-hero">
                  <div className="cur-integrity-score">
                    <b>{integrity}<i>%</i></b>
                    <span>Integridad ciega</span>
                    <p>de los juicios no se modificaron al revelar al artista</p>
                  </div>
                  <div className="cur-integrity-bars">
                    {[
                      { k: 'none', label: biasLabel('none'), n: none, cls: 'ok' },
                      { k: 'slight', label: biasLabel('slight'), n: slight, cls: 'mid' },
                      { k: 'significant', label: biasLabel('significant'), n: significant, cls: 'hot' },
                    ].map((b) => (
                      <div key={b.k} className="cur-ibar">
                        <span className="cur-ibar-lab">{b.label}</span>
                        <span className="cur-ibar-track"><i className={b.cls} style={{ width: `${pct(b.n)}%` }} /></span>
                        <span className="cur-ibar-val">{b.n} · {pct(b.n)}%</span>
                      </div>
                    ))}
                    <p className="cur-integrity-total">{total} mediciones de Fase 2</p>
                  </div>
                </div>
              </section>

              {moved.length > 0 && (
                <section className="cur-section">
                  <div className="cur-section-head"><h2>Cuando el juicio se movió</h2><span className="cur-count">{moved.length}</span></div>
                  <div className="cur-moved-list">
                    {moved.map((r, i) => {
                      const a = one(r.cur_assignments);
                      const w = one(a?.cur_works);
                      const c = one(a?.cur_curators);
                      return (
                        <div key={i} className="cur-moved-card">
                          <div className="cur-moved-head">
                            <span className={`cur-tag ${r.bias === 'significant' ? 'is-reveal' : 'is-pending'}`}>{biasLabel(r.bias)}</span>
                            <span className="cur-moved-work">{w?.code} · {w?.title}</span>
                            {c?.display_name && <span className="cur-moved-cur">{c.display_name}</span>}
                          </div>
                          <p className="cur-moved-just">{r.justification}</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
