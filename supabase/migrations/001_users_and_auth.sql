-- Migration 001: public.users and public.user_settings
-- Service role bypass: the Supabase service_role key bypasses RLS by default - no extra SQL.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  handle text unique,
  display_name text,
  avatar_url text,
  cover_image_url text,
  headline text,
  bio text,
  location text,
  website text,
  persona_type text,
  verification_status text not null default 'unverified',
  profile_completeness integer not null default 0,
  role text not null default 'user',
  is_active boolean not null default true,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_vector tsvector,
  constraint users_handle_format_check check (
    handle is null
    or handle ~ '^[a-z0-9_]{3,30}$'
  ),
  constraint users_headline_length_check check (
    headline is null
    or char_length(headline) <= 200
  ),
  constraint users_bio_length_check check (
    bio is null
    or char_length(bio) <= 2000
  ),
  constraint users_persona_type_check check (
    persona_type is null
    or persona_type in (
      'general_user',
      'job_seeker',
      'employer',
      'recruiter',
      'content_moderator',
      'content_creator',
      'company',
      'service_provider',
      'coach',
      'educator',
      'platform_admin'
    )
  ),
  constraint users_verification_status_check check (
    verification_status in (
      'unverified',
      'email_verified',
      'phone_verified',
      'identity_verified'
    )
  ),
  constraint users_profile_completeness_check check (
    profile_completeness between 0 and 100
  ),
  constraint users_role_check check (role in ('user', 'moderator', 'admin'))
);

comment on table public.users is
  'Application profile linked 1:1 to auth.users. Unique on email and handle supplies btree indexes for those columns.';

create table public.user_settings (
  user_id uuid primary key references public.users (id) on delete cascade,
  profile_visibility text not null default 'public',
  email_digest text not null default 'daily',
  show_activity boolean not null default true,
  search_indexable boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_settings_profile_visibility_check check (
    profile_visibility in ('public', 'connections_only', 'private')
  ),
  constraint user_settings_email_digest_check check (
    email_digest in ('immediate', 'daily', 'weekly', 'off')
  )
);

-- ---------------------------------------------------------------------------
-- Indexes (handle and email indexed via unique constraints)
-- ---------------------------------------------------------------------------

create index users_persona_type_idx on public.users (persona_type);
create index users_verification_status_idx on public.users (verification_status);
create index users_created_at_desc_idx on public.users (created_at desc);
create index users_search_vector_idx on public.users using gin (search_vector);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at
  before update on public.users
  for each row
  execute function public.set_updated_at();

create trigger user_settings_set_updated_at
  before update on public.user_settings
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Full-text search trigger
-- ---------------------------------------------------------------------------

create or replace function public.users_search_vector_update()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := to_tsvector(
    'english',
    concat_ws(
      ' ',
      coalesce(new.display_name, ''),
      coalesce(new.handle, ''),
      coalesce(new.headline, ''),
      coalesce(new.bio, '')
    )
  );
  return new;
end;
$$;

create trigger users_search_vector_trigger
  before insert or update of display_name, handle, headline, bio
  on public.users
  for each row
  execute function public.users_search_vector_update();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.user_settings enable row level security;

-- SELECT: own row always, or active profile with public visibility in user_settings
create policy users_select_visible_profiles
  on public.users
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    or (
      is_active = true
      and exists (
        select 1
        from public.user_settings us
        where us.user_id = id
          and us.profile_visibility = 'public'
      )
    )
  );

create policy users_update_own_profile
  on public.users
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy user_settings_select_own
  on public.user_settings
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy user_settings_update_own
  on public.user_settings
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- INSERT: users can insert their own row (fallback if trigger is bypassed)
create policy users_insert_own
  on public.users
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy user_settings_insert_own
  on public.user_settings
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create profile + settings on signup
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
