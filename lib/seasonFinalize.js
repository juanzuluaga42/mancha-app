// ════════════════════════════════════════════════════════════════
// MANCHA · Finalizar Temporada — ARQUITECTURA PREPARADA (no implementada)
//
// Hoy el cierre de una temporada lo hace `sealSeason` en
// app/[locale]/admin/actions.js: asigna números de acceso inmutables a las
// obras (por orden de creación), marca `seasons.sealed_at` y `is_current=false`,
// y con eso las obras entran al Índice (registro permanente). Ver lib/provenance.js.
//
// "Finalizar Temporada" es el SUPERSET institucional de ese cierre. Esta función
// queda como esqueleto documentado y seguro (idempotente por diseño). NO está
// cableada a ningún botón todavía: se activa cuando se decida implementarla.
//
// Diseño / garantías exigidas:
//   1. Cierre oficial      → seasons.sealed_at + is_current=false (una sola vez).
//   2. Mover al archivo    → asignar accession inmutable a cada obra de la
//                            temporada y dejarlas en el Índice histórico.
//   3. Conservar TODO      → no se borra nada: artistas, obras, pujas, pagos,
//                            evaluaciones del consejo, decisiones y relaciones
//                            permanecen intactos y enlazados a la temporada.
//   4. Sin duplicados ni   → cada paso es idempotente (re-ejecutar no cambia el
//      pérdida de datos       resultado). Se usa una marca de finalización y
//                            `on conflict do nothing` / updates condicionados.
//   5. Métricas congeladas → al finalizar se calcula y guarda un snapshot de
//                            métricas (obras, vendidas, recaudación, artistas,
//                            curadores, MANCHA Index medio) para no recomputar
//                            sobre datos que podrían cambiar.
//
// Integración con el sistema curatorial:
//   - Cerrar la ronda de revisión asociada (cur_rounds.status='closed') para
//     que las evaluaciones queden reveladas entre curadores y selladas.
//   - Vincular cada obra del Índice con su dossier curatorial (MANCHA Index,
//     decisión colegiada) cuando exista la relación cur_works↔pieces.
//
// Pasos sugeridos (cada uno como función pequeña, testeable e idempotente):
//   step1_lockSeason(seasonId)        → sealed_at/is_current (si no estaba).
//   step2_assignAccessions(seasonId)  → accession por orden, solo a las que no lo tienen.
//   step3_snapshotMetrics(seasonId)   → inserta seasons_snapshot (una vez).
//   step4_closeReviewRound(seasonId)  → cur_rounds.status='closed' de la ronda.
//   step5_audit(seasonId, actor)      → bitácora append-only del cierre.
//
// Esquema futuro (cuando se implemente):
//   alter table public.seasons add column if not exists finalized_at timestamptz;
//   create table if not exists public.seasons_snapshot (
//     season_id uuid primary key references public.seasons(id),
//     pieces int, sold int, revenue_usd numeric, artists int,
//     curators int, mancha_index_avg numeric, created_at timestamptz default now()
//   );
//
// Para activar: implementar los step* con el service-role client, envolver en una
// guarda de admin, y cablear un botón "Finalizar temporada" en /admin (con
// confirmación). Idealmente ejecutar dentro de una transacción/RPC de Postgres
// para atomicidad. Mientras tanto, `sealSeason` cubre el cierre básico → Índice.
// ════════════════════════════════════════════════════════════════

export const SEASON_FINALIZE_READY = false;

// Punto de entrada preparado. Lanza a propósito hasta que se implemente, para
// evitar usos accidentales. La firma y el contrato quedan fijados.
export async function finalizeSeason(/* { seasonId, actorId, admin } */) {
  throw new Error('finalizeSeason: arquitectura preparada, lógica aún no implementada (ver lib/seasonFinalize.js).');
}
