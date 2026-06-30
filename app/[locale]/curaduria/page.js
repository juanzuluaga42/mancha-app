import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import { decisionLabel } from '@/lib/curatorial';
import { resolveCurator } from '@/lib/curatorAccess';

export const metadata = { title: 'MANCHA — Curaduría' };

const PHASE_CLS = { phase1: 'is-pending', phase2: 'is-reveal', done: 'is-done' };
const PHASE_TAG = { phase1: 'tagPending', phase2: 'tagReveal', done: 'tagDone' };

export default async function CuraduriaPage({ searchParams }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const curator = await resolveCurator(supabase, user);
  if (!curator) redirect('/');
  if (curator.role !== 'founder' && !curator.onboarding_completed_at) redirect('/curaduria/bienvenida');

  const t = await getTranslations('curaduria');
  const locale = await getLocale();

  const { data: assignments } = await supabase
    .from('cur_assignments')
    .select('id, phase, created_at, cur_works(code, title, technique, image_url), cur_evaluations(curatorial_index, decision)')
    .eq('curator_id', curator.id)
    .order('created_at', { ascending: true });

  const list = assignments ?? [];
  const pending = list.filter((a) => a.phase === 'phase1');
  const reveal = list.filter((a) => a.phase === 'phase2');
  const done = list.filter((a) => a.phase === 'done');

  const roleLabel = curator.role === 'founder' ? t('roleFounder')
    : curator.role === 'guest' ? t('roleGuest') : t('roleCouncil');

  return (
    <>
      <Nav />
      <header className="cur-header">
        <div className="wrap">
          <p className="eyebrow" style={{ color: 'var(--lilac)' }}>{roleLabel}</p>
          <h1 className="cur-header-title">{t('dash.title')}</h1>
          <p className="cur-header-sub">{t('dash.sub', { name: curator.display_name })}</p>
          <div className="cur-stats">
            <div className="cur-stat"><b>{pending.length}</b><span>{t('dash.statPending')}</span></div>
            <div className="cur-stat"><b>{reveal.length}</b><span>{t('dash.statReveal')}</span></div>
            <div className="cur-stat"><b>{done.length}</b><span>{t('dash.statDone')}</span></div>
          </div>
          <div className="cur-founder-links">
            <Link href="/curaduria/perfil" className="cur-room-link">{t('dash.linkProfile')}</Link>
            {curator.role === 'founder' && (
              <>
                <Link href="/curaduria/asignar" className="cur-room-link">{t('dash.linkAssign')}</Link>
                <Link href="/curaduria/colegio" className="cur-room-link">{t('dash.linkCollege')}</Link>
                <Link href="/curaduria/candidatos" className="cur-room-link">{t('dash.linkCandidates')}</Link>
                <Link href="/curaduria/integridad" className="cur-room-link">{t('dash.linkIntegrity')}</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="cur-body">
        <div className="wrap" style={{ maxWidth: 960 }}>
          {sp?.welcome && <div className="cur-flash">{t('dash.flashWelcome')}</div>}
          {sp?.done && <div className="cur-flash">{t('dash.flashDone')}</div>}
          {sp?.error === 'asignacion' && <div className="cur-flash is-err">{t('dash.flashNoAssign')}</div>}

          <Section title={t('dash.secWaiting')} badge={pending.length} empty={t('dash.emptyWaiting')} assignments={pending} t={t} locale={locale} />
          <Section title={t('dash.secReveal')} badge={reveal.length} empty={t('dash.emptyReveal')} assignments={reveal} t={t} locale={locale} />
          <Section title={t('dash.secDone')} badge={done.length} empty={t('dash.emptyDone')} assignments={done} muted t={t} locale={locale} />
        </div>
      </div>
    </>
  );
}

function Section({ title, badge, empty, assignments, muted, t, locale }) {
  return (
    <section className="cur-section">
      <div className="cur-section-head">
        <h2>{title}</h2>
        <span className="cur-count">{badge}</span>
      </div>
      {assignments.length === 0 ? (
        <div className="cur-empty">{empty}</div>
      ) : (
        <div className="cur-grid">
          {assignments.map((a) => {
            const w = a.cur_works;
            const ev = Array.isArray(a.cur_evaluations) ? a.cur_evaluations[0] : a.cur_evaluations;
            return (
              <Link key={a.id} href={`/curaduria/revisar/${a.id}`} className={`cur-card${muted ? ' is-muted' : ''}`}>
                <div className="cur-card-img">
                  {w?.image_url
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={w.image_url} alt={w.code} />
                    : <div className="cur-card-noimg" />}
                  <span className="cur-card-code">{w?.code}</span>
                </div>
                <div className="cur-card-info">
                  <h3 className="cur-card-title">{w?.title || t('dash.untitled')}</h3>
                  <p className="cur-card-tech">{w?.technique}</p>
                  <div className="cur-card-foot">
                    <span className={`cur-tag ${PHASE_CLS[a.phase]}`}>{t(`dash.${PHASE_TAG[a.phase]}`)}</span>
                    {ev && a.phase !== 'phase1' && (
                      <span className="cur-card-index" title={t('dash.indexTitle')}>
                        {Number(ev.curatorial_index).toFixed(1)}
                      </span>
                    )}
                  </div>
                  {ev && a.phase === 'done' && (
                    <p className="cur-card-decision">{decisionLabel(ev.decision, locale)}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
