-- ============================================================
-- MANCHA — esquema de base de datos para Supabase
-- Pegá todo este archivo en: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================

-- PERFILES: un perfil por cada cuenta (artista o comprador)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('artist','buyer')),
  full_name text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Cada usuario ve su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Cada usuario edita su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Crea el perfil automáticamente apenas alguien se registra
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- TEMPORADAS
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starts_at date not null,
  ends_at date not null,
  is_current boolean not null default false
);

alter table public.seasons enable row level security;

create policy "Cualquiera puede ver temporadas"
  on public.seasons for select using (true);

insert into public.seasons (name, starts_at, ends_at, is_current)
values ('Temporada 01', '2026-06-19', '2026-09-19', true);

-- ARTISTAS (perfil público — profile_id puede ser null para datos de muestra)
create table public.artists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete cascade,
  season_id uuid references public.seasons(id),
  display_name text not null,
  bio text,
  location text,
  medium text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.artists enable row level security;

create policy "Cualquiera puede ver artistas"
  on public.artists for select using (true);

create policy "El artista crea su propio perfil"
  on public.artists for insert
  with check (
    auth.uid() = profile_id
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'artist')
  );

create policy "El artista edita su propio perfil"
  on public.artists for update
  using (auth.uid() = profile_id);

create policy "El founder aprueba o rechaza postulaciones"
  on public.artists for update
  using (auth.jwt() ->> 'email' = 'mancha.gallery@gmail.com')
  with check (auth.jwt() ->> 'email' = 'mancha.gallery@gmail.com');

-- PIEZAS (máximo 3 por artista, forzado acá abajo)
create table public.pieces (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  year int,
  technique text,
  dimensions text,
  description text,
  min_bid numeric not null check (min_bid > 0),
  image_url text,
  sold boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.pieces enable row level security;

create policy "Cualquiera puede ver piezas"
  on public.pieces for select using (true);

create policy "El artista sube hasta 3 piezas propias"
  on public.pieces for insert
  with check (
    exists (
      select 1 from public.artists
      where artists.id = pieces.artist_id and artists.profile_id = auth.uid()
    )
    and (select count(*) from public.pieces p where p.artist_id = pieces.artist_id) < 3
  );

create policy "El artista borra sus propias piezas"
  on public.pieces for delete
  using (
    exists (
      select 1 from public.artists
      where artists.id = pieces.artist_id and artists.profile_id = auth.uid()
    )
  );

-- PUJAS
create table public.bids (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid not null references public.pieces(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id),
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now()
);

alter table public.bids enable row level security;

create policy "Cualquiera puede ver pujas"
  on public.bids for select using (true);

create policy "Un comprador puja con su propia cuenta y supera el mínimo y la puja actual"
  on public.bids for insert
  with check (
    auth.uid() = buyer_id
    and exists (select 1 from public.profiles where id = auth.uid() and role = 'buyer')
    and amount >= (select min_bid from public.pieces where id = piece_id)
    and amount > coalesce((select max(amount) from public.bids b where b.piece_id = bids.piece_id), 0)
  );

-- FAVORITOS (corazones)
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid not null references public.pieces(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(piece_id, buyer_id)
);

alter table public.favorites enable row level security;

create policy "Cualquiera puede ver cuántos favoritos tiene cada pieza"
  on public.favorites for select using (true);

create policy "Cada uno agrega sus propios favoritos"
  on public.favorites for insert
  with check (auth.uid() = buyer_id);

create policy "Cada uno borra sus propios favoritos"
  on public.favorites for delete
  using (auth.uid() = buyer_id);

-- Evita que un artista se autoapruebe editando su propio perfil.
create or replace function public.protect_artist_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if auth.jwt() ->> 'email' is distinct from 'mancha.gallery@gmail.com' then
    new.status := old.status;
  end if;
  return new;
end;
$$;

create trigger protect_artist_status_trigger
before update on public.artists
for each row execute procedure public.protect_artist_status();

-- LISTA DE ESPERA + INTERESADOS EN UNA OBRA PUNTUAL
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  piece_id uuid references public.pieces(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Cualquiera puede registrarse"
  on public.leads for insert with check (true);

create policy "El founder ve todos los registros"
  on public.leads for select
  using (auth.jwt() ->> 'email' = 'mancha.gallery@gmail.com');

-- POSTULACIONES DE ARTISTAS (sin necesidad de cuenta)
create table public.artist_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  instagram text,
  email text not null,
  city text,
  bio text not null,
  portfolio_url text,
  image_url_1 text,
  image_url_2 text,
  image_url_3 text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.artist_applications enable row level security;

create policy "Cualquiera puede postularse"
  on public.artist_applications for insert
  with check (true);

create policy "El founder ve las postulaciones"
  on public.artist_applications for select
  using (auth.jwt() ->> 'email' = 'mancha.gallery@gmail.com');

create policy "El founder actualiza el estado de la postulación"
  on public.artist_applications for update
  using (auth.jwt() ->> 'email' = 'mancha.gallery@gmail.com')
  with check (auth.jwt() ->> 'email' = 'mancha.gallery@gmail.com');

create policy "El founder marca piezas como vendidas"
  on public.pieces for update
  using (auth.jwt() ->> 'email' = 'mancha.gallery@gmail.com')
  with check (auth.jwt() ->> 'email' = 'mancha.gallery@gmail.com');
