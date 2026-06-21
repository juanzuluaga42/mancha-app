import { placeBid, toggleFavorite } from '@/app/actions';

const GRADIENTS = ['g1','g2','g3','g4','g5','g6','g7','g8','g9','g10','g11','g12'];

export default function PieceCard({ piece, index, isFavorited, favoriteCount, currentBid, hasBids, redirectTo = '/' }) {
  const gradientClass = GRADIENTS[index % GRADIENTS.length];

  return (
    <div className="piece">
      <div className="piece-art">
        {piece.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={piece.image_url} alt={piece.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className={gradientClass} style={{ position: 'absolute', inset: 0 }} />
        )}
      </div>
      <div>
        <p className="piece-title">{piece.title}</p>
        <p className="piece-data">
          {piece.year ? `${piece.year} · ` : ''}{piece.technique}<br />{piece.dimensions}
        </p>
      </div>
      <div className="piece-side">
        <form action={toggleFavorite}>
          <input type="hidden" name="pieceId" value={piece.id} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button className={`heart-btn${isFavorited ? ' active' : ''}`} type="submit" aria-pressed={isFavorited} aria-label="Marcar como favorito">
            <svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 21s-7.2-4.35-9.3-8.7C1 9 2.4 5.4 6 5.4c2 0 3.4 1.2 4.4 2.6 1-1.4 2.4-2.6 4.4-2.6 3.6 0 5 3.6 3.3 6.9C19.2 16.65 12 21 12 21z" /></svg>
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
    </div>
  );
}
