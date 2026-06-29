'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  CRITERIA_KEYS, DECISIONS, BIAS_OPTIONS, OUTCOMES,
  computeCuratorialIndex, validateScores, confidenceProfile,
} from '@/lib/curatorial';
import { resolveCurator } from '@/lib/curatorAccess';

// Solo el Founder. Devuelve { user } o redirige.
async function requireFounder() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const curator = await resolveCurator(supabase, user);
  if (!curator || curator.role !== 'founder') redirect('/curaduria');
  return { supabase, user };
}

// Devuelve { user, curator } o redirige si no es curador activo.
async function requireCurator() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const curator = await resolveCurator(supabase, user);
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

// ── F3 — abrir/cerrar la ronda (revela las evaluaciones entre curadores) ──
export async function setRoundStatus(formData) {
  const { user } = await requireFounder();
  const roundId = String(formData.get('roundId') || '');
  const status = String(formData.get('status') || '');
  if (status !== 'open' && status !== 'closed') redirect('/curaduria/colegio?error=estado');

  const admin = createAdminClient();
  await admin.from('cur_rounds').update({ status }).eq('id', roundId);
  await admin.from('cur_audit').insert({
    actor: user.id,
    action: status === 'closed' ? 'round_closed' : 'round_reopened',
    entity: 'cur_round',
    entity_id: roundId,
  });
  revalidatePath('/curaduria/colegio');
  redirect('/curaduria/colegio');
}

// ── F3 — el Founder registra la decisión final de una obra ──
export async function recordDecision(formData) {
  const { user } = await requireFounder();
  const workId = String(formData.get('workId') || '');
  const outcome = String(formData.get('outcome') || '');
  const note = String(formData.get('note') || '').slice(0, 4000);
  if (!OUTCOMES.some((o) => o.value === outcome)) redirect('/curaduria/colegio?error=decision');

  const admin = createAdminClient();
  await admin.from('cur_decisions').upsert({
    work_id: workId,
    outcome,
    note,
    decided_by: user.id,
    decided_at: new Date().toISOString(),
  }, { onConflict: 'work_id' });
  await admin.from('cur_audit').insert({
    actor: user.id,
    action: 'final_decision',
    entity: 'cur_work',
    entity_id: workId,
    meta: { outcome },
  });
  revalidatePath('/curaduria/colegio');
  redirect('/curaduria/colegio?decided=1');
}

// ── Consejo · pipeline del Founder ───────────────────────────────
const PIPELINE_STAGES = ['new', 'reviewing', 'interview', 'on_hold', 'rejected'];

// Mueve un candidato por el pipeline (sin aprobar — eso es approveCandidate).
export async function setCandidateStage(formData) {
  const { user } = await requireFounder();
  const candidateId = String(formData.get('candidateId') || '');
  const status = String(formData.get('status') || '');
  if (!PIPELINE_STAGES.includes(status)) redirect('/curaduria/candidatos?error=1');
  const admin = createAdminClient();
  await admin.from('cur_candidates').update({ status, reviewed_at: new Date().toISOString() }).eq('id', candidateId);
  await admin.from('cur_audit').insert({
    actor: user.id, action: 'candidate_stage', entity: 'cur_candidate', entity_id: candidateId, meta: { status },
  });
  revalidatePath('/curaduria/candidatos');
  redirect('/curaduria/candidatos');
}

// Nota privada del Founder sobre un candidato.
export async function addCandidateNote(formData) {
  const { user } = await requireFounder();
  const candidateId = String(formData.get('candidateId') || '');
  const body = String(formData.get('body') || '').trim().slice(0, 4000);
  if (!candidateId || !body) redirect('/curaduria/candidatos');
  const admin = createAdminClient();
  await admin.from('cur_candidate_notes').insert({ candidate_id: candidateId, author: user.id, body });
  revalidatePath('/curaduria/candidatos');
  redirect('/curaduria/candidatos');
}

// Aprobar = alta del curador (onboarding por invitación). Dispara la
// automatización: crea cur_curators con su email (claim al primer login),
// vincula candidato, marca 'approved' y envía la bienvenida.
export async function approveCandidate(formData) {
  const { user } = await requireFounder();
  const candidateId = String(formData.get('candidateId') || '');
  const admin = createAdminClient();

  const { data: cand } = await admin
    .from('cur_candidates')
    .select('id, name, email, current_title, specialties, status')
    .eq('id', candidateId).maybeSingle();
  if (!cand) redirect('/curaduria/candidatos?error=1');

  const { error: insErr } = await admin.from('cur_curators').insert({
    user_id: null,
    email: cand.email,
    display_name: cand.name,
    role: 'council',
    active: true,
    candidate_id: cand.id,
    title: cand.current_title || null,
    specialties: cand.specialties || [],
  });
  await admin.from('cur_candidates')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', candidateId);
  await admin.from('cur_audit').insert({
    actor: user.id, action: 'candidate_approved', entity: 'cur_candidate', entity_id: candidateId,
    meta: { email: cand.email, duplicate: !!insErr },
  });

  // Correo de bienvenida (mejor esfuerzo).
  try {
    const { sendEmail } = await import('@/lib/email');
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://manchagallery.com';
    await sendEmail({
      to: cand.email,
      subject: 'MANCHA · Bienvenido al Consejo Curatorial Fundador',
      html: `<p>Hola ${cand.name},</p>
        <p>Es un honor invitarte a integrar el <strong>Consejo Curatorial Fundador de MANCHA</strong>.</p>
        <p>Entra con este mismo correo (${cand.email}) en <a href="${site}/curaduria">${site}/curaduria</a> para
        comenzar tu incorporación. Si aún no tienes cuenta, créala con este correo: tu acceso se activa automáticamente.</p>
        <p>La obra habla primero.</p><p>— MANCHA</p>`,
    });
  } catch {}

  revalidatePath('/curaduria/candidatos');
  redirect('/curaduria/candidatos?approved=1');
}
