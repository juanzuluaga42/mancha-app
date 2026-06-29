import { notFound } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import WaitlistForm from '@/components/WaitlistForm';
import SelloSeleccionado from '@/components/SelloSeleccionado';
import { toggleFavorite, placeBid } from '@/app/actions';
import { cap } from '@/lib/utils';
import { isSealed, isCanon, transactionStatus, provenanceLine, seasonName as fmtSeasonName } from '@/lib/provenance';

const ENQUIRE_EMAIL = 'mancha.gallery@gmail.com';

const GRADIENTS = ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12'];

export async function generateMetadata({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: piece } = await supabase.from('pieces').select('title, description, image_url, artists(display_name)').eq('id', id).maybeSingle();
  if (!piece) return { title: 'MANCHA — Obra' };
  const description = piece.description?.slice(0, 160) || `Una pieza de ${piece.artists?.display_name ?? 'la temporada actual'} en MANCHA.`;
  return {
    title: `MANCHA — ${piece.title}`,
    description,
    openGraph: { title: `MANCHA — ${piece.title}`, description, type: 'website' },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function PiecePage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const t = await getTranslations('piece');
  const locale = await getLocale();
  const numLocale = locale === 'en' ? 'en-US' : 'es-AR';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: piece } = await supabase
    .from('pieces')
    .select('*, bids(amount, created_at), favorites(buyer_id), artists(id, display_name, location, medium, season_id)')
    .eq('id', id)
    .maybeSingle();

  if (!piece) notFound();

  let seasonName = null;
  let seasonObj = null;
  let seasonOrdinal = 0;
  if (piece.artists?.season_id) {
    const { data: seasons } = await supabase
      .from('seasons')
      .select('id, name, ends_at, sealed_at, starts_at')
      .order('starts_at', { ascending: true });
    const list = seasons ?? [];
    const idx = list.findIndex((s) => s.id === piece.artists.season_id);
    seasonObj = idx >= 0 ? list[idx] : null;
    seasonOrdinal = idx >= 0 ? idx + 1 : 0;
    seasonName = seasonObj?.name ? fmtSeasonName(seasonObj.name, locale) : null;
  }
  // Una temporada sellada (o cerrada en el tiempo) saca la obra del piso abierto.
  const seasonClosed = isSealed(seasonObj);
  const collected = piece.sold === true || !!piece.paid_at;
  const lifecycle = transactionStatus(piece);       // collected | available_by_request | withdrawn
  const canon = isCanon(piece);
  const accession = piece.accession ? provenanceLine(seasonOrdinal, piece.accession) : null;

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
            <Link href="/obras" className="piece-breadcrumb-link">{t('breadcrumbCatalogue')}</Link>
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
                  <span>{t('sold')}</span>
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

              {/* Procedencia (temporada sellada) */}
              {(accession || canon) && (
                <div className="piece-prov">
                  {accession && <span className="piece-prov-line">{accession}</span>}
                  {canon && <span className="piece-canon">{t('canonLabel')}</span>}
                  {collected && (
                    <Link href={`/obras/${piece.id}/certificado`} className="piece-prov-cert">{t('viewCertificate')} →</Link>
                  )}
                </div>
              )}

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
                    <span>{t('followCount', { count: favoriteCount })}</span>
                  )}
                  {favoriteCount > 0 && hasBids && <span className="piece-detail-proof-sep">·</span>}
                  {hasBids && (
                    <span>{t('bidsCount', { count: bidCount })}</span>
                  )}
                </div>
              )}

              {/* Discovery line */}
              {!piece.sold && !seasonClosed && (
                <p className="piece-detail-discovery">{t('discovery')}</p>
              )}

              {/* Precio + acciones */}
              <div className="piece-detail-bid-block">
                <div className="piece-detail-price-row">
                  <div>
                    <p className="piece-detail-price-label">
                      {piece.sold ? t('priceFinal') : seasonClosed ? t('priceClosed') : hasBids ? t('priceCurrent') : t('priceMin')}
                    </p>
                    <p className="piece-detail-price">
                      ${Number(currentBid).toLocaleString(numLocale)}
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
                      aria-label={t('favAria')}
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
                      <span className="piece-sold-block-label">{t('soldLabel')}</span>
                    </div>
                    <p className="piece-sold-block-text">{t('soldText1')}</p>
                  </div>
                ) : seasonClosed ? (
                  lifecycle === 'withdrawn' ? (
                    <div className="piece-detail-status closed">{t('withdrawnText')}</div>
                  ) : (
                    <div className="piece-avail">
                      <p className="piece-avail-title">{t('availableTitle')}</p>
                      <p className="piece-avail-text">{t('availableText')}</p>
                      <a
                        href={`mailto:${ENQUIRE_EMAIL}?subject=${encodeURIComponent(`MANCHA${accession ? ` · ${accession}` : ''} — ${piece.title}`)}`}
                        className="piece-avail-cta"
                      >
                        {t('enquire')} →
                      </a>
                    </div>
                  )
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
                        placeholder={t('bidPlaceholder', { min: (Number(currentBid) + 5).toLocaleString(numLocale) })}
                        aria-label={t('bidAria')}
                      />
                      <button className="btn-primary piece-detail-bid-btn" type="submit">
                        {t('bidBtn')}
                      </button>
                    </form>

                    <p className="piece-detail-trust">{t('bidTrust')}</p>
                  </>
                )}
              </div>

              {/* Waitlist */}
              {!piece.sold && !seasonClosed && !user && (
                <div className="piece-detail-waitlist">
                  <p className="piece-detail-waitlist-label">{t('waitlistLabel')}</p>
                  <p className="piece-detail-waitlist-sub">{t('waitlistSub')}</p>
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
