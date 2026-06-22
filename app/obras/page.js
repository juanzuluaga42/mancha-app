import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import ObrasCatalog from '@/components/ObrasCatalog';

export const metadata = {
  title: 'MANCHA — Catálogo de la temporada',
  description: 'Todas las piezas en subasta esta temporada. Explora, sigue y puja por lo que te detenga.',
};

export default async function ObrasPage() {
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
          <p className="eyebrow obras-header-eyebrow">{season?.name ?? 'Temporada actual'}</p>
          <h1 className="obras-header-title">
            Piezas únicas.<br />
            <em>Por tiempo limitado.</em>
          </h1>
          <p className="obras-header-sub">
            {pieces.length > 0
              ? `${pieces.length} ${pieces.length === 1 ? 'pieza en subasta' : 'piezas en subasta'} — cada una elegida a mano. Lo que ves hoy puede no estar mañana.`
              : 'El catálogo se revela cuando los artistas son confirmados. La selección está en curso.'}
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
