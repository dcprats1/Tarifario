-- Supabase-ready schema for Tarifario
-- Apply after enabling extensions in Supabase project.

create extension if not exists "pgcrypto";

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('admin', 'operador', 'viewer')),
  description text not null,
  created_at timestamptz not null default now()
);

insert into public.roles (code, description)
values
  ('admin', 'Administrador de plataforma'),
  ('operador', 'Operador de tarifarios y procesos'),
  ('viewer', 'Consulta de solo lectura')
on conflict (code) do nothing;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role_id uuid not null references public.roles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.profiles(id),
  name text not null,
  source_file text,
  parser_confidence numeric(5,2) not null default 0,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tariff_rules (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  max_weight_kg numeric(10,2) not null,
  volumetric_divisor numeric(10,2) not null,
  fuel_surcharge_pct numeric(6,3) not null,
  insurance_pct numeric(6,3) not null,
  overweight_penalty numeric(10,2) not null,
  zones jsonb not null default '[]'::jsonb,
  package_types jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.weight_tiers (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  max_weight_kg numeric(10,2) not null,
  base_price numeric(10,2) not null,
  zone text,
  created_at timestamptz not null default now()
);

create table if not exists public.upload_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.profiles(id),
  provider_id uuid references public.providers(id) on delete set null,
  file_name text not null,
  file_path text,
  mime_type text,
  size_bytes bigint,
  parser_confidence numeric(5,2),
  parser_strategy text not null default 'deterministic',
  llm_provider text,
  status text not null default 'completed',
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.export_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.profiles(id),
  provider_id uuid not null references public.providers(id) on delete cascade,
  format text not null check (format in ('csv', 'xlsx', 'json')),
  file_path text,
  status text not null default 'completed',
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role_id on public.profiles(role_id);
create index if not exists idx_providers_tenant_id on public.providers(tenant_id);
create index if not exists idx_weight_tiers_provider_id on public.weight_tiers(provider_id);
create index if not exists idx_upload_jobs_tenant_created on public.upload_jobs(tenant_id, created_at desc);
create index if not exists idx_export_jobs_provider_created on public.export_jobs(provider_id, created_at desc);

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.tariff_rules enable row level security;
alter table public.weight_tiers enable row level security;
alter table public.upload_jobs enable row level security;
alter table public.export_jobs enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    join public.roles r on r.id = p.role_id
    where p.id = auth.uid() and r.code = 'admin'
  );
$$;

create policy "profiles self read" on public.profiles
for select using (id = auth.uid() or public.is_admin());

create policy "profiles self update" on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "providers tenant read" on public.providers
for select using (tenant_id = auth.uid() or public.is_admin());

create policy "providers operator manage" on public.providers
for all using (tenant_id = auth.uid() or public.is_admin())
with check (tenant_id = auth.uid() or public.is_admin());

create policy "rules tenant read" on public.tariff_rules
for select using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id and (p.tenant_id = auth.uid() or public.is_admin())
  )
);

create policy "rules operator manage" on public.tariff_rules
for all using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id and (p.tenant_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.providers p
    where p.id = provider_id and (p.tenant_id = auth.uid() or public.is_admin())
  )
);

-- Repeat same strategy for weight_tiers / upload_jobs / export_jobs
create policy "weight tiers tenant read" on public.weight_tiers
for select using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id and (p.tenant_id = auth.uid() or public.is_admin())
  )
);

create policy "weight tiers operator manage" on public.weight_tiers
for all using (
  exists (
    select 1 from public.providers p
    where p.id = provider_id and (p.tenant_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.providers p
    where p.id = provider_id and (p.tenant_id = auth.uid() or public.is_admin())
  )
);

create policy "upload jobs tenant read" on public.upload_jobs
for select using (tenant_id = auth.uid() or public.is_admin());

create policy "export jobs tenant read" on public.export_jobs
for select using (tenant_id = auth.uid() or public.is_admin());
