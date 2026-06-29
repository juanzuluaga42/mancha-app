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
