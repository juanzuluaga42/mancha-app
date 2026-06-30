'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import {
  CRITERIA_KEYS, DECISIONS, BIAS_OPTIONS, OUTCOMES, SPECIALTY_KEYS,
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

// Elimina definitivamente una candidatura ya descartada (rechazada o en pausa).
// Nunca borra una candidatura activa ni una ya aprobada (esa vive como curador).
export async function deleteCandidate(formData) {
  const { user } = await requireFounder();
  const candidateId = String(formData.get('candidateId') || '');
  if (!candidateId) redirect('/curaduria/candidatos?error=1');
  const admin = createAdminClient();
  const { data: cand } = await admin
    .from('cur_candidates').select('id, status').eq('id', candidateId).maybeSingle();
  if (!cand || !['rejected', 'on_hold'].includes(cand.status)) {
    redirect('/curaduria/candidatos?error=delete');
  }
  // Las notas caen por ON DELETE CASCADE.
  await admin.from('cur_candidates').delete().eq('id', candidateId);
  await admin.from('cur_audit').insert({
    actor: user.id, action: 'candidate_deleted', entity: 'cur_candidate', entity_id: candidateId,
    meta: { status: cand.status },
  });
  revalidatePath('/curaduria/candidatos');
  redirect('/curaduria/candidatos?deleted=1');
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

  // Correo de bienvenida (mejor esfuerzo). Bilingüe: el consejo es internacional.
  try {
    const { sendEmail, brandedEmail } = await import('@/lib/email');
    const { escapeHtml } = await import('@/lib/utils');
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://manchagallery.com';
    const safeName = escapeHtml(cand.name || '');
    const safeMail = escapeHtml(cand.email || '');
    await sendEmail({
      to: cand.email,
      subject: 'MANCHA · Bienvenido al Consejo Curatorial Fundador',
      html: brandedEmail({
        heading: 'Bienvenido al Consejo',
        lead: `Es un honor, ${safeName}.`,
        paragraphs: [
          `Te invitamos a integrar el <b>Consejo Curatorial Fundador de MANCHA</b>: el grupo que evalúa la obra a ciegas y construye, con cada juicio, el estándar de la galería.`,
          `Tu incorporación comienza al entrar con este mismo correo (<b>${safeMail}</b>). Si todavía no tienes cuenta, créala con este correo y tu acceso al portal se activará automáticamente.`,
          `<span style="color:#8a8178;">— — —</span>`,
          `<b>Welcome to the Council.</b> You’re invited to join MANCHA’s Founding Curatorial Council — the group that judges work blind and builds the gallery’s standard with every decision. Sign in with this same email (<b>${safeMail}</b>) to begin your onboarding; if you don’t have an account yet, create one with this email and your access activates automatically.`,
        ],
        cta: { label: 'Comenzar incorporación', href: `${site}/curaduria` },
        signoff: 'MANCHA',
        note: 'La obra habla primero. The work speaks first.',
      }),
    });
  } catch {}

  revalidatePath('/curaduria/candidatos');
  redirect('/curaduria/candidatos?approved=1');
}

// ── Consejo — mostrar/ocultar a un curador en la página pública /curadores ──
export async function toggleCuratorPublic(formData) {
  const { user } = await requireFounder();
  const curatorId = String(formData.get('curatorId') || '');
  const next = String(formData.get('next') || '') === 'true';
  const admin = createAdminClient();
  await admin.from('cur_curators').update({ public: next }).eq('id', curatorId).neq('role', 'founder');
  await admin.from('cur_audit').insert({
    actor: user.id, action: 'curator_public', entity: 'cur_curator', entity_id: curatorId, meta: { public: next },
  });
  revalidatePath('/curaduria/candidatos');
  redirect('/curaduria/candidatos');
}

