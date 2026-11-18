-- Pulso Fit · Esquema inicial para Supabase (PostgreSQL)
-- Ejecuta este archivo en Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(username) between 2 and 32),
  avatar_url text,
  gender text not null check (gender in ('hombre','mujer','prefiero_no_decirlo')),
  routine_preference text check (routine_preference in ('fuerza','tonificacion','equilibrada')),
  weight_kg numeric(5,2) not null check (weight_kg between 30 and 300),
  height_cm integer not null check (height_cm between 120 and 230),
  birth_date date not null,
  goal text not null check (goal in ('bajar_peso','mantener','subir_peso','ganar_masa_muscular')),
  training_place text not null check (training_place in ('gimnasio','casa','aire_libre')),
  terms_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint adults_only check (birth_date <= (current_date - interval '18 years')::date),
  constraint routine_preference_for_unspecified_gender check ((gender = 'prefiero_no_decirlo' and routine_preference is not null) or (gender <> 'prefiero_no_decirlo'))
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  source_id text unique,
  is_custom boolean not null default false,
  name text not null,
  name_es text,
  category text,
  body_part text,
  equipment text,
  target text,
  secondary_muscles text[] not null default '{}',
  instructions text[] not null default '{}',
  media_id text,
  media_url text,
  level text not null default 'principiante',
  place text[] not null default '{gimnasio}',
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.exercises add column if not exists name_es text;
alter table public.exercises alter column source_id drop not null;
alter table public.profiles add column if not exists terms_accepted_at timestamptz not null default now();
alter table public.profiles add column if not exists routine_preference text;
update public.profiles set routine_preference = 'equilibrada' where gender = 'prefiero_no_decirlo' and routine_preference is null;
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid='public.profiles'::regclass and conname='routine_preference_for_unspecified_gender') then
    alter table public.profiles add constraint routine_preference_for_unspecified_gender
      check ((gender = 'prefiero_no_decirlo' and routine_preference is not null) or (gender <> 'prefiero_no_decirlo'));
  end if;
end $$;
alter table public.exercises add column if not exists is_custom boolean not null default false;
create index if not exists exercises_target_idx on public.exercises(target);
create index if not exists exercises_featured_idx on public.exercises(is_featured) where is_featured = true;
create index if not exists exercises_place_idx on public.exercises using gin(place);

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  gender text not null check (gender in ('hombre','mujer','prefiero_no_decirlo')),
  routine_preference text check (routine_preference is null or routine_preference in ('fuerza','tonificacion','equilibrada')),
  goal text not null check (goal in ('bajar_peso','mantener','subir_peso','ganar_masa_muscular')),
  place text not null check (place in ('gimnasio','casa','aire_libre')),
  title text not null,
  created_at timestamptz not null default now(),
  unique nulls not distinct (gender, routine_preference, goal, place)
);

-- Migración para instalaciones anteriores a la preferencia de rutina.
alter table public.routines add column if not exists routine_preference text;
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid='public.routines'::regclass and conname='routines_routine_preference_check') then
    alter table public.routines add constraint routines_routine_preference_check
      check (routine_preference is null or routine_preference in ('fuerza','tonificacion','equilibrada'));
  end if;
end $$;

-- Compatibilidad con instalaciones previas que tenían UNIQUE(gender, goal, place).
-- Esa regla impedía guardar las tres preferencias de rutina del perfil sin género declarado.
alter table public.routines drop constraint if exists routines_gender_goal_place_key;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.routines'::regclass
      and conname = 'routines_gender_routine_preference_goal_place_key'
  ) then
    alter table public.routines
      add constraint routines_gender_routine_preference_goal_place_key
      unique nulls not distinct (gender, routine_preference, goal, place);
  end if;
end $$;
create table if not exists public.routine_days (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  weekday text not null check (weekday in ('lunes','martes','miercoles','jueves','viernes')),
  focus text not null,
  warmup jsonb not null default '[]'::jsonb,
  cooldown jsonb not null default '[]'::jsonb,
  unique(routine_id, weekday)
);
alter table public.routine_days add column if not exists warmup jsonb not null default '[]'::jsonb;
alter table public.routine_days add column if not exists cooldown jsonb not null default '[]'::jsonb;

