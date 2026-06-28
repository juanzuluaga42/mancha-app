import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link, redirect } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import LocalDate from '@/components/LocalDate';
import { cap } from '@/lib/utils';
import { formatCalendarDate } from '@/lib/dates';
import { isCatalogHidden } from '@/lib/fase';

const GRADIENTS = ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12'];

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: season } = await supabase.from('seasons').select('name').eq('id', id).maybeSingle();
  return { title: season ? `MANCHA — ${season.name}` : 'MANCHA — Temporada' };
}

export default async function TemporadaPage({ params }) {
  const locale = await getLocale();
  if (isCatalogHidden()) redirect({ href: '/', locale });
  const { id } = await params;
  const t = await getTranslations('season');
  const supabase = await createClient();

  const { data: season } = await supabase.from('seasons').select('*').eq('id', id).maybeSingle();
  if (!season) notFound();

  const { data: artists } = await supabase
    .from('artists')
    .select('*, pieces(*, bids(amount))')
    .eq('season_id', id)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  const allArtists = artists ?? [];
  const totalPieces = allArtists.reduce((s, a) => s + (a.pieces?.length ?? 0), 0);
  const totalBids = allArtists.reduce((s, a) => s + (a.pieces ?? []).reduce((ps, p) => ps + (p.bids?.length ?? 0), 0), 0);

  return (
    <>
      <Nav />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="temporada-header">
        <Splat width="200px" height="175px" top="-55px" right="-40px" color="yellow" rotate={-10} radius="r1" />
        <Splat width="120px" height="105px" bottom="-40px" left="-30px" color="lilac" rotate={14} radius="r3" />
        <Splat width="68px" height="60px" top="50%" left="5%" color="red" rotate={8} radius="r4" />
        <div className="wrap">
          <Link href="/temporadas" className="temporada-back">{t('back')}</Link>

          <div className="temporada-status-row">
            <span className={`temporada-badge${season.is_current ? ' temporada-badge-live' : ''}`}>
              {season.is_current ? t('live') : t('closed')}
            </span>
            <span className="temporada-dates">
              {formatCalendarDate(season.starts_at, locale, { day: '2-digit', month: 'short', year: 'numeric' })}
              {' — '}
              <LocalDate iso={season.ends_at} options={{ day: '2-digit', month: 'short', year: 'numeric' }} />
            </span>
          </div>

          <h1 className="temporada-title">{season.name}</h1>

          <div className="temporada-stats">
            <div className="temporada-stat">
              <b>{allArtists.length}</b>
              <span>{t('statArtists', { count: allArtists.length })}</span>
            </div>
            <div className="temporada-stat-sep" />
            <div className="temporada-stat">
              <b>{totalPieces}</b>
              <span>{t('statPieces', { count: totalPieces })}</span>
            </div>
            <div className="temporada-stat-sep" />
            <div className="temporada-stat">
              <b>{totalBids}</b>
              <span>{t('statBids', { count: totalBids })}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── ARTISTAS ─────────────────────────────────────── */}
      <section className="temporada-body">
        <div className="wrap">
          {allArtists.length === 0 ? (
            <div className="empty-state">{t('empty')}</div>
          ) : (
            <div className="artist-card-grid">
              {allArtists.map((artist, ai) => {
                const firstPiece = artist.pieces?.[0];
                const gradientClass = GRADIENTS[ai % GRADIENTS.length];
                const pieceCount = artist.pieces?.length ?? 0;
                const bids = (artist.pieces ?? []).reduce((s, p) => s + (p.bids?.length ?? 0), 0);
                return (
                  <Link href={`/artistas/${artist.id}`} className="artist-card" key={artist.id}>
                    <div className="artist-card-art">
                      {firstPiece?.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={firstPiece.image_url} alt={artist.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div className={gradientClass} style={{ position: 'absolute', inset: 0 }} />
                      )}
                    </div>
                    <div className="artist-card-info">
                      <p className="eyebrow">{String(ai + 1).padStart(2, '0')}</p>
                      <h3>{cap(artist.display_name)}</h3>
                      <p className="artist-card-meta">{artist.medium}{artist.location ? ` · ${artist.location}` : ''}</p>
                      <p className="artist-card-bio">{artist.bio}</p>
                      <span className="artist-card-cta">
                        {t('cardPieces', { count: pieceCount })}
                        {bids > 0 ? t('cardBidsSuffix', { count: bids }) : ''} →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
