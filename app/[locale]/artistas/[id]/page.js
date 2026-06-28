import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link, redirect } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Splat from '@/components/Splat';
import Footer from '@/components/Footer';

import PieceCard from '@/components/PieceCard';
import Toast from '@/components/Toast';
import SelloSeleccionado from '@/components/SelloSeleccionado';
import { cap } from '@/lib/utils';
import { isPreLaunch, isConvocatoria, isCatalogHidden } from '@/lib/fase';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: artist } = await supabase.from('artists').select('display_name, bio, pieces(image_url)').eq('id', id).maybeSingle();
  if (!artist) return { title: 'MANCHA — Artista' };
  const name = cap(artist.display_name);
  const description = artist.bio?.slice(0, 160) || 'Una galería con pocos artistas a la vez.';
  return {
    title: `MANCHA — ${name}`,
    description,
    openGraph: { title: `MANCHA — ${name}`, description, type: 'profile' },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ArtistPage({ params, searchParams }) {
  const locale = await getLocale();
  if (isCatalogHidden()) redirect({ href: '/', locale });
  const { id } = await params;
  const sp = await searchParams;
  const t = await getTranslations('artistPage');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: artist } = await supabase
    .from('artists')
    .select('*, season:seasons(name), pieces(*, bids(amount), favorites(buyer_id))')
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle();

  if (!artist) notFound();

  const redirectTo = `/artistas/${artist.id}`;
  const seasonName = artist.season?.name ?? null;

  function bidInfo(piece) {
    const amounts = (piece.bids ?? []).map((b) => Number(b.amount));
    const hasBids = amounts.length > 0;
    const currentBid = hasBids ? Math.max(...amounts) : Number(piece.min_bid);
    const favoriteCount = piece.favorites?.length ?? 0;
    const isFavorited = !!user && (piece.favorites ?? []).some((f) => f.buyer_id === user.id);
    return { hasBids, currentBid, favoriteCount, isFavorited };
  }

  return (
    <>
      <Nav />
      <Toast success={sp?.success} error={sp?.error} />

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="artist-header">
        <Splat width="180px" height="155px" top="-50px" right="-40px" color="red" rotate={-13} radius="r2" />
        <Splat width="100px" height="88px" bottom="-30px" left="-25px" color="yellow" rotate={15} radius="r4" />
        <Splat width="60px" height="53px" top="46%" left="5%" color="lilac" rotate={7} radius="r1" />
        <div className="wrap">
          <Link href="/artistas" className="artist-header-back">{t('back')}</Link>
          <div className="artist-header-meta">
            <p className="artist-header-technique">{artist.medium}{artist.location ? ` · ${artist.location}` : ''}</p>
          </div>
          <h1 className="artist-header-name">{cap(artist.display_name)}</h1>
          <SelloSeleccionado seasonName={seasonName} />
          {artist.bio && <p className="artist-header-bio">{artist.bio}</p>}
        </div>
      </header>

      {/* ── PIEZAS ───────────────────────────────────────── */}
      <section className="artist-pieces">
        <div className="wrap artist-pieces-wrap">
          <p className="artist-pieces-label">{t('piecesLabel', { count: (artist.pieces ?? []).length })}</p>

          {(artist.pieces ?? []).length === 0 ? (
            <div className="empty-state">{t('empty')}</div>
          ) : (
            <div className="obras-grid">
              {artist.pieces.map((piece, pi) => {
                const info = bidInfo(piece);
                return (
                  <PieceCard
                    key={piece.id}
                    piece={piece}
                    index={pi}
                    isFavorited={info.isFavorited}
                    favoriteCount={info.favoriteCount}
                    currentBid={info.currentBid}
                    hasBids={info.hasBids}
                    redirectTo={redirectTo}
                  />
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
