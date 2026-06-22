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
        <p className="eyebrow">Temporada 01 — Piezas próximamente</p>
        <h2>El catálogo se revela cuando los artistas son confirmados.</h2>
        <p className="section-note">
          Cuando los artistas seleccionados carguen sus obras, las encontrarás aquí con todos los detalles para pujar. La selección está en curso — puedes postular tu trabajo o sumarte a la lista de espera para que te avisemos.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 24 }}>
          <Link href="/postular" className="btn-primary">Postular tu trabajo →</Link>
          <Link href="/artistas" className="btn-secondary">Ver artistas →</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="catalog-filters">
        <input
          type="text"
          placeholder="Buscar por obra o artista…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="catalog-search"
        />
        <select value={technique} onChange={(e) => setTechnique(e.target.value)} className="catalog-select">
          <option value="">Todas las técnicas</option>
          {techniques.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="catalog-select">
          <option value="recientes">Más recientes</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
        </select>
      </div>

      <p className="catalog-count">{filtered.length} {filtered.length === 1 ? 'pieza' : 'piezas'}</p>

      {filtered.length === 0 ? (
        <div className="empty-state">Ninguna pieza coincide con esa búsqueda.</div>
      ) : (
        <div className="pieces">
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
