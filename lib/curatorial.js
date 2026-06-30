// ════════════════════════════════════════════════════════════════
// MANCHA · Curatorial Portal — núcleo de evaluación (F1 + F2)
// Los 10 criterios ponderados, el algoritmo del Curatorial Index,
// las decisiones y la medición de sesgo. La obra habla primero.
// Vocabulario BILINGÜE: `label`/`desc` = ES (default), `labelEn`/`descEn` = EN.
// ════════════════════════════════════════════════════════════════

const isEn = (locale) => locale === 'en';
// Accesores genéricos por idioma sobre un item con campos *En opcionales.
export function optLabel(item, locale) { return (isEn(locale) && item?.labelEn) || item?.label; }
export function optDesc(item, locale) { return (isEn(locale) && item?.descEn) || item?.desc; }

// Los 10 criterios. El `weight` (fracción, suma = 1.00) refleja la filosofía
// de MANCHA: descubrir (originalidad), que dure (permanencia), con presencia e
// idea. La técnica es base, no el diferenciador ("voz, no perfección").
export const CRITERIA = [
  { key: 'originalidad',  n: 4,  weight: 0.15, label: 'Originalidad',                 labelEn: 'Originality',          desc: 'Identidad propia; evita sentirse derivativa.',                  descEn: 'A voice of its own; avoids feeling derivative.' },
  { key: 'permanencia',   n: 8,  weight: 0.13, label: 'Permanencia',                  labelEn: 'Permanence',           desc: 'Conservaría su relevancia con el paso del tiempo.',             descEn: 'Would keep its relevance over time.' },
  { key: 'fuerzaVisual',  n: 2,  weight: 0.12, label: 'Fuerza visual',                labelEn: 'Visual strength',      desc: 'Impacto y presencia de la obra.',                               descEn: 'Impact and presence of the work.' },
  { key: 'profundidad',   n: 7,  weight: 0.12, label: 'Profundidad conceptual',       labelEn: 'Conceptual depth',     desc: 'Fuerza de la idea y capacidad de comunicarla.',                 descEn: 'Strength of the idea and ability to convey it.' },
  { key: 'lenguaje',      n: 5,  weight: 0.10, label: 'Lenguaje plástico',            labelEn: 'Plastic language',     desc: 'Color, textura, forma, materiales, contraste y luz.',           descEn: 'Color, texture, form, materials, contrast and light.' },
  { key: 'tecnica',       n: 1,  weight: 0.09, label: 'Dominio técnico',              labelEn: 'Technical command',    desc: 'Solidez de la ejecución de la técnica utilizada.',              descEn: 'Soundness of execution in the chosen medium.' },
  { key: 'composicion',   n: 3,  weight: 0.09, label: 'Composición',                  labelEn: 'Composition',          desc: 'Equilibrio, ritmo y organización visual coherente.',            descEn: 'Balance, rhythm and coherent visual organization.' },
  { key: 'coherencia',    n: 6,  weight: 0.08, label: 'Coherencia artística',         labelEn: 'Artistic coherence',   desc: 'Todos los elementos trabajan en una misma dirección.',          descEn: 'Every element pulls in the same direction.' },
  { key: 'valorColeccion',n: 9,  weight: 0.07, label: 'Valor para una colección',     labelEn: 'Value to a collection',desc: 'Aporte a una colección seria (sin considerar precio).',         descEn: 'Contribution to a serious collection (price aside).' },
  { key: 'afinidad',      n: 10, weight: 0.05, label: 'Afinidad con la visión de MANCHA', labelEn: 'Affinity with MANCHA’s vision', desc: 'Representa el estándar internacional que MANCHA construye.', descEn: 'Embodies the international standard MANCHA is building.' },
];
export const CRITERIA_KEYS = CRITERIA.map((c) => c.key);
export function critByKey(key) { return CRITERIA.find((c) => c.key === key); }

export const CONFIDENCE = [
  { value: 'high',   label: 'Alta',  labelEn: 'High' },
  { value: 'medium', label: 'Media', labelEn: 'Medium' },
  { value: 'low',    label: 'Baja',  labelEn: 'Low' },
];

