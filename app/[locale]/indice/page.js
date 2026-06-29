import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import LocalDate from '@/components/LocalDate';
import { cap } from '@/lib/utils';
import { formatCalendarDate } from '@/lib/dates';
import {
  accessionNo,
  transactionStatus,
  isSealed,
  seasonCode,
  seasonName,
} from '@/lib/provenance';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  return {
    title: t('indexTitle'),
    description: t('indexDesc'),
    openGraph: { title: t('indexTitle'), description: t('indexDesc'), images: ['/og-default.jpg'], type: 'website' },
  };
}

export const dynamic = 'force-dynamic';

const ENQUIRE_EMAIL = 'mancha.gallery@gmail.com';

export default async function IndexPage() {
  const t = await getTranslations('index');
  const locale = await getLocale();
  const supabase = await createClient();

  // Todas las temporadas en orden histórico (para el ordinal S01, S02, …).
  const { data: seasonsRaw } = await supabase
    .from('seasons')
    .select('id, name, starts_at, ends_at, is_current')
    .order('starts_at', { ascending: true });
  const allSeasons = seasonsRaw ?? [];
  const ordinalById = new Map(allSeasons.map((s, i) => [s.id, i + 1]));

  // El Índice solo registra temporadas SELLADAS (sealed_at o ya cerradas en el tiempo).
  const sealedSeasons = allSeasons
    .filter((s) => isSealed(s))
    .sort((a, b) => new Date(b.starts_at) - new Date(a.starts_at)); // más reciente primero

  // Artistas aprobados con sus obras.
  const { data: artistsRaw } = await supabase
    .from('artists')
    .select('id, display_name, medium, location, season_id, pieces(id, title, technique, year, image_url, sold, paid_at, in_canon, withdrawn, accession, min_bid, created_at, bids(amount))')
    .eq('status', 'approved')
    .order('created_at', { ascending: true });
  const allArtists = artistsRaw ?? [];

  const accentColors = ['var(--red)', 'var(--yellow)', 'var(--lilac)', 'var(--red-deep)', 'var(--yellow-deep)', 'var(--lilac-deep)'];

  // Aplana en obras-con-contexto, en orden estable, y numera por temporada.
  const editions = sealedSeasons.map((s) => {
    const ordinal = ordinalById.get(s.id) ?? 0;
    const seasonArtists = allArtists.filter((a) => a.season_id === s.id);
    let n = 0;
    const works = [];
    for (const artist of seasonArtists) {
      for (const piece of (artist.pieces ?? [])) {
        n += 1;
        // Número de acceso inmutable si ya fue asignado al sellar; si no, derivado.
        const number = piece.accession ?? n;
        works.push({
          ...piece,
          artistName: artist.display_name,
          artistId: artist.id,
          medium: artist.medium,
          location: artist.location,
          accession: accessionNo(ordinal, number),
          status: transactionStatus(piece),
        });
      }
    }
    const collected = works.filter((w) => w.status === 'collected').length;
    return { ...s, ordinal, works, collected };
  }).filter((e) => e.works.length > 0);

  const hasWorks = editions.length > 0;

  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="idx-header">
        <Splat width="210px" height="185px" top="-58px" right="-44px" color="lilac" rotate={-9} radius="r2" />
        <Splat width="120px" height="105px" bottom="-38px" left="-32px" color="red" rotate={15} radius="r4" />
        <Splat width="70px" height="62px" top="46%" left="6%" color="yellow" rotate={10} radius="r1" />
        <div className="wrap">
          <p className="eyebrow idx-eyebrow">{t('eyebrow')}</p>
          <h1 className="idx-title">
            {t('title1')}<br />
            <em>{t('titleEm')}</em>
          </h1>
          <p className="idx-sub">{t('sub')}</p>
        </div>
      </header>

      {/* ── EDICIONES ────────────────────────────────────── */}
      {!hasWorks ? (
        <section className="idx-empty">
          <div className="wrap">
            <p className="idx-empty-mark">№</p>
            <h2 className="idx-empty-title">{t('emptyTitle')}</h2>
            <p className="idx-empty-text">{t('emptyText')}</p>
          </div>
        </section>
      ) : (
        <main className="idx-main">
          <div className="wrap">
            {editions.map((edition) => (
              <section className="idx-edition" key={edition.id}>
                <div className="idx-edition-head">
                  <div className="idx-edition-id">
                    <span className="idx-edition-code">{seasonCode(edition.ordinal)}</span>
                    <h2 className="idx-edition-name">{seasonName(edition.name, locale)}</h2>
                    <p className="idx-edition-dates">
                      {formatCalendarDate(edition.starts_at, locale, { month: 'short', year: 'numeric' })}
                      {' — '}
                      <LocalDate iso={edition.ends_at} options={{ month: 'short', year: 'numeric' }} />
                    </p>
                  </div>
                  <div className="idx-edition-stats">
                    <span>{t('works', { count: edition.works.length })}</span>
                    <span className="idx-stat-sep">·</span>
                    <span>{t('collectedCount', { count: edition.collected })}</span>
                  </div>
                </div>

                <div className="idx-grid">
                  {edition.works.map((w, i) => {
                    const img = w.image_url;
                    const initials = w.artistName.split(' ').map((p) => p[0]).slice(0, 2).join('');
                    const statusLabel = { collected: t('statusCollected'), available_by_request: t('statusRequest'), withdrawn: t('statusWithdrawn') }[w.status];
                    const enquireHref = `mailto:${ENQUIRE_EMAIL}?subject=${encodeURIComponent(`MANCHA · ${w.accession} — ${w.title}`)}`;
                    return (
                      <article className="idx-work" key={w.id}>
                        <div className="idx-work-media" style={{ background: accentColors[i % accentColors.length] }}>
                          {img
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={img} alt={w.title} />
                            : <span className="idx-work-initials">{initials}</span>}
                          <span className={`idx-status ${w.status}`}>{statusLabel}</span>
                        </div>
                        <div className="idx-work-body">
                          <p className="idx-work-prov">MANCHA · {w.accession}</p>
                          <h3 className="idx-work-title">{w.title}</h3>
                          <p className="idx-work-artist">
                            {cap(w.artistName)}
                            {w.medium ? <span className="idx-work-medium"> · {w.medium}</span> : null}
                          </p>
                          <p className="idx-work-tech">
                            {[w.technique, w.year].filter(Boolean).join(' · ')}
                          </p>
                          <div className="idx-work-foot">
                            {w.status === 'collected'
                              ? <Link href={`/obras/${w.id}/certificado`} className="idx-work-link">{t('viewCertificate')} →</Link>
                              : w.status === 'available_by_request'
                                ? <a href={enquireHref} className="idx-work-link idx-work-link--ghost">{t('enquire')} →</a>
                                : <span className="idx-work-reserve">{t('statusWithdrawn')}</span>}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </main>
      )}

      <Footer />
    </>
  );
}