// ── Onboarding del curador (Tanda 2) ─────────────────────────────
export async function completeOnboarding(formData) {
  const { user, curator } = await requireCurator();
  const ethics = String(formData.get('ethics') || '') === 'on' || String(formData.get('ethics') || '') === 'true';
  const agreement = String(formData.get('agreement') || '') === 'on' || String(formData.get('agreement') || '') === 'true';
  if (!ethics || !agreement) redirect('/curaduria/bienvenida?error=acuerdos');

  const title = String(formData.get('title') || '').trim().slice(0, 200);
  const bio = String(formData.get('bio') || '').trim().slice(0, 2000);
  const availability = String(formData.get('availability') || '').trim().slice(0, 300);
  let specialties = [];
  try {
    const parsed = JSON.parse(String(formData.get('specialties') || '[]'));
    if (Array.isArray(parsed)) specialties = parsed.filter((k) => SPECIALTY_KEYS.includes(k)).slice(0, 12);
  } catch {}

  const now = new Date().toISOString();
  const admin = createAdminClient();
  await admin.from('cur_curators').update({
    title: title || null,
    bio: bio || null,
    availability: availability || null,
    specialties,
    ethics_accepted_at: now,
    agreement_accepted_at: now,
    onboarding_completed_at: now,
  }).eq('id', curator.id);
  await admin.from('cur_audit').insert({
    actor: user.id, action: 'onboarding_completed', entity: 'cur_curator', entity_id: curator.id,
  });

  revalidatePath('/curaduria');
  redirect('/curaduria?welcome=1');
}

// ════════════════════════════════════════════════════════════════
// Founder · gestión de revisión: rondas, obras y asignación de curadores
// ════════════════════════════════════════════════════════════════

// Crea una ronda de revisión nueva (abierta).
export async function createRound(formData) {
  const { user } = await requireFounder();
  const name = String(formData.get('name') || '').trim().slice(0, 200) || 'Ronda de revisión';
  const admin = createAdminClient();
  const { data: round } = await admin.from('cur_rounds').insert({ name, status: 'open' }).select('id').single();
  await admin.from('cur_audit').insert({ actor: user.id, action: 'round_created', entity: 'cur_round', entity_id: round?.id });
  revalidatePath('/curaduria/asignar');
  redirect('/curaduria/asignar');
}

// Código incremental "OBRA · A{n}" dentro de una ronda.
async function nextWorkCode(admin, roundId) {
  const { count } = await admin.from('cur_works').select('id', { count: 'exact', head: true }).eq('round_id', roundId);
  return `OBRA · A${(count ?? 0) + 1}`;
}

// Importa una obra a revisión desde una pieza aprobada (separa la identidad).
export async function addWorkFromPiece(formData) {
  const { user } = await requireFounder();
  const pieceId = String(formData.get('pieceId') || '');
  const roundId = String(formData.get('roundId') || '');
  if (!pieceId || !roundId) redirect('/curaduria/asignar?error=1');
  const admin = createAdminClient();

  // Evita duplicar la misma pieza.
  const { data: dup } = await admin.from('cur_works').select('id').eq('piece_id', pieceId).maybeSingle();
  if (dup) redirect('/curaduria/asignar?error=dup');

  const { data: piece } = await admin
    .from('pieces')
    .select('title, year, technique, dimensions, image_url, min_bid, description, artists(display_name, location, bio)')
    .eq('id', pieceId).maybeSingle();
  if (!piece) redirect('/curaduria/asignar?error=1');

  const code = await nextWorkCode(admin, roundId);
  const { data: work } = await admin.from('cur_works').insert({
    round_id: roundId, piece_id: pieceId, code,
    title: piece.title, year: piece.year, technique: piece.technique,
    dimensions: piece.dimensions, statement: piece.description || null, image_url: piece.image_url,
  }).select('id').single();
  await admin.from('cur_work_identity').insert({
    work_id: work.id,
    artist_name: piece.artists?.display_name || null,
    artist_location: piece.artists?.location || null,
    artist_bio: piece.artists?.bio || null,
    price_usd: piece.min_bid ?? null,
  });
  await admin.from('cur_audit').insert({ actor: user.id, action: 'work_added', entity: 'cur_work', entity_id: work.id, meta: { from: 'piece' } });
  revalidatePath('/curaduria/asignar');
  redirect('/curaduria/asignar?added=1');
}

