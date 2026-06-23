// Fase global de MANCHA. Cambia NEXT_PUBLIC_FASE en las env vars para transicionar
// sin tocar código. Valores: 'convocatoria' | 'seleccion' | 'temporada_activa'
export function getFase() {
  return process.env.NEXT_PUBLIC_FASE ?? 'convocatoria';
}

export function isConvocatoria() {
  return getFase() === 'convocatoria';
}

export function isTemporadaActiva() {
  return getFase() === 'temporada_activa';
}