export const DECISIONS = [
  { value: 'recommend',       label: 'Recomendar',                   labelEn: 'Recommend',                desc: 'La obra entra al estándar MANCHA sin reservas.',     descEn: 'The work enters the MANCHA standard without reservations.' },
  { value: 'recommend_notes', label: 'Recomendar con observaciones', labelEn: 'Recommend with notes',     desc: 'Entra, con matices registrados para el colegio.',    descEn: 'It enters, with nuances recorded for the council.' },
  { value: 'second_review',   label: 'Solicitar segunda revisión',   labelEn: 'Request a second review',  desc: 'Pide otra mirada antes de concluir.',                descEn: 'Asks for another look before concluding.' },
  { value: 'not_recommend',   label: 'No recomendar',                labelEn: 'Do not recommend',         desc: 'No alcanza el estándar — con su justificación.',     descEn: 'Falls short of the standard — with justification.' },
];

export const BIAS_OPTIONS = [
  { value: 'none',        label: 'No cambia',                 labelEn: 'It doesn’t change',         desc: 'La información del artista no modifica mi percepción inicial.', descEn: 'The artist’s information doesn’t change my initial perception.' },
  { value: 'slight',      label: 'Cambia ligeramente',        labelEn: 'It changes slightly',       desc: 'Hay un matiz, pero el juicio se sostiene.',                    descEn: 'There’s a nuance, but the judgment holds.' },
  { value: 'significant', label: 'Cambia significativamente', labelEn: 'It changes significantly',   desc: 'La percepción se mueve de forma notable.',                    descEn: 'The perception shifts noticeably.' },
];

export function decisionLabel(value, locale) { return optLabel(DECISIONS.find((d) => d.value === value), locale) ?? value; }
export function biasLabel(value, locale) { return optLabel(BIAS_OPTIONS.find((b) => b.value === value), locale) ?? value; }
export function confidenceLabel(value, locale) { return optLabel(CONFIDENCE.find((c) => c.value === value), locale) ?? value; }

// ── El algoritmo ────────────────────────────────────────────────
// Curatorial Index (0–100) = Σ ( score_i × weight_i ) × 10
export function computeCuratorialIndex(scores) {
  let sum = 0;
  for (const c of CRITERIA) {
    const raw = Number(scores?.[c.key]?.score);
    if (!Number.isFinite(raw)) return null;
    sum += Math.min(10, Math.max(1, raw)) * c.weight;
  }
  return Math.round(sum * 10 * 10) / 10;
}

export function confidenceProfile(scores) {
  const lows = CRITERIA.filter((c) => scores?.[c.key]?.confidence === 'low').length;
  if (lows >= 3) return 'low';
  if (lows >= 1) return 'medium';
  return 'high';
}

export function manchaIndex(indices) {
  const vals = indices.filter((v) => Number.isFinite(v));
  if (!vals.length) return null;
  return Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10;
}

// ── F3 · Decisión colegiada ─────────────────────────────────────
export const OUTCOMES = [
  { value: 'selected',     label: 'Seleccionada',    labelEn: 'Selected',     desc: 'Entra al estándar y a la temporada.', descEn: 'Enters the standard and the season.' },
  { value: 'not_selected', label: 'No seleccionada', labelEn: 'Not selected', desc: 'No ingresa esta temporada.',          descEn: 'Doesn’t enter this season.' },
];
export function outcomeLabel(value, locale) { return optLabel(OUTCOMES.find((o) => o.value === value), locale) ?? value; }

function decisionDir(d) {
  if (d === 'recommend' || d === 'recommend_notes') return 'pos';
  if (d === 'not_recommend') return 'neg';
  return 'neu';
}

const CONSENSUS_LABELS = {
  es: { high: 'Consenso alto', medium: 'Consenso parcial', divergent: 'Divergencia', insufficient: 'Faltan evaluaciones' },
  en: { high: 'High consensus', medium: 'Partial consensus', divergent: 'Divergence', insufficient: 'Not enough evaluations' },
};
export function consensusLabel(level, locale) { return (CONSENSUS_LABELS[isEn(locale) ? 'en' : 'es'])[level] ?? level; }

// Nivel de consenso. Devuelve level + spread; el `label` es ES por compatibilidad.
export function consensusLevel(indices, decisions, locale) {
  const vals = indices.filter((v) => Number.isFinite(v));
  if (vals.length < 2) return { level: 'insufficient', label: consensusLabel('insufficient', locale), spread: null };
  const spread = Math.round((Math.max(...vals) - Math.min(...vals)) * 10) / 10;
  const dirs = new Set((decisions || []).map(decisionDir));
  const mixedSign = dirs.has('pos') && dirs.has('neg');
  let level;
  if (!mixedSign && dirs.size <= 1 && spread <= 12) level = 'high';
  else if (mixedSign || spread > 25) level = 'divergent';
  else level = 'medium';
  return { level, label: consensusLabel(level, locale), spread };
}

