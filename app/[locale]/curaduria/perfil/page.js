import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import { resolveCurator } from '@/lib/curatorAccess';

export const metadata = { title: 'MANCHA — Mi perfil curatorial' };

const ROLE_LABEL = {
  founder: 'Founder',
  council: 'Founding Curatorial Council',
  guest: 'Guest Curator',
};

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');

  const [{ data: row }, { data: assignments }] = await Promise.all([
    supabase.from('cur_curators').select('display_name, role, created_at, email').eq('id', curator.id).maybeSingle(),
    supabase.from('cur_assignments').select('id, phase, round_id, cur_evaluations(id)').eq('curator_id', curator.id),
  ]);

  const list = assignments ?? [];
  const reviewed = list.filter((a) => (Array.isArray(a.cur_evaluations) ? a.cur_evaluations.length : a.cur_evaluations)).length;
  const rounds = new Set(list.map((a) => a.round_id)).size;
  const completed = list.filter((a) => a.phase === 'done').length;
  const since = row?.created_at
    ? new Date(row.created_at).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
    : '—';
  const roleLabel = ROLE_LABEL[curator.role] || ROLE_LABEL.council;

  return (
    <>
      <Nav />
      <header className="cur-header">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--lilac)' }}>{roleLabel}</p>
          <h1 className="cur-header-title">{row?.display_name || 'Curador'}</h1>
          <p className="cur-header-sub">Tu reconocimiento es tu contribución real — no medallas, no puntos, no rankings.</p>
          <Link href="/curaduria" className="cur-back" style={{ marginTop: 18 }}>← Sala curatorial</Link>
        </div>
      </header>

      <div className="cur-body">
        <div className="wrap" style={{ maxWidth: 820 }}>
          {/* Contribución real */}
          <section className="cur-section">
            <div className="cur-section-head"><h2>Contribución</h2></div>
            <div className="cur-stats">
              <div className="cur-stat"><b>{reviewed}</b><span>Obras evaluadas</span></div>
              <div className="cur-stat"><b>{completed}</b><span>Revisiones completas</span></div>
              <div className="cur-stat"><b>{rounds}</b><span>Rondas</span></div>
              <div className="cur-stat"><b style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>{since}</b><span>Miembro desde</span></div>
            </div>
          </section>

          {/* Reconocimiento institucional */}
          <section className="cur-section">
            <div className="cur-section-head"><h2>Reconocimiento institucional</h2></div>
            <div className="cur-cert-card">
              <div className="cur-cert-info">
                <span className="cur-cert-role">{roleLabel}</span>
                <p className="cur-cert-desc">
                  Tu nombramiento queda en el registro permanente de MANCHA. Puedes descargar tu certificado institucional.
                </p>
              </div>
              <a href="/curaduria/certificado" className="cur-decform-btn" download>Descargar certificado ↓</a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
