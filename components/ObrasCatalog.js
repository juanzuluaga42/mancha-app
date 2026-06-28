'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import PieceCard from '@/components/PieceCard';

export default function ObrasCatalog({ pieces }) {
  const t = useTranslations('catalog');
  const [search, setSearch] = useState('');
  const [technique, setTechnique] = useState('');
  const [sort, setSort] = useState('recientes');

  const techniques = useMemo(() => {
    const set = new Set(pieces.map((p) => p.technique).filter(Boolean));
    return Array.from(set).sort();
  }, [pieces]);

  const filtered = useMemo(() => {
    let list = pieces.filter((p) => {
      const text = `${p.title} ${p.artistName}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesTechnique = !technique || p.technique === technique;
      return matchesSearch && matchesTechnique;
    });

    if (sort === 'precio-asc') list = [...list].sort((a, b) => a.currentBid - b.currentBid);
    if (sort === 'precio-desc') list = [...list].sort((a, b) => b.currentBid - a.currentBid);
    if (sort === 'recientes') list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return list;
  }, [pieces, search, technique, sort]);

  if (pieces.length === 0) {
    return (
      <div className="catalog-empty">
        <p className="eyebrow">{t('emptyKicker')}</p>
        <h2>{t('emptyTitle')}</h2>
        <p className="section-note">{t('emptyNote')}</p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 28 }}>
          <Link href="/artistas" className="btn-primary">{t('viewArtists')}</Link>
          <Link href="/postular" className="btn-secondary">{t('applyWork')}</Link>
        </div>
      </div>
    );
  }

  const hasFilters = search || technique || sort !== 'recientes';

  return (
    <div>
      {/* ── Filtros ── */}
      <div className="obras-filters">
        <div className="obras-search-wrap">
          <svg className="obras-search-icon" viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <line x1="13" y1="13" x2="17" y2="17" />
          </svg>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="obras-search"
          />
          {search && (
            <button
              type="button"
              className="obras-search-clear"
              onClick={() => setSearch('')}
              aria-label={t('clearSearch')}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </button>
          )}
        </div>

        <div className="obras-select-group">
          <div className="obras-select-wrap">
            <select value={technique} onChange={(e) => setTechnique(e.target.value)} className="obras-select" aria-label={t('filterTechnique')}>
              <option value="">{t('allTechniques')}</option>
              {techniques.map((tech) => <option key={tech} value={tech}>{tech}</option>)}
            </select>
            <svg className="obras-select-chevron" viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2.5 4.5 6 8 9.5 4.5" />
            </svg>
          </div>
          <div className="obras-select-wrap">
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="obras-select" aria-label={t('sortLabel')}>
              <option value="recientes">{t('sortRecent')}</option>
              <option value="precio-asc">{t('sortPriceAsc')}</option>
              <option value="precio-desc">{t('sortPriceDesc')}</option>
            </select>
            <svg className="obras-select-chevron" viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2.5 4.5 6 8 9.5 4.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Contador ── */}
      <div className="obras-count-row">
        <p className="obras-count">
          {filtered.length === pieces.length
            ? t('countAll', { count: filtered.length })
            : t('countFiltered', { shown: filtered.length, total: pieces.length })}
        </p>
        {hasFilters && (
          <button
            type="button"
            className="obras-reset"
            onClick={() => { setSearch(''); setTechnique(''); setSort('recientes'); }}
          >
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* ── Resultados ── */}
      {filtered.length === 0 ? (
        <div className="obras-no-results">
          <p>{t('noResults')}</p>
          <button
            className="obras-clear-btn"
            onClick={() => { setSearch(''); setTechnique(''); setSort('recientes'); }}
          >
            {t('clearFiltersArrow')}
          </button>
        </div>
      ) : (
        <div className="obras-grid">
          {filtered.map((piece, i) => (
            <PieceCard
              key={piece.id}
              piece={piece}
              index={i}
              isFavorited={piece.isFavorited}
              favoriteCount={piece.favoriteCount}
              currentBid={piece.currentBid}
              hasBids={piece.hasBids}
              redirectTo="/obras"
            />
          ))}
        </div>
      )}
    </div>
  );
}
