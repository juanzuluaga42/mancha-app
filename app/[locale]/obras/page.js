import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Splat from '@/components/Splat';
import Footer from '@/components/Footer';

import ObrasCatalog from '@/components/ObrasCatalog';
import { isTemporadaActiva } from '@/lib/fase';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  return { title: t('catalogTitle'), description: t('catalogDesc') };
}

// Página de subasta: los datos (pujas, vendidas) cambian en vivo, nunca cachear.
export const dynamic = 'force-dynamic';

export default async function ObrasPage() {
  if (!isTemporadaActiva()) {
    redirect('/?from=obras');
  }
  const t = await getTranslations('catalog');
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: season } = await supabase.from('seasons').select('id, name').eq('is_current', true).maybeSingle();

  const { data: artists } = await supabase
    .from('artists')
    .select('display_name, pieces(*, bids(amount), favorites(buyer_id))')
    .eq('season_id', season?.id ?? '00000000-0000-0000-0000-000000000000')
    .eq('status', 'approved');

  const pieces = (artists ?? []).flatMap((artist) =>
    (artist.pieces ?? []).map((piece) => {
      const amounts = (piece.bids ?? []).map((b) => Number(b.amount));
      const hasBids = amounts.length > 0;
      const currentBid = hasBids ? Math.max(...amounts) : Number(piece.min_bid);
      const favoriteCount = piece.favorites?.length ?? 0;
      const isFavorited = !!user && (piece.favorites ?? []).some((f) => f.buyer_id === user.id);
      return { ...piece, artistName: artist.display_name, hasBids, currentBid, favoriteCount, isFavorited };
    })
  );

  return (
    <>
      <Nav />

      <header className="obras-header">
        <Splat width="240px" height="210px" top="-65px" right="-50px" color="yellow" rotate={-10} radius="r1" />
        <Splat width="140px" height="122px" bottom="-45px" left="-35px" color="lilac" rotate={14} radius="r3" />
        <Splat width="80px" height="70px" top="40%" left="6%" color="red" rotate={8} radius="r4" />
        <Splat width="60px" height="54px" top="-28px" left="42%" color="red" rotate={-12} radius="r2" />
        <div className="wrap">
          <p className="eyebrow obras-header-eyebrow">{season?.name ?? t('headerEyebrowFallback')}</p>
          <h1 className="obras-header-title">
            {t('title1')}<br />
            <em>{t('titleEm')}</em>
          </h1>
          <p className="obras-header-sub">
            {pieces.length > 0
              ? t('subCount', { count: pieces.length }) + t('subTail')
              : t('subEmpty')}
          </p>
        </div>
      </header>

      <section className="obras-catalog-section">
        <div className="wrap obras-catalog-wrap">
          <ObrasCatalog pieces={pieces} />
        </div>
      </section>

      <Footer />
    </>
  );
}
