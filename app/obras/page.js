import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import ObrasCatalog from '@/components/ObrasCatalog';

export const metadata = {
  title: 'MANCHA — Catálogo completo',
  description: 'Todas las piezas en subasta esta temporada, con buscador y filtros.',
};

export default async function ObrasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: season } = await supabase.from('seasons').select('id').eq('is_current', true).maybeSingle();

  const { data: artists } = await supabase
    .from('artists')
    .select('display_name, pieces(*, bids(amount), favorites(buyer_id))')
    .eq('season_id', season?.id ?? '00000000-0000-0000-0000-000000000000');

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
      <header className="page-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <Splat width="140px" height="120px" top="-25px" right="-30px" color="yellow" rotate={12} radius="r2" />
        <div className="wrap">
          <p className="eyebrow">Catálogo</p>
          <h1>Todas las piezas de la temporada</h1>
          <p className="sub">Buscá por nombre o artista, filtrá por técnica, u ordená por precio.</p>
        </div>
      </header>

      <section className="content">
        <div className="wrap" style={{ maxWidth: '780px' }}>
          <ObrasCatalog pieces={pieces} />
        </div>
      </section>

      <Footer />
    </>
  );
}
