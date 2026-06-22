'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import PieceCard from '@/components/PieceCard';

export default function ObrasCatalog({ pieces }) {
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
        <p className="eyebrow">Piezas próximamente</p>
        <h2>El catálogo se revela cuando los artistas son confirmados.</h2>
        <p className="section-note">
          La selección está en curso. Cuando los artistas carguen sus obras, las encontrarás aquí con todos los detalles para pujar.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 28 }}>
          <Link href="/artistas" className="btn-primary">Ver artistas →</Link>
          <Link href="/postular" className="btn-secondary">Postular tu trabajo →</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Filtros ── */}
      <div className="obras-filters">
        <div className="obras-search-wrap">
          <svg className="obras-search-icon" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <line x1="13" y1="13" x2="17" y2="17" />
          </svg>
          <input
            type="text"
            placeholder="Busca por obra o artista…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="obras-search"
          />
        </div>
        <select value={technique} onChange={(e) => setTechnique(e.target.value)} className="obras-select">
          <option value="">Todas las técnicas</option>
          {techniques.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="obras-select">
          <option value="recientes">Más recientes</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
        </select>
      </div>

      {/* ── Contador ── */}
      <p className="obras-count">
        {filtered.length === pieces.length
          ? `${filtered.length} ${filtered.length === 1 ? 'pieza' : 'piezas'}`
          : `${filtered.length} de ${pieces.length} ${pieces.length === 1 ? 'pieza' : 'piezas'}`}
      </p>

      {/* ── Resultados ── */}
      {filtered.length === 0 ? (
        <div className="obras-no-results">
          <p>Ninguna pieza coincide con esa búsqueda.</p>
          <button
            className="obras-clear-btn"
            onClick={() => { setSearch(''); setTechnique(''); }}
          >
            Limpiar filtros →
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
