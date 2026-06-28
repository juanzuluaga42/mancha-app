// lib/provenance.js — Procedencia, estado y honores de una obra (ciclo de vida).
//
// Fase 2: el número de acceso se ALMACENA (pieces.accession) y se asigna al
// SELLAR la temporada, por lo que es inmutable. El resto del estado se deriva de
// columnas reales: sold/paid_at (Collected), in_canon (The Canon), withdrawn,
// y seasons.sealed_at / ends_at (temporada sellada).

// Código de temporada según su posición histórica: S01, S02, ...
export function seasonCode(ordinal) {
  return `S${String(ordinal).padStart(2, '0')}`;
}

// Número de acceso tipo museo: "S01 · 014".
export function accessionNo(ordinal, n) {
  return `${seasonCode(ordinal)} · ${String(n).padStart(3, '0')}`;
}

// Procedencia completa de una obra ya numerada: "MANCHA · S01 · 014".
export function provenanceLine(ordinal, n) {
  return `MANCHA · ${accessionNo(ordinal, n)}`;
}

// Una obra está "Collected" si fue adquirida (vendida/pagada). Rango de
// procedencia más alto: la validó un coleccionista.
export function isCollected(piece) {
  return piece?.sold === true || !!piece?.paid_at;
}

// ¿La obra entró al Canon de su temporada? (honor curatorial, aditivo).
export function isCanon(piece) {
  return piece?.in_canon === true;
}

// ¿La temporada está sellada? (cerrada en el tiempo o sellada explícitamente).
export function isSealed(season) {
  if (!season) return false;
  if (season.sealed_at) return true;
  return !!season.ends_at && new Date(season.ends_at).getTime() < Date.now();
}

// Estado transaccional de una obra en una temporada sellada:
//  - 'collected'            → adquirida (rango más alto).
//  - 'withdrawn'            → el artista la conservó; fuera de circulación.
//  - 'available_by_request' → no vendida; fuera del piso, adquirible por
//                             solicitud privada.
export function transactionStatus(piece) {
  if (isCollected(piece)) return 'collected';
  if (piece?.withdrawn) return 'withdrawn';
  return 'available_by_request';
}

// Nivel del artista (escalera de prestigio), derivado de su trayectoria.
// Con el modelo actual (una temporada por artista) llegamos hasta 'canon';
// 'returning'/'represented' requieren identidad entre temporadas (Fase futura).
export function artistTier({ collectedCount = 0, canonCount = 0 } = {}) {
  if (canonCount >= 1) return 'canon';
  if (collectedCount >= 1) return 'collected';
  return 'selected';
}

// Nombre de temporada adaptado al idioma (la DB la guarda en español).
export function seasonName(name, locale) {
  if (locale === 'en' && /^temporada\b/i.test(name)) {
    return name.replace(/^temporada/i, 'Season');
  }
  return name;
}
