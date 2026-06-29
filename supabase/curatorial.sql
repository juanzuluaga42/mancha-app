-- ════════════════════════════════════════════════════════════════
-- MANCHA · Curatorial Portal · F1 (Blind Review) + F2 (Scoring/Reveal)
-- Capa aditiva: tablas nuevas con prefijo cur_. No toca el sitio público.
-- Aplicar con: mcp__Supabase__apply_migration (o psql) sobre ycvvpttgmrsukaognwfr.
-- ════════════════════════════════════════════════════════════════

-- ── Curadores del consejo ─────────────────────────────────────────
create table if not exists public.cur_curators (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  role        text not null default 'council' check (role in ('founder','council','guest')),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── Rondas de revisión ────────────────────────────────────────────
create table if not exists public.cur_rounds (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  season_id   uuid references public.seasons(id) on delete set null,
  status      text not null default 'open' check (status in ('open','closed')),
  created_at  timestamptz not null default now()
);

-- ── Obras a revisar (cara CIEGA: sin identidad) ──────────────────
create table if not exists public.cur_works (
  id          uuid primary key default gen_random_uuid(),
  round_id    uuid not null references public.cur_rounds(id) on delete cascade,
  piece_id    uuid references public.pieces(id) on delete set null,
  code        text not null,
  title       text not null,
  year        int,
  technique   text,
  dimensions  text,
  materials   text,
  statement   text,
  image_url   text,
  extra_images jsonb not null default '[]'::jsonb,
  color_note  text,
  created_at  timestamptz not null default now()
);

-- ── Identidad del artista (tabla SEPARADA, bloqueada en Fase 1) ───
create table if not exists public.cur_work_identity (
  work_id        uuid primary key references public.cur_works(id) on delete cascade,
  artist_name    text,
  artist_bio     text,
  artist_location text,
  instagram      text,
  prestige_notes text,
  price_usd      numeric
);

-- ── Asignaciones (3 curadores por obra, aleatorio) ───────────────
create table if not exists public.cur_assignments (
  id          uuid primary key default gen_random_uuid(),
  round_id    uuid not null references public.cur_rounds(id) on delete cascade,
  work_id     uuid not null references public.cur_works(id) on delete cascade,
  curator_id  uuid not null references public.cur_curators(id) on delete cascade,
  phase       text not null default 'phase1' check (phase in ('phase1','phase2','done')),
  created_at  timestamptz not null default now(),
  unique (work_id, curator_id)
);

-- ── Evaluación sellada de Fase 1 (inmutable) ─────────────────────
create table if not exists public.cur_evaluations (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid not null unique references public.cur_assignments(id) on delete cascade,
  scores          jsonb not null,
  reflection      text,
  decision        text not null check (decision in ('recommend','recommend_notes','second_review','not_recommend')),
  curatorial_index numeric not null,
  submitted_at    timestamptz not null default now()
);

-- ── Reveal + medición de sesgo (Fase 2) ──────────────────────────
create table if not exists public.cur_reveal (
  id            uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references public.cur_assignments(id) on delete cascade,
  bias          text not null check (bias in ('none','slight','significant')),
  justification text,
  submitted_at  timestamptz not null default now()
);

-- ── Bitácora append-only ─────────────────────────────────────────
create table if not exists public.cur_audit (
  id          bigint generated always as identity primary key,
  actor       uuid,
  action      text not null,
  entity      text,
  entity_id   uuid,
  meta        jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists cur_works_round_idx        on public.cur_works(round_id);
create index if not exists cur_assignments_curator_idx on public.cur_assignments(curator_id);
create index if not exists cur_assignments_work_idx     on public.cur_assignments(work_id);

-- ════════════════════════════════════════════════════════════════
-- Helpers (SECURITY DEFINER) — identidad del curador / founder
-- ════════════════════════════════════════════════════════════════
create or replace function public.cur_my_curator_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.cur_curators where user_id = auth.uid() and active limit 1;
$$;
revoke execute on function public.cur_my_curator_id() from public;
grant execute on function public.cur_my_curator_id() to authenticated;

create or replace function public.cur_is_founder()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.cur_curators
    where user_id = auth.uid() and active and role = 'founder'
  );
$$;
revoke execute on function public.cur_is_founder() from public;
grant execute on function public.cur_is_founder() to authenticated;

-- ════════════════════════════════════════════════════════════════
-- Inmutabilidad de evaluaciones selladas (bloquea UPDATE/DELETE
-- incluso para service_role — sello a nivel de datos)
-- ════════════════════════════════════════════════════════════════
create or replace function public.cur_block_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'cur_evaluations es inmutable: no se puede modificar ni borrar una evaluación sellada';
end;
$$;
drop trigger if exists cur_eval_no_update on public.cur_evaluations;
create trigger cur_eval_no_update before update or delete on public.cur_evaluations
  for each row execute function public.cur_block_mutation();

-- ════════════════════════════════════════════════════════════════
-- RLS
-- ════════════════════════════════════════════════════════════════
alter table public.cur_curators       enable row level security;
alter table public.cur_rounds          enable row level security;
alter table public.cur_works           enable row level security;
alter table public.cur_work_identity   enable row level security;
alter table public.cur_assignments     enable row level security;
alter table public.cur_evaluations     enable row level security;
alter table public.cur_reveal          enable row level security;
alter table public.cur_audit           enable row level security;

drop policy if exists cur_curators_self on public.cur_curators;
create policy cur_curators_self on public.cur_curators for select to authenticated
  using (user_id = auth.uid() or public.cur_is_founder());

drop policy if exists cur_rounds_read on public.cur_rounds;
create policy cur_rounds_read on public.cur_rounds for select to authenticated
  using (public.cur_my_curator_id() is not null);

drop policy if exists cur_works_assigned on public.cur_works;
create policy cur_works_assigned on public.cur_works for select to authenticated
  using (
    public.cur_is_founder()
    or exists (
      select 1 from public.cur_assignments a
      where a.work_id = cur_works.id and a.curator_id = public.cur_my_curator_id()
    )
  );

-- cur_work_identity: EL CORAZÓN DE LA CEGUERA.
-- Un curador SOLO lee identidad si su asignación superó la Fase 1.
drop policy if exists cur_identity_blind on public.cur_work_identity;
create policy cur_identity_blind on public.cur_work_identity for select to authenticated
  using (
    public.cur_is_founder()
    or exists (
      select 1 from public.cur_assignments a
      where a.work_id = cur_work_identity.work_id
        and a.curator_id = public.cur_my_curator_id()
        and a.phase <> 'phase1'
    )
  );

drop policy if exists cur_assignments_own on public.cur_assignments;
create policy cur_assignments_own on public.cur_assignments for select to authenticated
  using (curator_id = public.cur_my_curator_id() or public.cur_is_founder());

drop policy if exists cur_eval_insert on public.cur_evaluations;
create policy cur_eval_insert on public.cur_evaluations for insert to authenticated
  with check (
    exists (
      select 1 from public.cur_assignments a
      where a.id = cur_evaluations.assignment_id
        and a.curator_id = public.cur_my_curator_id()
        and a.phase = 'phase1'
    )
  );
drop policy if exists cur_eval_read on public.cur_evaluations;
create policy cur_eval_read on public.cur_evaluations for select to authenticated
  using (
    public.cur_is_founder()
    or exists (
      select 1 from public.cur_assignments a
      where a.id = cur_evaluations.assignment_id
        and a.curator_id = public.cur_my_curator_id()
    )
    or exists (
      select 1 from public.cur_assignments a
      join public.cur_rounds r on r.id = a.round_id
      where a.id = cur_evaluations.assignment_id and r.status = 'closed'
    )
  );

drop policy if exists cur_reveal_insert on public.cur_reveal;
create policy cur_reveal_insert on public.cur_reveal for insert to authenticated
  with check (
    exists (
      select 1 from public.cur_assignments a
      where a.id = cur_reveal.assignment_id
        and a.curator_id = public.cur_my_curator_id()
        and a.phase <> 'phase1'
    )
  );
drop policy if exists cur_reveal_read on public.cur_reveal;
create policy cur_reveal_read on public.cur_reveal for select to authenticated
  using (
    public.cur_is_founder()
    or exists (
      select 1 from public.cur_assignments a
      where a.id = cur_reveal.assignment_id
        and a.curator_id = public.cur_my_curator_id()
    )
  );

drop policy if exists cur_audit_founder on public.cur_audit;
create policy cur_audit_founder on public.cur_audit for select to authenticated
  using (public.cur_is_founder());