create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_day_id uuid not null references public.routine_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete restrict,
  sets integer not null default 3 check (sets between 1 and 8),
  reps text not null default '10–12',
  rest_seconds integer not null default 60 check (rest_seconds between 15 and 300),
  order_index integer not null default 1,
  unique(routine_day_id, order_index)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text,
  text text not null default '',
  created_at timestamptz not null default now(),
  constraint post_has_content check (char_length(trim(text)) > 0 or image_url is not null),
  constraint post_text_max_length check (char_length(text) <= 1000)
);
alter table public.posts drop constraint if exists post_text_max_length;
alter table public.posts add constraint post_text_max_length check (char_length(text) <= 1000);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(trim(text)) between 1 and 1000),
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.comments add column if not exists is_hidden boolean not null default false;

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id,user_id)
);
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null default 'Contenido reportado por la comunidad',
  created_at timestamptz not null default now(),
  unique(post_id,reporter_id)
);
alter table public.reports add column if not exists status text not null default 'pending' check (status in ('pending','reviewed'));
alter table public.reports add column if not exists reviewed_at timestamptz;
alter table public.reports add column if not exists reviewed_by uuid references auth.users(id) on delete set null;
create index if not exists reports_status_created_idx on public.reports(status, created_at desc);

-- La tabla de moderadores se administra desde SQL Editor. No es consultable por usuarios normales.
create table if not exists public.moderators (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.moderators enable row level security;
revoke all on public.moderators from anon, public, authenticated;

create or replace function public.is_pulso_moderator()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (select 1 from public.moderators where user_id = auth.uid());
$$;
revoke all on function public.is_pulso_moderator() from public, anon;
grant execute on function public.is_pulso_moderator() to authenticated;

-- Vista pública limitada: nunca expone peso, estatura, fecha de nacimiento u objetivos.
create or replace view public.profiles_public as
select id, username, avatar_url from public.profiles;
grant select on public.profiles_public to authenticated;

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.routines enable row level security;
alter table public.routine_days enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.reports enable row level security;

-- Evita acceso por roles públicos/anon incluso si el proyecto tiene privilegios globales por defecto.
revoke all on public.profiles, public.exercises, public.routines, public.routine_days, public.routine_exercises, public.posts, public.comments, public.likes, public.reports from anon, public;
revoke all on public.profiles_public from anon, public;

-- Privilegios SQL complementan RLS: sin GRANT la API no puede consultar las tablas.
grant select, insert, update on public.profiles to authenticated;
grant select on public.exercises, public.routines, public.routine_days, public.routine_exercises to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, delete on public.comments to authenticated;
revoke update on public.comments from authenticated;
grant update (is_hidden) on public.comments to authenticated;
grant select, insert, delete on public.likes to authenticated;
grant select, insert, update on public.reports to authenticated;

-- El perfil completo es privado para su titular.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Catálogo y rutinas: lectura para usuarios autenticados; cambios solo por administración/importación.
drop policy if exists "exercises_read_authenticated" on public.exercises;
create policy "exercises_read_authenticated" on public.exercises for select to authenticated using (true);
drop policy if exists "routines_read_authenticated" on public.routines;
create policy "routines_read_authenticated" on public.routines for select to authenticated using (true);
drop policy if exists "routine_days_read_authenticated" on public.routine_days;
create policy "routine_days_read_authenticated" on public.routine_days for select to authenticated using (true);
drop policy if exists "routine_exercises_read_authenticated" on public.routine_exercises;
create policy "routine_exercises_read_authenticated" on public.routine_exercises for select to authenticated using (true);

-- Muro: todos los registrados pueden leer; cada autor controla sus publicaciones.
drop policy if exists "posts_read_authenticated" on public.posts;
create policy "posts_read_authenticated" on public.posts for select to authenticated using (true);
drop policy if exists "posts_insert_own" on public.posts;
create policy "posts_insert_own" on public.posts for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "posts_update_own" on public.posts;
create policy "posts_update_own" on public.posts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "posts_delete_own" on public.posts;
create policy "posts_delete_own" on public.posts for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own" on public.comments for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own" on public.comments for delete to authenticated using (auth.uid() = user_id);

-- Moderación: solo moderadores pueden eliminar publicaciones reportadas y ocultar/eliminar comentarios.
drop policy if exists "posts_delete_moderators" on public.posts;
create policy "posts_delete_moderators" on public.posts for delete to authenticated using (
  public.is_pulso_moderator() and exists (select 1 from public.reports r where r.post_id = posts.id)
);
drop policy if exists "comments_read_authenticated" on public.comments;
create policy "comments_read_authenticated" on public.comments for select to authenticated using (not is_hidden or public.is_pulso_moderator() or auth.uid() = user_id);
drop policy if exists "comments_update_moderators" on public.comments;
create policy "comments_update_moderators" on public.comments for update to authenticated using (public.is_pulso_moderator()) with check (public.is_pulso_moderator());
drop policy if exists "comments_delete_moderators" on public.comments;
create policy "comments_delete_moderators" on public.comments for delete to authenticated using (public.is_pulso_moderator());

drop policy if exists "likes_read_authenticated" on public.likes;
create policy "likes_read_authenticated" on public.likes for select to authenticated using (true);
drop policy if exists "likes_insert_own" on public.likes;
create policy "likes_insert_own" on public.likes for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "likes_delete_own" on public.likes;
create policy "likes_delete_own" on public.likes for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports for insert to authenticated with check (auth.uid() = reporter_id);
drop policy if exists "reports_read_own" on public.reports;
create policy "reports_read_own" on public.reports for select to authenticated using (auth.uid() = reporter_id);
drop policy if exists "reports_read_moderators" on public.reports;
create policy "reports_read_moderators" on public.reports for select to authenticated using (public.is_pulso_moderator());
drop policy if exists "reports_update_moderators" on public.reports;
create policy "reports_update_moderators" on public.reports for update to authenticated using (public.is_pulso_moderator()) with check (public.is_pulso_moderator());

-- Buckets privados: las imágenes se sirven mediante URL firmadas a sesiones autenticadas; solo el dueño puede cargar, reemplazar o borrar en su carpeta.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars','avatars',false,5242880,array['image/jpeg','image/png','image/webp']),
       ('post-images','post-images',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "public_read_fitness_images" on storage.objects;
drop policy if exists "authenticated_read_fitness_images" on storage.objects;
create policy "authenticated_read_fitness_images" on storage.objects for select to authenticated using (bucket_id in ('avatars','post-images'));
drop policy if exists "users_upload_own_fitness_images" on storage.objects;
create policy "users_upload_own_fitness_images" on storage.objects for insert to authenticated with check (bucket_id in ('avatars','post-images') and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "users_update_own_fitness_images" on storage.objects;
create policy "users_update_own_fitness_images" on storage.objects for update to authenticated using (bucket_id in ('avatars','post-images') and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id in ('avatars','post-images') and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "users_delete_own_fitness_images" on storage.objects;
create policy "users_delete_own_fitness_images" on storage.objects for delete to authenticated using (bucket_id in ('avatars','post-images') and (storage.foldername(name))[1] = auth.uid()::text);

notify pgrst, 'reload schema';
-- Un moderador solo puede borrar archivos que pertenezcan a una publicación reportada.
create or replace function public.is_reported_post_image(object_name text)
returns boolean
language sql stable security definer
set search_path = pg_catalog, public
as $$
  select public.is_pulso_moderator() and exists (
    select 1 from public.posts p join public.reports r on r.post_id = p.id
    where p.image_url = object_name
  );
$$;
revoke all on function public.is_reported_post_image(text) from public, anon;
grant execute on function public.is_reported_post_image(text) to authenticated;
drop policy if exists "moderators_delete_reported_images" on storage.objects;
create policy "moderators_delete_reported_images" on storage.objects for delete to authenticated
using (bucket_id = 'post-images' and public.is_reported_post_image(name));

-- Eliminación integral de cuenta. El cliente elimina primero los objetos de Storage mediante
-- la API autenticada (nunca se borran filas de storage.objects directamente). Esta función
-- elimina auth.users y las FK en cascada limpian perfiles, publicaciones, comentarios, likes y reportes.
create or replace function public.delete_my_pulso_account()
returns boolean
language plpgsql security definer
set search_path = pg_catalog, public, auth, storage
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Debes iniciar sesión para eliminar tu cuenta.'; end if;
  delete from auth.users where id = v_uid;
  return true;
end;
$$;
revoke all on function public.delete_my_pulso_account() from public, anon;
grant execute on function public.delete_my_pulso_account() to authenticated;