// Agrega los 10 criterios: fortalezas y aspectos a vigilar. `reason` es un código.
export function aggregateCriteria(scoresList) {
  if (!scoresList || scoresList.length === 0) return { strengths: [], watchpoints: [] };
  const rows = CRITERIA.map((c) => {
    const ss = scoresList.map((s) => Number(s?.[c.key]?.score)).filter(Number.isFinite);
    const lows = scoresList.filter((s) => s?.[c.key]?.confidence === 'low').length;
    const mean = ss.length ? ss.reduce((a, b) => a + b, 0) / ss.length : 0;
    const range = ss.length ? Math.max(...ss) - Math.min(...ss) : 0;
    return { key: c.key, label: c.label, mean: Math.round(mean * 10) / 10, range, lows };
  });
  const strengths = rows.filter((r) => r.mean >= 7).sort((a, b) => b.mean - a.mean).slice(0, 4);
  const watchpoints = rows
    .filter((r) => r.range >= 4 || r.lows >= 2)
    .map((r) => ({ ...r, reason: r.range >= 4 ? 'divergencia' : 'baja confianza' }))
    .sort((a, b) => b.range - a.range)
    .slice(0, 4);
  return { strengths, watchpoints };
}

export function suggestedOutcome(mancha, consensus) {
  if (mancha == null) return null;
  // Solo dos salidas: entra o no. Divergencia alta → no la sugiere.
  if (consensus?.level === 'divergent') return 'not_selected';
  return mancha >= 70 ? 'selected' : 'not_selected';
}

// ── Consejo · especialidades y pipeline de candidatos ───────────
export const SPECIALTIES = [
  { key: 'painting',       es: 'Pintura',                 en: 'Painting' },
  { key: 'sculpture',      es: 'Escultura',               en: 'Sculpture' },
  { key: 'photography',    es: 'Fotografía',              en: 'Photography' },
  { key: 'works_on_paper', es: 'Obra sobre papel',        en: 'Works on paper' },
  { key: 'new_media',      es: 'Nuevos medios / digital', en: 'New media / digital' },
  { key: 'installation',   es: 'Instalación',             en: 'Installation' },
  { key: 'criticism',      es: 'Crítica de arte',         en: 'Art criticism' },
  { key: 'museum',         es: 'Curaduría de museo',      en: 'Museum curation' },
  { key: 'market',         es: 'Mercado del arte',        en: 'Art market' },
  { key: 'art_history',    es: 'Historia del arte',       en: 'Art history' },
];
export const SPECIALTY_KEYS = SPECIALTIES.map((s) => s.key);
export function specialtyLabel(key, locale) {
  const s = SPECIALTIES.find((x) => x.key === key);
  return (s && (isEn(locale) ? s.en : s.es)) ?? key;
}
// Compat: etiqueta en español (consola del Founder).
export function specialtyEs(key) { return specialtyLabel(key, 'es'); }

export const CANDIDATE_STAGES = [
  { value: 'new',       label: 'Nuevo',       labelEn: 'New',         cls: 'is-new' },
  { value: 'reviewing', label: 'En revisión', labelEn: 'Reviewing',   cls: 'is-reviewing' },
  { value: 'interview', label: 'Entrevista',  labelEn: 'Interview',   cls: 'is-interview' },
  { value: 'approved',  label: 'Aprobado',    labelEn: 'Approved',    cls: 'is-approved' },
  { value: 'on_hold',   label: 'En pausa',    labelEn: 'On hold',     cls: 'is-hold' },
  { value: 'rejected',  label: 'Rechazado',   labelEn: 'Rejected',    cls: 'is-rejected' },
];
export function stageLabel(value, locale) { return optLabel(CANDIDATE_STAGES.find((s) => s.value === value), locale) ?? value; }
export function stageClass(value) { return CANDIDATE_STAGES.find((s) => s.value === value)?.cls ?? 'is-new'; }

// Valida un objeto de scores completo antes de sellar (mensaje bilingüe).
export function validateScores(scores, locale) {
  for (const c of CRITERIA) {
    const e = scores?.[c.key];
    const s = Number(e?.score);
    const label = optLabel(c, locale);
    if (!Number.isInteger(s) || s < 1 || s > 10) {
      return isEn(locale) ? `Please score “${label}” (1–10).` : `Falta puntuar "${label}" (1–10).`;
    }
    if (!CONFIDENCE.some((x) => x.value === e?.confidence)) {
      return isEn(locale) ? `Please set your confidence on “${label}”.` : `Falta el nivel de confianza en "${label}".`;
    }
  }
  return null;
}