// Crea una obra a revisar manualmente (cara ciega + identidad).
export async function addWorkManual(formData) {
  const { user } = await requireFounder();
  const roundId = String(formData.get('roundId') || '');
  const s = (k, n) => String(formData.get(k) || '').trim().slice(0, n);
  const title = s('title', 200);
  if (!roundId || !title) redirect('/curaduria/asignar?error=1');
  const admin = createAdminClient();
  const code = await nextWorkCode(admin, roundId);
  const yearRaw = parseInt(formData.get('year'), 10);
  const { data: work } = await admin.from('cur_works').insert({
    round_id: roundId, code, title,
    year: Number.isFinite(yearRaw) ? yearRaw : null,
    technique: s('technique', 200) || null, dimensions: s('dimensions', 120) || null,
    materials: s('materials', 300) || null, statement: s('statement', 2000) || null,
    image_url: s('image_url', 600) || null, color_note: s('color_note', 300) || null,
  }).select('id').single();
  await admin.from('cur_work_identity').insert({
    work_id: work.id,
    artist_name: s('artist_name', 200) || null,
    artist_location: s('artist_location', 200) || null,
    artist_bio: s('artist_bio', 2000) || null,
    instagram: s('instagram', 120) || null,
    prestige_notes: s('prestige_notes', 1000) || null,
    price_usd: Number.isFinite(parseFloat(formData.get('price_usd'))) ? parseFloat(formData.get('price_usd')) : null,
  });
  await admin.from('cur_audit').insert({ actor: user.id, action: 'work_added', entity: 'cur_work', entity_id: work.id, meta: { from: 'manual' } });
  revalidatePath('/curaduria/asignar');
  redirect('/curaduria/asignar?added=1');
}

// Pool de curadores asignables: consejo/guest activos (no el Founder).
async function assignablePool(admin, roundId, workId) {
  const { data: curators } = await admin
    .from('cur_curators').select('id').in('role', ['council', 'guest']).eq('active', true);
  const { data: already } = await admin.from('cur_assignments').select('curator_id').eq('work_id', workId);
  const taken = new Set((already ?? []).map((a) => a.curator_id));
  return (curators ?? []).map((c) => c.id).filter((id) => !taken.has(id));
}

// Asigna N curadores al azar a una obra (por defecto 3). Reduce el sesgo.
export async function assignCuratorsRandom(formData) {
  const { user } = await requireFounder();
  const workId = String(formData.get('workId') || '');
  const roundId = String(formData.get('roundId') || '');
  const count = Math.min(5, Math.max(1, parseInt(formData.get('count'), 10) || 3));
  const admin = createAdminClient();
  const pool = await assignablePool(admin, roundId, workId);
  // Mezcla (Fisher–Yates) y toma N.
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const pick = pool.slice(0, count);
  if (pick.length) {
    await admin.from('cur_assignments').insert(pick.map((cid) => ({ round_id: roundId, work_id: workId, curator_id: cid, phase: 'phase1' })));
    await admin.from('cur_audit').insert({ actor: user.id, action: 'curators_assigned', entity: 'cur_work', entity_id: workId, meta: { mode: 'random', n: pick.length } });
  }
  revalidatePath('/curaduria/asignar');
  redirect('/curaduria/asignar');
}

// Asigna / quita un curador puntual.
export async function assignCuratorManual(formData) {
  const { user } = await requireFounder();
  const workId = String(formData.get('workId') || '');
  const roundId = String(formData.get('roundId') || '');
  const curatorId = String(formData.get('curatorId') || '');
  const admin = createAdminClient();
  await admin.from('cur_assignments').insert({ round_id: roundId, work_id: workId, curator_id: curatorId, phase: 'phase1' });
  await admin.from('cur_audit').insert({ actor: user.id, action: 'curators_assigned', entity: 'cur_work', entity_id: workId, meta: { mode: 'manual', curatorId } });
  revalidatePath('/curaduria/asignar');
  redirect('/curaduria/asignar');
}

// Quita una asignación (solo si el curador aún no evaluó — la evaluación es inmutable).
export async function unassignCurator(formData) {
  const { user } = await requireFounder();
  const assignmentId = String(formData.get('assignmentId') || '');
  const admin = createAdminClient();
  const { data: ev } = await admin.from('cur_evaluations').select('id').eq('assignment_id', assignmentId).maybeSingle();
  if (ev) redirect('/curaduria/asignar?error=evaluada');
  await admin.from('cur_assignments').delete().eq('id', assignmentId);
  await admin.from('cur_audit').insert({ actor: user.id, action: 'curator_unassigned', entity: 'cur_assignment', entity_id: assignmentId });
  revalidatePath('/curaduria/asignar');
  redirect('/curaduria/asignar');
}
