import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import { toggleFavorite, placeBid } from '@/app/actions';

const GRADIENTS = ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12'];
const WHATSAPP_NUMBER = '529981163542';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: piece } = await supabase.from('pieces').select('title, description, image_url, artists(display_name)').eq('id', id).maybeSingle();
  if (!piece) return { title: 'MANCHA — Obra' };
  const image = piece.image_url || '/og-default.jpg';
  const description = piece.description?.slice(0, 160) || `Una pieza de ${piece.artists?.display_name ?? 'la temporada actual'} en MANCHA.`;
  return {
    title: `MANCHA — ${piece.title}`,
    description,
    openGraph: { title: `MANCHA — ${piece.title}`, description, images: [image], type: 'website' },
    twitter: { card: 'summary_large_image', images: [image] },
  };
}

export default async function PiecePage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: piece } = await supabase
    .from('pieces')
    .select('*, bids(amount), favorites(buyer_id), artists(id, display_name, location, medium)')
    .eq('id', id)
    .maybeSingle();

  if (!piece) notFound();

  const amounts = (piece.bids ?? []).map((b) => Number(b.amount));
  const hasBids = amounts.length > 0;
  const currentBid = hasBids ? Math.max(...amounts) : Number(piece.min_bid);
  const favoriteCount = piece.favorites?.length ?? 0;
  const isFavorited = !!user && (piece.favorites ?? []).some((f) => f.buyer_id === user.id);
  const redirectTo = `/obras/${piece.id}`;
  const gradientClass = GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];

  return (
    <>
      <Nav />
      <Toast success={sp?.success} error={sp?.error} />

      <section className="piece-detail">
        <div className="wrap" style={{ maxWidth: '840px' }}>
          <Link href={`/artistas/${piece.artists.id}`} className="eyebrow" style={{ display: 'inline-block', marginBottom: 18 }}>
            ← Volver a {piece.artists.display_name}
          </Link>

          <div className="piece-detail-art">
            {piece.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={piece.image_url} alt={piece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div className={gradientClass} style={{ position: 'absolute', inset: 0 }} />
            )}
          </div>

          <div className="piece-detail-info">
            <p className="eyebrow">
              <Link href={`/artistas/${piece.artists.id}`}>{piece.artists.display_name}</Link>
              {piece.artists.location ? ` · ${piece.artists.location}` : ''}
            </p>
            <h1>{piece.title}</h1>
            <p className="piece-data">
              {piece.year ? `${piece.year} · ` : ''}{piece.technique}{piece.dimensions ? ` · ${piece.dimensions}` : ''}
            </p>

            {piece.description && <p className="piece-description">{piece.description}</p>}

            {(favoriteCount > 0 || hasBids) && (
              <p className="piece-activity" style={{ marginTop: 18 }}>
                {favoriteCount > 0 && <span>{favoriteCount} {favoriteCount === 1 ? 'persona sigue' : 'personas siguen'} esta obra</span>}
                {favoriteCount > 0 && hasBids && <span className="dot-sep">·</span>}
                {hasBids && <span>{piece.bids.length} {piece.bids.length === 1 ? 'puja registrada' : 'pujas registradas'}</span>}
              </p>
            )}

            <div className="piece-detail-actions">
              <form action={toggleFavorite}>
                <input type="hidden" name="pieceId" value={piece.id} />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <button className={`heart-btn${isFavorited ? ' active' : ''}`} type="submit" aria-pressed={isFavorited} aria-label="Marcar como favorito">
                  <svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 21s-7.2-4.35-9.3-8.7C1 9 2.4 5.4 6 5.4c2 0 3.4 1.2 4.4 2.6 1-1.4 2.4-2.6 4.4-2.6 3.6 0 5 3.6 3.3 6.9C19.2 16.65 12 21 12 21z" /></svg>
                  <span className="heart-count">{favoriteCount}</span>
                </button>
              </form>

              <div className="bid-min">
                <p className="eyebrow">{hasBids ? 'Puja actual' : 'Puja mínima'}</p>
                <p className="amount">${Number(currentBid).toLocaleString('es-AR')}</p>
              </div>

              <form action={placeBid} className="bid-form">
                <input type="hidden" name="pieceId" value={piece.id} />
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input
                  type="number"
                  name="amount"
                  min={Number(currentBid) + 1}
                  step="1"
                  required
                  className="bid-input"
                  placeholder={`${Number(currentBid) + 1}+`}
                  aria-label="Monto de tu puja"
                />
                <button className="piece-buy" type="submit">Pujar →</button>
              </form>
            </div>

            <p className="bid-trust-note">
              Al pujar te comprometes a pagar si eres quien más ofrece cuando cierre la temporada. Te contactamos por correo para coordinar el pago y el envío — sin letra chica.
            </p>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, me interesa la pieza "${piece.title}" de ${piece.artists.display_name} en MANCHA. ¿Está disponible para comprarla ya?`)}`}
              target="_blank"
              rel="noreferrer"
              className="whatsapp-cta"
            >
              ¿La quieres ya? Escríbenos por WhatsApp →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
