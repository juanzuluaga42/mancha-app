-- ════════════════════════════════════════════════════════════════
-- MANCHA · Curatorial Portal — Reclutamiento del consejo
-- Landing /consejo (candidatos) + modelo de aceptación por invitación.
-- Sin rol nuevo: el experto se vincula a cur_curators por email (claim).
-- ════════════════════════════════════════════════════════════════

-- Email en cur_curators: permite invitar antes de que tengan cuenta y
-- vincular (claim) en su primer login por coincidencia de correo.
alter table public.cur_curators add column if not exists email text;
create unique index if not exists cur_curators_email_key
  on public.cur_curators (lower(email)) where email is not null;

-- Candidatos al consejo (expresión de interés desde la landing).
create table if not exists public.cur_candidates (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  focus       text,            -- especialidad: curaduría, crítica, museo, mercado…
  portfolio   text,            -- link a CV / portafolio / perfil
  statement   text,            -- por qué quiere sumarse
  status      text not null default 'new' check (status in ('new','invited','declined','archived')),
  created_at  timestamptz not null default now()
);

alter table public.cur_candidates enable row level security;

-- Cualquiera puede postularse (con email válido); solo el Founder los lee/gestiona.
drop policy if exists cur_cand_apply on public.cur_candidates;
create policy cur_cand_apply on public.cur_candidates for insert to anon, authenticated
  with check (
    char_length(email) between 3 and 200
    and char_length(name) between 1 and 200
    and status = 'new'
  );
drop policy if exists cur_cand_founder on public.cur_candidates;
create policy cur_cand_founder on public.cur_candidates for select to authenticated
  using (public.cur_is_founder());
drop policy if exists cur_cand_founder_upd on public.cur_candidates;
create policy cur_cand_founder_upd on public.cur_candidates for update to authenticated
  using (public.cur_is_founder()) with check (public.cur_is_founder());

-- ════════════════════════════════════════════════════════════════
-- v2 · Pipeline de aplicación por pasos + perfil/onboarding del curador
-- ════════════════════════════════════════════════════════════════
alter table public.cur_candidates drop constraint if exists cur_candidates_status_check;
alter table public.cur_candidates add constraint cur_candidates_status_check
  check (status in ('new','reviewing','interview','approved','rejected','on_hold','invited','declined','archived'));
alter table public.cur_candidates add column if not exists country text;
alter table public.cur_candidates add column if not exists current_title text;
alter table public.cur_candidates add column if not exists organization text;
alter table public.cur_candidates add column if not exists years_experience int;
alter table public.cur_candidates add column if not exists specialties jsonb not null default '[]'::jsonb;
alter table public.cur_candidates add column if not exists links text;
alter table public.cur_candidates add column if not exists availability text;
alter table public.cur_candidates add column if not exists reviewed_at timestamptz;

create table if not exists public.cur_candidate_notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.cur_candidates(id) on delete cascade,
  author uuid, body text not null, created_at timestamptz not null default now()
);
alter table public.cur_candidate_notes enable row level security;
drop policy if exists cur_cand_notes_founder on public.cur_candidate_notes;
create policy cur_cand_notes_founder on public.cur_candidate_notes for all to authenticated
  using (public.cur_is_founder()) with check (public.cur_is_founder());
create index if not exists cur_cand_notes_idx on public.cur_candidate_notes(candidate_id);

alter table public.cur_curators add column if not exists title text;
alter table public.cur_curators add column if not exists bio text;
alter table public.cur_curators add column if not exists specialties jsonb not null default '[]'::jsonb;
alter table public.cur_curators add column if not exists availability text;
alter table public.cur_curators add column if not exists onboarding_completed_at timestamptz;
alter table public.cur_curators add column if not exists ethics_accepted_at timestamptz;
alter table public.cur_curators add column if not exists agreement_accepted_at timestamptz;
alter table public.cur_curators add column if not exists candidate_id uuid references public.cur_candidates(id) on delete set null;

-- Visibilidad pública del curador en /curadores (Founder nunca se muestra).
alter table public.cur_curators add column if not exists public boolean not null default false;
