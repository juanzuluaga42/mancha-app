// lib/provenance.js — Procedencia y estado de una obra (ciclo de vida MANCHA).
//
// Fase 1: todo se DERIVA del schema actual (sin columnas nuevas). Cuando lleguen
// The Canon y Available-by-Request "reales" (Fase 2), se añaden flags en DB y se
// extiende aquí, sin tocar las vistas.

// Código de temporada según su posición histórica: S01, S02, ...
export function seasonCode(ordinal) {
  return `S${String(ordinal).padStart(2, '0')}`;
}

// Número de acceso tipo museo: "S01 · 014". Misma dignidad para toda obra.
export function accessionNo(ordinal, index) {
  return `${seasonCode(ordinal)} · ${String(index).padStart(3, '0')}`;
}

// Una obra está "Collected" si fue adquirida (vendida/pagada). Es el rango de
// procedencia más alto: la validó un coleccionista.
export function isCollected(piece) {
  return piece?.sold === true || !!piece?.paid_at;
}

// Estado transaccional dentro del Index (temporada ya sellada):
//  - 'collected'            → adquirida.
//  - 'available_by_request' → no vendida en temporada sellada; fuera del piso
//                             abierto, adquirible por solicitud privada.
export function transactionStatus(piece) {
  return isCollected(piece) ? 'collected' : 'available_by_request';
}

// Nombre de temporada adaptado al idioma (la DB la guarda en español).
export function seasonName(name, locale) {
  if (locale === 'en' && /^temporada\b/i.test(name)) {
    return name.replace(/^temporada/i, 'Season');
  }
  return name;
}
