// Fase global de MANCHA. Cambia NEXT_PUBLIC_FASE en las env vars para transicionar
// sin tocar código. Valores: 'pre-launch' | 'convocatoria' | 'temporada_activa'
export function getFase() {
  return process.env.NEXT_PUBLIC_FASE ?? 'pre-launch';
}

export function isPreLaunch() {
  return getFase() === 'pre-launch';
}

export function isConvocatoria() {
  return getFase() === 'convocatoria';
}

export function isTemporadaActiva() {
  return getFase() === 'temporada_activa';
}

// true cuando NO hay temporada activa (pre-launch o convocatoria)
export function isCatalogHidden() {
  return getFase() === 'pre-launch' || getFase() === 'convocatoria';
}
