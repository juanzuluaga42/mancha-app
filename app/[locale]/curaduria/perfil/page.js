import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import { resolveCurator } from '@/lib/curatorAccess';

export const metadata = { title: 'MANCHA — Mi perfil curatorial' };

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');
  if (curator.role !== 'founder' && !curator.onboarding_completed_at) redirect('/curaduria/bienvenida');

  const t = await getTranslations('curaduria');
  const locale = await getLocale();

  const [{ data: row }, { data: assignments }] = await Promise.all([
    supabase.from('cur_curators').select('display_name, role, created_at, email').eq('id', curator.id).maybeSingle(),
    supabase.from('cur_assignments').select('id, phase, round_id, cur_evaluations(id)').eq('curator_id', curator.id),
  ]);

  const list = assignments ?? [];
  const reviewed = list.filter((a) => (Array.isArray(a.cur_evaluations) ? a.cur_evaluations.length : a.cur_evaluations)).length;
  const rounds = new Set(list.map((a) => a.round_id)).size;
  const completed = list.filter((a) => a.phase === 'done').length;
  const since = row?.created_at
    ? new Date(row.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-AR', { month: 'long', year: 'numeric' })
    : '—';
  const roleLabel = curator.role === 'founder' ? t('roleFounder')
    : curator.role === 'guest' ? t('roleGuest') : t('roleCouncil');

  return (
    <>
      <Nav />
      <header className="cur-header">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--lilac)' }}>{roleLabel}</p>
          <h1 className="cur-header-title">{row?.display_name || t('profile.curator')}</h1>
          <p className="cur-header-sub">{t('profile.sub')}</p>
          <Link href="/curaduria" className="cur-back" style={{ marginTop: 18 }}>{t('backRoom')}</Link>
        </div>
      </header>

      <div className="cur-body">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <section className="cur-section">
            <div className="cur-section-head"><h2>{t('profile.contribution')}</h2></div>
            <div className="cur-stats">
              <div className="cur-stat"><b>{reviewed}</b><span>{t('profile.worksEvaluated')}</span></div>
              <div className="cur-stat"><b>{completed}</b><span>{t('profile.reviewsDone')}</span></div>
              <div className="cur-stat"><b>{rounds}</b><span>{t('profile.rounds')}</span></div>
              <div className="cur-stat"><b style={{ fontSize: '1.2rem', lineHeight: 1.6 }}>{since}</b><span>{t('profile.memberSince')}</span></div>
            </div>
          </section>

          <section className="cur-section">
            <div className="cur-section-head"><h2>{t('profile.recognition')}</h2></div>
            <div className="cur-cert-card">
              <div className="cur-cert-info">
                <span className="cur-cert-role">{roleLabel}</span>
                <p className="cur-cert-desc">{t('profile.certDesc')}</p>
              </div>
              <a href="/curaduria/certificado" className="cur-decform-btn" download>{t('profile.downloadCert')}</a>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
