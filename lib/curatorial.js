// ════════════════════════════════════════════════════════════════
// MANCHA · Curatorial Portal — núcleo de evaluación (F1 + F2)
// Los 10 criterios ponderados, el algoritmo del Curatorial Index,
// las decisiones y la medición de sesgo. La obra habla primero.
// ════════════════════════════════════════════════════════════════

// Los 10 criterios. El `weight` (fracción, suma = 1.00) refleja la
// filosofía de MANCHA: descubrir lo que el mundo aún no vio
// (originalidad), que dure (permanencia), con presencia e idea.
// La técnica es base, no el diferenciador ("voz, no perfección").
export const CRITERIA = [
  { key: 'originalidad',  n: 4,  label: 'Originalidad',                 weight: 0.15, desc: 'Identidad propia; evita sentirse derivativa.' },
  { key: 'permanencia',   n: 8,  label: 'Permanencia',                  weight: 0.13, desc: 'Conservaría su relevancia con el paso del tiempo.' },
  { key: 'fuerzaVisual',  n: 2,  label: 'Fuerza visual',                weight: 0.12, desc: 'Impacto y presencia de la obra.' },
  { key: 'profundidad',   n: 7,  label: 'Profundidad conceptual',       weight: 0.12, desc: 'Fuerza de la idea y capacidad de comunicarla.' },
  { key: 'lenguaje',      n: 5,  label: 'Lenguaje plástico',            weight: 0.10, desc: 'Color, textura, forma, materiales, contraste y luz.' },
  { key: 'tecnica',       n: 1,  label: 'Dominio técnico',              weight: 0.09, desc: 'Solidez de la ejecución de la técnica utilizada.' },
  { key: 'composicion',   n: 3,  label: 'Composición',                  weight: 0.09, desc: 'Equilibrio, ritmo y organización visual coherente.' },
  { key: 'coherencia',    n: 6,  label: 'Coherencia artística',         weight: 0.08, desc: 'Todos los elementos trabajan en una misma dirección.' },
  { key: 'valorColeccion',n: 9,  label: 'Valor para una colección',     weight: 0.07, desc: 'Aporte a una colección seria (sin considerar precio).' },
  { key: 'afinidad',      n: 10, label: 'Afinidad con la visión de MANCHA', weight: 0.05, desc: 'Representa el estándar internacional que MANCHA construye.' },
];

export const CRITERIA_KEYS = CRITERIA.map((c) => c.key);

export const CONFIDENCE = [
  { value: 'high',   label: 'Alta' },
  { value: 'medium', label: 'Media' },
  { value: 'low',    label: 'Baja' },
];

export const DECISIONS = [
  { value: 'recommend',       label: 'Recomendar',                    desc: 'La obra entra al estándar MANCHA sin reservas.' },
  { value: 'recommend_notes', label: 'Recomendar con observaciones',  desc: 'Entra, con matices registrados para el colegio.' },
  { value: 'second_review',   label: 'Solicitar segunda revisión',    desc: 'Pide otra mirada antes de concluir.' },
  { value: 'not_recommend',   label: 'No recomendar',                 desc: 'No alcanza el estándar — con su justificación.' },
];

export const BIAS_OPTIONS = [
  { value: 'none',        label: 'No cambia',                desc: 'La información del artista no modifica mi percepción inicial.' },
  { value: 'slight',      label: 'Cambia ligeramente',       desc: 'Hay un matiz, pero el juicio se sostiene.' },
  { value: 'significant', label: 'Cambia significativamente',desc: 'La percepción se mueve de forma notable.' },
];

export function decisionLabel(value) {
  return DECISIONS.find((d) => d.value === value)?.label ?? value;
}
export function biasLabel(value) {
  return BIAS_OPTIONS.find((b) => b.value === value)?.label ?? value;
}
export function confidenceLabel(value) {
  return CONFIDENCE.find((c) => c.value === value)?.label ?? value;
}

// ── El algoritmo ────────────────────────────────────────────────
// Curatorial Index (0–100) = Σ ( score_i × weight_i ) × 10
// score 1–10, weight fracción. Informa, nunca decide.
export function computeCuratorialIndex(scores) {
  let sum = 0;
  for (const c of CRITERIA) {
    const raw = Number(scores?.[c.key]?.score);
    if (!Number.isFinite(raw)) return null; // incompleto
    sum += Math.min(10, Math.max(1, raw)) * c.weight;
  }
  return Math.round(sum * 10 * 10) / 10; // un decimal
}

// Perfil de confianza: no altera el índice, contextualiza.
// "alta" si ningún criterio es baja; "baja" si hay 3+ criterios bajos.
export function confidenceProfile(scores) {
  const lows = CRITERIA.filter((c) => scores?.[c.key]?.confidence === 'low').length;
  if (lows >= 3) return 'low';
  if (lows >= 1) return 'medium';
  return 'high';
}

// MANCHA Index de una obra = media de los Curatorial Index de sus curadores.
export function manchaIndex(indices) {
  const vals = indices.filter((v) => Number.isFinite(v));
  if (!vals.length) return null;
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
}

// Valida un objeto de scores completo y bien formado antes de sellar.
export function validateScores(scores) {
  for (const c of CRITERIA) {
    const e = scores?.[c.key];
    const s = Number(e?.score);
    if (!Number.isInteger(s) || s < 1 || s > 10) {
      return `Falta puntuar "${c.label}" (1–10).`;
    }
    if (!CONFIDENCE.some((x) => x.value === e?.confidence)) {
      return `Falta el nivel de confianza en "${c.label}".`;
    }
  }
  return null;
}
