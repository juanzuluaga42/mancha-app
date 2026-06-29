'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  CRITERIA_KEYS, DECISIONS, BIAS_OPTIONS,
  computeCuratorialIndex, validateScores, confidenceProfile,
} from '@/lib/curatorial';

// Devuelve { user, curator } o redirige si no es curador activo.
async function requireCurator() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: curator } = await supabase
    .from('cur_curators')
    .select('id, role, display_name')
    .eq('user_id', user.id)
    .eq('active', true)
    .maybeSingle();
  if (!curator) redirect('/');
  return { supabase, user, curator };
}

// ── Fase 1 — sellar la evaluación ────────────────────────────────
export async function submitEvaluation(formData) {
  const { supabase, user, curator } = await requireCurator();
  const assignmentId = String(formData.get('assignmentId') || '');

  // Verifica que la asignación es del curador y está en Fase 1.
  const { data: assignment } = await supabase
    .from('cur_assignments')
    .select('id, phase, work_id')
    .eq('id', assignmentId)
    .eq('curator_id', curator.id)
    .maybeSingle();
  if (!assignment) redirect('/curaduria?error=asignacion');
  if (assignment.phase !== 'phase1') redirect(`/curaduria/revisar/${assignmentId}`);

  // Reconstruye los scores desde el formulario.
  const scores = {};
  for (const key of CRITERIA_KEYS) {
    const score = parseInt(formData.get(`score_${key}`), 10);
    const confidence = String(formData.get(`conf_${key}`) || '');
    const note = String(formData.get(`note_${key}`) || '').slice(0, 2000);
    scores[key] = { score, confidence, note };
  }
  const invalid = validateScores(scores);
  if (invalid) redirect(`/curaduria/revisar/${assignmentId}?error=incompleto`);

  const decision = String(formData.get('decision') || '');
  if (!DECISIONS.some((d) => d.value === decision)) {
    redirect(`/curaduria/revisar/${assignmentId}?error=decision`);
  }
  const reflection = String(formData.get('reflection') || '').slice(0, 8000);
  const index = computeCuratorialIndex(scores);

  // Inserta la evaluación con el cliente del usuario (RLS: solo la propia,
  // solo en Fase 1). Queda sellada: el trigger bloquea UPDATE/DELETE.
  const { error: insErr } = await supabase.from('cur_evaluations').insert({
    assignment_id: assignmentId,
    scores,
    reflection,
    decision,
    curatorial_index: index,
  });
  if (insErr) redirect(`/curaduria/revisar/${assignmentId}?error=guardar`);

  // Avanza la fase y registra en bitácora con service role (controlado).
  const admin = createAdminClient();
  await admin.from('cur_assignments').update({ phase: 'phase2' }).eq('id', assignmentId);
  await admin.from('cur_audit').insert({
    actor: user.id,
    action: 'evaluation_sealed',
    entity: 'cur_assignment',
    entity_id: assignmentId,
    meta: { curatorial_index: index, decision, confidence: confidenceProfile(scores) },
  });

  revalidatePath(`/curaduria/revisar/${assignmentId}`);
  redirect(`/curaduria/revisar/${assignmentId}?sealed=1`);
}

// ── Fase 2 — reveal + medición de sesgo ──────────────────────────
export async function submitReveal(formData) {
  const { supabase, user, curator } = await requireCurator();
  const assignmentId = String(formData.get('assignmentId') || '');

  const { data: assignment } = await supabase
    .from('cur_assignments')
    .select('id, phase')
    .eq('id', assignmentId)
    .eq('curator_id', curator.id)
    .maybeSingle();
  if (!assignment) redirect('/curaduria?error=asignacion');
  if (assignment.phase === 'phase1') redirect(`/curaduria/revisar/${assignmentId}`);

  const bias = String(formData.get('bias') || '');
  if (!BIAS_OPTIONS.some((b) => b.value === bias)) {
    redirect(`/curaduria/revisar/${assignmentId}?error=sesgo`);
  }
  const justification = String(formData.get('justification') || '').slice(0, 4000);
  if (bias !== 'none' && justification.trim().length < 10) {
    redirect(`/curaduria/revisar/${assignmentId}?error=justifica`);
  }

  const { error: insErr } = await supabase.from('cur_reveal').insert({
    assignment_id: assignmentId,
    bias,
    justification,
  });
  if (insErr) redirect(`/curaduria/revisar/${assignmentId}?error=guardar`);

  const admin = createAdminClient();
  await admin.from('cur_assignments').update({ phase: 'done' }).eq('id', assignmentId);
  await admin.from('cur_audit').insert({
    actor: user.id,
    action: 'reveal_completed',
    entity: 'cur_assignment',
    entity_id: assignmentId,
    meta: { bias },
  });

  revalidatePath('/curaduria');
  redirect('/curaduria?done=1');
}
