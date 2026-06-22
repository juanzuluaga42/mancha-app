import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import WaitlistForm from '@/components/WaitlistForm';
import SelloSeleccionado from '@/components/SelloSeleccionado';
import { toggleFavorite, placeBid } from '@/app/actions';
import { cap } from '@/lib/utils';

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
    .select('*, bids(amount, created_at), favorites(buyer_id), artists(id, display_name, location, medium, season_id)')
    .eq('id', id)
    .maybeSingle();

  if (!piece) notFound();

  let seasonEndsAt = null;
  let seasonName = null;
  if (piece.artists?.season_id) {
    const { data: season } = await supabase.from('seasons').select('ends_at, name').eq('id', piece.artists.season_id).maybeSingle();
    seasonEndsAt = season?.ends_at ?? null;
    seasonName = season?.name ?? null;
  }
  const seasonClosed = !!seasonEndsAt && new Date(seasonEndsAt).getTime() < Date.now();

  const amounts = (piece.bids ?? []).map((b) => Number(b.amount));
  const hasBids = amounts.length > 0;
  const currentBid = hasBids ? Math.max(...amounts) : Number(piece.min_bid);
  const bidCount = piece.bids?.length ?? 0;
  const favoriteCount = piece.favorites?.length ?? 0;
  const isFavorited = !!user && (piece.favorites ?? []).some((f) => f.buyer_id === user.id);
  const redirectTo = `/obras/${piece.id}`;
  const gradientIndex = piece.id ? piece.id.charCodeAt(0) % GRADIENTS.length : 0;
  const gradientClass = GRADIENTS[gradientIndex];
  const artistName = cap(piece.artists?.display_name ?? '');

  return (
    <>
      <Nav />
      <Toast success={sp?.success} error={sp?.error} />

      <div className="piece-page">

        {/* ── Breadcrumb ───────────────────────────────────── */}
        <div className="piece-breadcrumb">
          <div className="wrap">
            <Link href="/obras" className="piece-breadcrumb-link">← Catálogo</Link>
            <span className="piece-breadcrumb-sep">/</span>
            <Link href={`/artistas/${piece.artists.id}`} className="piece-breadcrumb-link">{artistName}</Link>
            <span className="piece-breadcrumb-sep">/</span>
            <span className="piece-breadcrumb-current">{piece.title}</span>
          </div>
        </div>

        {/* ── Layout split ─────────────────────────────────── */}
        <div className="piece-split">

          {/* Imagen */}
          <div className="piece-split-left">
            <div className="piece-main-art">
              {piece.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={piece.image_url} alt={piece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className={gradientClass} style={{ position: 'absolute', inset: 0 }} />
              )}
              {piece.sold && (
                <div className="piece-sold-overlay">
                  <span>Vendida</span>
                </div>
              )}
            </div>
          </div>

          {/* Info + acciones */}
          <div className="piece-split-right">
            <div className="piece-split-sticky">

              {/* Artista */}
              <div className="piece-detail-artist-row">
                <Link href={`/artistas/${piece.artists.id}`} className="piece-detail-artist-link">
                  {artistName}
                </Link>
                {piece.artists.location && (
                  <span className="piece-detail-location">{piece.artists.location}</span>
                )}
              </div>
              <SelloSeleccionado seasonName={seasonName} />

              {/* Título y datos */}
              <h1 className="piece-detail-title">{piece.title}</h1>
              {(piece.technique || piece.year || piece.dimensions) && (
                <p className="piece-detail-meta">
                  {[piece.year, piece.technique, piece.dimensions].filter(Boolean).join(' · ')}
                </p>
              )}

              {/* Descripción */}
              {piece.description && (
                <p className="piece-detail-description">{piece.description}</p>
              )}

              {/* Social proof */}
              {(favoriteCount > 0 || hasBids) && (
                <div className="piece-detail-proof">
                  {favoriteCount > 0 && (
                    <span>{favoriteCount} {favoriteCount === 1 ? 'persona sigue' : 'personas siguen'} esta obra</span>
                  )}
                  {favoriteCount > 0 && hasBids && <span className="piece-detail-proof-sep">·</span>}
                  {hasBids && (
                    <span>{bidCount} {bidCount === 1 ? 'puja registrada' : 'pujas registradas'}</span>
                  )}
                </div>
              )}

              {/* Discovery line */}
              {!piece.sold && !seasonClosed && (
                <p className="piece-detail-discovery">
                  Una pieza única de este artista esta temporada.
                  Cuando cierra, no vuelve.
                </p>
              )}

              {/* Precio + acciones */}
              <div className="piece-detail-bid-block">
                <div className="piece-detail-price-row">
                  <div>
                    <p className="piece-detail-price-label">
                      {piece.sold ? 'Precio final' : seasonClosed ? 'Temporada cerrada' : hasBids ? 'Puja actual' : 'Puja mínima'}
                    </p>
                    <p className="piece-detail-price">
                      ${Number(currentBid).toLocaleString('es-AR')}
                      <span className="piece-detail-currency"> USD</span>
                    </p>
                  </div>

                  {/* Corazón */}
                  <form action={toggleFavorite}>
                    <input type="hidden" name="pieceId" value={piece.id} />
                    <input type="hidden" name="redirectTo" value={redirectTo} />
                    <button
                      className={`heart-btn piece-detail-fav${isFavorited ? ' active' : ''}`}
                      type="submit"
                      aria-pressed={isFavorited}
                      aria-label="Marcar como favorito"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12 21s-7.2-4.35-9.3-8.7C1 9 2.4 5.4 6 5.4c2 0 3.4 1.2 4.4 2.6 1-1.4 2.4-2.6 4.4-2.6 3.6 0 5 3.6 3.3 6.9C19.2 16.65 12 21 12 21z" />
                      </svg>
                      {favoriteCount > 0 && <span>{favoriteCount}</span>}
                    </button>
                  </form>
                </div>

                {/* Formulario de puja */}
                {piece.sold ? (
                  <div className="piece-sold-block">
                    <div className="piece-sold-block-head">
                      <span className="piece-sold-block-dot">●</span>
                      <span className="piece-sold-block-label">Vendida</span>
                    </div>
                    <p className="piece-sold-block-text">
                      Esta pieza ya encontró a su coleccionista. Es única — no hay otra igual.
                    </p>
                    <p className="piece-sold-block-text piece-sold-block-soft">
                      ¿Te enamoraste igual? Escríbenos. Si hay verdadero interés, vemos con el artista
                      si existe algo más por mostrar o alguna forma de llegar a un acuerdo.
                    </p>
                    <a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, vi que "${piece.title}" de ${artistName} en MANCHA ya se vendió, pero me interesa muchísimo. ¿Hay alguna posibilidad?`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="piece-sold-block-wa"
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Escríbenos por la pieza
                    </a>
                  </div>
                ) : seasonClosed ? (
                  <div className="piece-detail-status closed">Esta temporada ya cerró.</div>
                ) : (
                  <>
                    <form action={placeBid} className="piece-detail-bid-form">
                      <input type="hidden" name="pieceId" value={piece.id} />
                      <input type="hidden" name="redirectTo" value={redirectTo} />
                      <input
                        type="number"
                        name="amount"
                        min={Number(currentBid) + 5}
                        step="5"
                        required
                        className="piece-detail-bid-input"
                        placeholder={`Mínimo $${(Number(currentBid) + 5).toLocaleString('es-AR')} USD`}
                        aria-label="Monto de tu puja en USD"
                      />
                      <button className="btn-primary piece-detail-bid-btn" type="submit">
                        Registrar puja →
                      </button>
                    </form>

                    <p className="piece-detail-trust">
                      Al pujar te comprometes a pagar si eres quien más ofrece al cierre de la temporada.
                      Te contactamos por correo para coordinar — sin costos extra.
                    </p>
                  </>
                )}
              </div>

              {/* WhatsApp */}
              {!piece.sold && !seasonClosed && (
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, me interesa la pieza "${piece.title}" de ${artistName} en MANCHA. ¿Está disponible?`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="piece-detail-whatsapp"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  ¿La quieres ya? Escríbenos por WhatsApp
                </a>
              )}

              {/* Waitlist */}
              {!piece.sold && !seasonClosed && !user && (
                <div className="piece-detail-waitlist">
                  <p className="piece-detail-waitlist-label">¿Sin cuenta todavía?</p>
                  <p className="piece-detail-waitlist-sub">Déjanos tu correo y te avisamos si hay novedades sobre esta pieza.</p>
                  <WaitlistForm pieceId={piece.id} redirectTo={redirectTo} />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
