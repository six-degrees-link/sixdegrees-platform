-- Migration 002: profiles and credentials
-- Builds on 001_users_and_auth.sql - reuses set_updated_at() trigger function.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.work_experience (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  company_name text not null,
  company_id uuid,
  job_title text not null,
  employment_type text,
  location text,
  start_date date not null,
  end_date date,
  is_current boolean not null default false,
  description text,
  sort_order integer not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint work_experience_employment_type_check check (
    employment_type is null
    or employment_type in (
      'full_time',
      'part_time',
      'contract',
      'freelance',
      'internship'
    )
  ),
  constraint work_experience_date_order_check check (
    end_date is null
    or end_date >= start_date
  )
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  institution text not null,
  degree text,
  field_of_study text,
  start_date date,
  end_date date,
  description text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint education_date_order_check check (
    end_date is null
    or start_date is null
    or end_date >= start_date
  )
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text,
  usage_count integer not null default 0,
  constraint skills_category_check check (
    category is null
    or category in (
      'technical',
      'soft_skill',
      'industry',
      'language',
      'tool'
    )
  ),
  constraint skills_usage_count_check check (usage_count >= 0)
);

create table public.user_skills (
  user_id uuid not null references public.users (id) on delete cascade,
  skill_id uuid not null references public.skills (id) on delete cascade,
  endorsement_count integer not null default 0,
  primary key (user_id, skill_id),
  constraint user_skills_endorsement_count_check check (endorsement_count >= 0)
);

create table public.skill_endorsements (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null,
  user_id uuid not null,
  endorser_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (skill_id, user_id, endorser_id),
  foreign key (user_id, skill_id) references public.user_skills (user_id, skill_id) on delete cascade,
  constraint skill_endorsements_no_self check (user_id != endorser_id)
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  issuing_organization text not null,
  issue_date date,
  expiry_date date,
  credential_id text,
  credential_url text,
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint certifications_date_order_check check (
    expiry_date is null
    or issue_date is null
    or expiry_date >= issue_date
  )
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index work_experience_user_id_idx on public.work_experience (user_id);
create index work_experience_sort_idx on public.work_experience (user_id, sort_order);
create index education_user_id_idx on public.education (user_id);
create index skills_category_idx on public.skills (category);
create index skills_name_trgm_idx on public.skills using gin (name gin_trgm_ops);
create index user_skills_skill_id_idx on public.user_skills (skill_id);
create index skill_endorsements_user_skill_idx on public.skill_endorsements (user_id, skill_id);
create index skill_endorsements_endorser_idx on public.skill_endorsements (endorser_id);
create index certifications_user_id_idx on public.certifications (user_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers (reuses set_updated_at from migration 001)
-- ---------------------------------------------------------------------------

create trigger work_experience_set_updated_at
  before update on public.work_experience
  for each row
  execute function public.set_updated_at();

create trigger education_set_updated_at
  before update on public.education
  for each row
  execute function public.set_updated_at();

create trigger certifications_set_updated_at
  before update on public.certifications
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.work_experience enable row level security;
alter table public.education enable row level security;
alter table public.skills enable row level security;
alter table public.user_skills enable row level security;
alter table public.skill_endorsements enable row level security;
alter table public.certifications enable row level security;

-- Skills are globally readable (reference data)
create policy skills_select_all
  on public.skills
  for select
  to authenticated
  using (true);

-- Work experience: read public profiles, manage own
create policy work_experience_select
  on public.work_experience
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.users u
      join public.user_settings us on us.user_id = u.id
      where u.id = work_experience.user_id
        and u.is_active = true
        and us.profile_visibility = 'public'
    )
  );

create policy work_experience_insert_own
  on public.work_experience
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy work_experience_update_own
  on public.work_experience
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy work_experience_delete_own
  on public.work_experience
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Education: same pattern
create policy education_select
  on public.education
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.users u
      join public.user_settings us on us.user_id = u.id
      where u.id = education.user_id
        and u.is_active = true
        and us.profile_visibility = 'public'
    )
  );

create policy education_insert_own
  on public.education
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy education_update_own
  on public.education
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy education_delete_own
  on public.education
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- User skills: read public, manage own
create policy user_skills_select
  on public.user_skills
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.users u
      join public.user_settings us on us.user_id = u.id
      where u.id = user_skills.user_id
        and u.is_active = true
        and us.profile_visibility = 'public'
    )
  );

create policy user_skills_insert_own
  on public.user_skills
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy user_skills_delete_own
  on public.user_skills
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Skill endorsements: read public, create for others (not self)
create policy skill_endorsements_select
  on public.skill_endorsements
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or endorser_id = (select auth.uid())
    or exists (
      select 1 from public.users u
      join public.user_settings us on us.user_id = u.id
      where u.id = skill_endorsements.user_id
        and u.is_active = true
        and us.profile_visibility = 'public'
    )
  );

create policy skill_endorsements_insert
  on public.skill_endorsements
  for insert
  to authenticated
  with check (endorser_id = (select auth.uid()));

create policy skill_endorsements_delete_own
  on public.skill_endorsements
  for delete
  to authenticated
  using (endorser_id = (select auth.uid()));

-- Certifications: same pattern as work_experience
create policy certifications_select
  on public.certifications
  for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.users u
      join public.user_settings us on us.user_id = u.id
      where u.id = certifications.user_id
        and u.is_active = true
        and us.profile_visibility = 'public'
    )
  );

create policy certifications_insert_own
  on public.certifications
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

create policy certifications_update_own
  on public.certifications
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy certifications_delete_own
  on public.certifications
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
