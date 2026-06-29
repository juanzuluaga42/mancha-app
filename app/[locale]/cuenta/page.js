import { redirect } from 'next/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { createClient } from '@/utils/supabase/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Splat from '@/components/Splat';
import { createArtistProfile, addPiece, deletePiece } from './actions';
import SubmitButton from '@/components/SubmitButton';
import { cap } from '@/lib/utils';
import { mediumOptions } from '@/lib/mediums';

export async function generateMetadata() {
  const t = await getTranslations('meta');
  return { title: t('cuentaTitle') };
}

export default async function CuentaPage({ searchParams }) {
  const params = await searchParams;
  const t = await getTranslations('account');
  const locale = await getLocale();
  const numLocale = locale === 'en' ? 'en-US' : 'es-AR';
  const mediums = mediumOptions(locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/cuenta');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  const isArtist = profile?.role === 'artist';
  const firstName = profile?.full_name?.split(' ')[0] || null;

  return (
    <>
      <Nav />
      {/* Sugerencias de técnica/categoría compartidas por los campos del perfil y de obra */}
      <datalist id="medium-options">
        {mediums.map((m) => <option key={m} value={m} />)}
      </datalist>

      {/* ── HEADER ───────────────────────────────────────── */}
      <header className="cuenta-header">
        <Splat width="180px" height="155px" top="-50px" right="-40px" color="yellow" rotate={-12} radius="r2" />
        <Splat width="100px" height="88px" bottom="-30px" left="-25px" color="red" rotate={14} radius="r4" />
        <div className="wrap">
          <p className="cuenta-eyebrow">{isArtist ? t('eyebrowArtist') : t('eyebrowCollector')}</p>
          <h1 className="cuenta-title">
            {firstName ? <>{t('hello')} <em>{cap(firstName)}.</em></> : <>{t('helloAgainPre')} <em>{t('helloAgainEm')}</em></>}
          </h1>
          <p className="cuenta-email">{user.email}</p>
        </div>
      </header>

      {/* ── DASHBOARD ────────────────────────────────────── */}
      <div className="cuenta-body">
        <div className="wrap cuenta-wrap">
          {params?.error && (
            <div className="cuenta-alert">
              <span>⚠</span> {params.error}
            </div>
          )}

          {isArtist ? (
            <ArtistDashboard supabase={supabase} userId={user.id} t={t} numLocale={numLocale} />
          ) : (
            <BuyerDashboard supabase={supabase} userId={user.id} t={t} numLocale={numLocale} />
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

async function ArtistDashboard({ supabase, userId, t, numLocale }) {
  const { data: artist } = await supabase.from('artists').select('*').eq('profile_id', userId).maybeSingle();

  if (!artist) {
    return (
      <div className="cuenta-section">
        <div className="cuenta-section-head">
          <p className="cuenta-section-label">{t('completeProfileLabel')}</p>
          <h2 className="cuenta-section-title">{t('completeProfileTitle')}</h2>
          <p className="cuenta-section-sub">{t('completeProfileSub')}</p>
        </div>
        <div className="cuenta-card">
          <form action={createArtistProfile} className="cuenta-form">
            <div className="cuenta-field-row">
              <div className="field">
                <label htmlFor="display_name">{t('artistName')}</label>
                <input id="display_name" name="display_name" type="text" required />
              </div>
              <div className="field">
                <label htmlFor="medium">{t('technique')}</label>
                <input id="medium" name="medium" type="text" list="medium-options" autoComplete="off" placeholder={t('techniquePh')} required />
              </div>
            </div>
            <div className="field">
              <label htmlFor="location">{t('location')}</label>
              <input id="location" name="location" type="text" placeholder={t('locationPh')} />
            </div>
            <div className="field">
              <label htmlFor="bio">{t('bioShort')}</label>
              <textarea id="bio" name="bio" rows={4} placeholder={t('bioPh')} required />
            </div>
            <SubmitButton pendingText={t('savingProfile')}>{t('saveProfile')}</SubmitButton>
          </form>
        </div>
      </div>
    );
  }

  const { data: pieces } = await supabase
    .from('pieces')
    .select('*, bids(amount), favorites(buyer_id)')
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: true });

  const myPieces = pieces ?? [];

  // Postulación rechazada: estado final de la temporada, sin subida de obra.
  if (artist.status === 'rejected') {
    return (
      <div className="cuenta-section">
        <div className="cuenta-status-card cuenta-status-rejected">
          <div className="cuenta-status-icon">—</div>
          <div>
            <p className="cuenta-status-label">{t('rejectedLabel')}</p>
            <h2 className="cuenta-status-name">{artist.display_name}</h2>
            <p className="cuenta-status-text">{t('rejectedText')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Banner de estado según selección + obras cargadas.
  const statusBanner = artist.status === 'approved' ? (
    <div className="cuenta-status-banner cuenta-status-banner-approved">
      <b>{t('bannerApprovedTitle')}</b>
      <span>{t('bannerApprovedText')}</span>
    </div>
  ) : myPieces.length === 0 ? (
    <div className="cuenta-status-banner cuenta-status-banner-warn">
      <b>{t('bannerWarnTitle')}</b>
      <span>{t('bannerWarnText')}</span>
    </div>
  ) : (
    <div className="cuenta-status-banner cuenta-status-banner-review">
      <b>{t('bannerReviewTitle')}</b>
      <span>{t('bannerReviewText', { count: myPieces.length })}</span>
    </div>
  );
  const totalBids = myPieces.reduce((sum, p) => sum + (p.bids?.length ?? 0), 0);
  const totalFollowers = myPieces.reduce((sum, p) => sum + (p.favorites?.length ?? 0), 0);

  return (
    <>
      {statusBanner}

      {/* Stats bar */}
      <div className="cuenta-stats-bar">
        <div className="cuenta-stat">
          <b>{myPieces.length}<span>/3</span></b>
          <span>{t('statPiecesActive', { count: myPieces.length })}</span>
        </div>
        <div className="cuenta-stat-sep" />
        <div className="cuenta-stat">
          <b>{totalBids}</b>
          <span>{t('statBidsReceived', { count: totalBids })}</span>
        </div>
        <div className="cuenta-stat-sep" />
        <div className="cuenta-stat">
          <b>{totalFollowers}</b>
          <span>{t('statFollowers')}</span>
        </div>
      </div>

      {/* Perfil */}
      <div className="cuenta-section">
        <div className="cuenta-section-head">
          <p className="cuenta-section-label">{t('completeProfileLabel')}</p>
          <h2 className="cuenta-section-title">{artist.display_name}</h2>
        </div>
        <div className="cuenta-card cuenta-profile-card">
          <div className="cuenta-profile-row">
            <span className="cuenta-profile-key">{t('profileTechnique')}</span>
            <span className="cuenta-profile-val">{artist.medium || '—'}</span>
          </div>
          {artist.location && (
            <div className="cuenta-profile-row">
              <span className="cuenta-profile-key">{t('profileLocation')}</span>
              <span className="cuenta-profile-val">{artist.location}</span>
            </div>
          )}
          <div className="cuenta-profile-row cuenta-profile-bio">
            <span className="cuenta-profile-key">{t('profileBio')}</span>
            <span className="cuenta-profile-val cuenta-profile-bio-text">{artist.bio}</span>
          </div>
          <div className="cuenta-profile-row">
            <span className="cuenta-profile-key">{t('profilePage')}</span>
            <Link href={`/artistas/${artist.id}`} className="cuenta-profile-link">{t('viewPublic')}</Link>
          </div>
        </div>
      </div>

      {/* Piezas */}
      <div className="cuenta-section">
        <div className="cuenta-section-head">
          <p className="cuenta-section-label">{t('seasonLabel')}</p>
          <h2 className="cuenta-section-title">{t('yourPiecesTitle', { count: myPieces.length })}</h2>
        </div>

        {myPieces.length === 0 ? (
          <div className="cuenta-empty">
            <p>{t('noPieces')}</p>
          </div>
        ) : (
          <div className="cuenta-pieces-list">
            {myPieces.map((p) => {
              const amounts = (p.bids ?? []).map((b) => Number(b.amount));
              const currentBid = amounts.length ? Math.max(...amounts) : Number(p.min_bid);
              return (
                <div className="cuenta-piece-item" key={p.id}>
                  <div className="cuenta-piece-info">
                    <p className="cuenta-piece-title">{p.title}</p>
                    <p className="cuenta-piece-meta">{p.technique}{p.dimensions ? ` · ${p.dimensions}` : ''}</p>
                  </div>
                  <div className="cuenta-piece-right">
                    <div className="cuenta-piece-bid">
                      <p className="cuenta-piece-amount">${Number(currentBid).toLocaleString(numLocale)} <span>USD</span></p>
                      <p className="cuenta-piece-meta">{amounts.length === 0 ? t('noBidsYet') : t('bidsCount', { count: amounts.length })}</p>
                    </div>
                    {amounts.length === 0 && (
                      <form action={deletePiece}>
                        <input type="hidden" name="pieceId" value={p.id} />
                        <button type="submit" className="cuenta-delete-btn">{t('delete')}</button>
                      </form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agregar pieza */}
      {myPieces.length < 3 && (
        <div className="cuenta-section">
          <div className="cuenta-section-head">
            <p className="cuenta-section-label">{t('uploadLabel')}</p>
            <h2 className="cuenta-section-title">{t('addPieceTitle')}</h2>
            <p className="cuenta-section-sub">{t('addPieceSub')}</p>
          </div>
          <div className="cuenta-card">
            <form action={addPiece} className="cuenta-form">
              <div className="cuenta-field-row">
                <div className="field">
                  <label htmlFor="title">{t('fieldTitle')}</label>
                  <input id="title" name="title" type="text" required />
                </div>
                <div className="field">
                  <label htmlFor="year">{t('fieldYear')}</label>
                  <input id="year" name="year" type="number" placeholder="2024" />
                </div>
              </div>
              <div className="cuenta-field-row">
                <div className="field">
                  <label htmlFor="technique">{t('technique')}</label>
                  <input id="technique" name="technique" type="text" required list="medium-options" autoComplete="off" placeholder={t('techniquePh')} />
                </div>
                <div className="field">
                  <label htmlFor="dimensions">{t('fieldDimensions')}</label>
                  <input id="dimensions" name="dimensions" type="text" placeholder={t('dimensionsPh')} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="description">{t('fieldDescription')}</label>
                <textarea id="description" name="description" rows="3" placeholder={t('descriptionPh')} />
              </div>
              <div className="field">
                <label htmlFor="min_bid">{t('fieldMinBid')}</label>
                <input id="min_bid" name="min_bid" type="number" min="1" required />
              </div>
              <div className="field">
                <label htmlFor="image_file">{t('fieldPhoto')}</label>
                <div className="cuenta-photo-tips">
                  <p>{t('tipsHead')}</p>
                  <ul>
                    <li>{t('tip1')}</li>
                    <li>{t('tip2')}</li>
                    <li>{t('tip3')}</li>
                    <li>{t('tip4')}</li>
                  </ul>
                </div>
                <input id="image_file" name="image_file" type="file" accept="image/*" />
                <p className="cuenta-field-hint">{t('maxSize')}</p>
              </div>
              <SubmitButton pendingText={t('uploadingPiece')}>{t('uploadBtn')}</SubmitButton>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

async function BuyerDashboard({ supabase, userId, t, numLocale }) {
  const { data: bids } = await supabase
    .from('bids')
    .select('*, pieces(id, title, min_bid, artists(display_name))')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  const { data: favorites } = await supabase
    .from('favorites')
    .select('*, pieces(id, title, min_bid, artists(display_name))')
    .eq('buyer_id', userId)
    .order('created_at', { ascending: false });

  const myBids = bids ?? [];
  const myFavs = favorites ?? [];

  return (
    <>
      {/* Stats bar */}
      <div className="cuenta-stats-bar">
        <div className="cuenta-stat">
          <b>{myBids.length}</b>
          <span>{t('statBidsRegistered', { count: myBids.length })}</span>
        </div>
        <div className="cuenta-stat-sep" />
        <div className="cuenta-stat">
          <b>{myFavs.length}</b>
          <span>{t('statSaved', { count: myFavs.length })}</span>
        </div>
      </div>

      {/* Pujas */}
      <div className="cuenta-section">
        <div className="cuenta-section-head">
          <p className="cuenta-section-label">{t('yourBidsLabel')}</p>
          <h2 className="cuenta-section-title">{t('yourBidsTitle')}</h2>
        </div>
        {myBids.length === 0 ? (
          <div className="cuenta-empty">
            <p>{t('noBids')}</p>
            <Link href="/obras" className="cuenta-empty-cta">{t('viewCatalogue')}</Link>
          </div>
        ) : (
          <div className="cuenta-pieces-list">
            {myBids.map((b) => (
              <Link href={`/obras/${b.pieces?.id}`} className="cuenta-piece-item cuenta-piece-link" key={b.id}>
                <div className="cuenta-piece-info">
                  <p className="cuenta-piece-title">{b.pieces?.title}</p>
                  <p className="cuenta-piece-meta">{b.pieces?.artists?.display_name}</p>
                </div>
                <div className="cuenta-piece-right">
                  <div className="cuenta-piece-bid">
                    <p className="cuenta-piece-amount">${Number(b.amount).toLocaleString(numLocale)} <span>USD</span></p>
                    <p className="cuenta-piece-meta">{t('yourBid')}</p>
                  </div>
                  <span className="cuenta-piece-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Favoritos */}
      <div className="cuenta-section">
        <div className="cuenta-section-head">
          <p className="cuenta-section-label">{t('savedLabel')}</p>
          <h2 className="cuenta-section-title">{t('savedTitle')}</h2>
        </div>
        {myFavs.length === 0 ? (
          <div className="cuenta-empty">
            <p>{t('noFavs')}</p>
            <Link href="/obras" className="cuenta-empty-cta">{t('exploreCatalogue')}</Link>
          </div>
        ) : (
          <div className="cuenta-pieces-list">
            {myFavs.map((f) => (
              <Link href={`/obras/${f.pieces?.id}`} className="cuenta-piece-item cuenta-piece-link" key={f.id}>
                <div className="cuenta-piece-info">
                  <p className="cuenta-piece-title">{f.pieces?.title}</p>
                  <p className="cuenta-piece-meta">{f.pieces?.artists?.display_name}</p>
                </div>
                <div className="cuenta-piece-right">
                  <div className="cuenta-piece-bid">
                    <p className="cuenta-piece-amount">${Number(f.pieces?.min_bid).toLocaleString(numLocale)} <span>USD</span></p>
                    <p className="cuenta-piece-meta">{t('minBidLabel')}</p>
                  </div>
                  <span className="cuenta-piece-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
