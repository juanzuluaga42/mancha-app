import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PieceCard from '@/components/PieceCard';
import Toast from '@/components/Toast';
import { cap } from '@/lib/utils';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: artist } = await supabase.from('artists').select('display_name, bio, pieces(image_url)').eq('id', id).maybeSingle();
  if (!artist) return { title: 'MANCHA — Artista' };
  const name = cap(artist.display_name);
  const image = artist.pieces?.find((p) => p.image_url)?.image_url || '/og-default.jpg';
  const description = artist.bio?.slice(0, 160) || 'Una galería con pocos artistas a la vez.';
  return {
    title: `MANCHA — ${name}`,
    description,
    openGraph: { title: `MANCHA — ${name}`, description, images: [image], type: 'profile' },
    twitter: { card: 'summary_large_image', images: [image] },
  };
}

export default async function ArtistPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: artist } = await supabase
    .from('artists')
    .select('*, pieces(*, bids(amount), favorites(buyer_id))')
    .eq('id', id)
    .eq('status', 'approved')
    .maybeSingle();

  if (!artist) notFound();

  const redirectTo = `/artistas/${artist.id}`;

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

      <header className="page-header">
        <div className="wrap">
          <Link href="/artistas" className="eyebrow" style={{ display: 'inline-block', marginBottom: 18 }}>← Volver al catálogo</Link>
          <p className="eyebrow">{artist.medium}{artist.location ? ` · ${artist.location}` : ''}</p>
          <h1>{cap(artist.display_name)}</h1>
          <p className="sub">{artist.bio}</p>
        </div>
      </header>

      <section className="content" style={{ paddingTop: 50 }}>
        <div className="wrap" style={{ maxWidth: '760px' }}>
          <p className="eyebrow" style={{ marginBottom: 20 }}>Piezas en subasta esta temporada</p>

          {(artist.pieces ?? []).length === 0 ? (
            <div className="empty-state">Este artista todavía no subió piezas.</div>
          ) : (
            <div className="pieces">
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
