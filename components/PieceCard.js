'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { toggleFavorite } from '@/app/actions';

const GRADIENTS = ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12'];

export default function PieceCard({ piece, index, isFavorited, favoriteCount, currentBid, hasBids, redirectTo = '/' }) {
  const t = useTranslations('catalog');
  const gradientClass = GRADIENTS[index % GRADIENTS.length];
  const bidCount = piece.bids?.length ?? 0;

  return (
    <article className="obra-card">
      <Link href={`/obras/${piece.id}`} className="obra-card-art" tabIndex={-1} aria-hidden="true">
        {piece.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={piece.image_url} alt={piece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className={gradientClass} style={{ position: 'absolute', inset: 0 }} />
        )}
        {piece.sold && <span className="obra-card-sold-badge">{t('sold')}</span>}
      </Link>

      <div className="obra-card-body">
        <div className="obra-card-top">
          <form action={toggleFavorite}>
            <input type="hidden" name="pieceId" value={piece.id} />
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
              className={`heart-btn obra-card-fav${isFavorited ? ' active' : ''}`}
              type="submit"
              aria-label={t('favAria')}
            >
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path d="M12 21s-7.2-4.35-9.3-8.7C1 9 2.4 5.4 6 5.4c2 0 3.4 1.2 4.4 2.6 1-1.4 2.4-2.6 4.4-2.6 3.6 0 5 3.6 3.3 6.9C19.2 16.65 12 21 12 21z" />
              </svg>
              {favoriteCount > 0 && <span>{favoriteCount}</span>}
            </button>
          </form>
          {hasBids && (
            <span className="obra-card-bids">{t('bids', { count: bidCount })}</span>
          )}
        </div>

        <p className="obra-card-artist">{piece.artistName}</p>
        <Link href={`/obras/${piece.id}`} className="obra-card-title">{piece.title}</Link>
        {(piece.technique || piece.year) && (
          <p className="obra-card-meta">
            {[piece.technique, piece.year].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="obra-card-footer">
          <div className="obra-card-price-block">
            <p className="obra-card-label">{piece.sold ? t('labelSold') : hasBids ? t('labelBids') : t('labelMin')}</p>
            <p className="obra-card-price">
              ${Number(currentBid).toLocaleString('en-US')}
              <span className="obra-card-currency"> USD</span>
            </p>
          </div>
          <Link href={`/obras/${piece.id}`} className="obra-card-cta">
            {piece.sold ? t('ctaViewSold') : t('ctaView')} →
          </Link>
        </div>
      </div>
    </article>
  );
}
