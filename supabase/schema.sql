-- Enable pgcrypto for AES-256 encryption (CPF)
create extension if not exists pgcrypto;

-- ============================================================
-- USERS
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text not null,
  cpf         text,           -- AES-256 encrypted via app layer
  plan_id           text not null default 'basic',
  status            text not null default 'active' check (status in ('active', 'inactive', 'cancelled')),
  stripe_customer_id text unique,
  created_at        timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- ============================================================
-- MESSAGES
-- ============================================================
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null,
  content     text not null,  -- rich text HTML from TipTap
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Users can manage own messages"
  on public.messages for all
  using (auth.uid() = user_id);

create index messages_user_id_idx on public.messages(user_id);

-- ============================================================
-- RECIPIENTS
-- ============================================================
create table if not exists public.recipients (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  name          text not null,
  email         text not null,
  relationship  text,
  created_at    timestamptz not null default now()
);

alter table public.recipients enable row level security;

create policy "Users can manage own recipients"
  on public.recipients for all
  using (auth.uid() = user_id);

create index recipients_user_id_idx on public.recipients(user_id);

-- ============================================================
-- TRUSTED CONTACTS
-- ============================================================
create table if not exists public.trusted_contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  phone       text,
  created_at  timestamptz not null default now(),
  unique (user_id)  -- one trusted contact per user
);

alter table public.trusted_contacts enable row level security;

create policy "Users can manage own trusted contact"
  on public.trusted_contacts for all
  using (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists public.subscriptions (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete cascade,
  stripe_subscription_id  text unique,
  plan                    text not null check (plan in ('basic', 'essential', 'complete')),
  status                  text not null check (status in ('active', 'past_due', 'cancelled', 'trialing')),
  current_period_end      timestamptz,
  created_at              timestamptz not null default now(),
  unique (user_id)
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: updated_at automático em messages
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger messages_updated_at
  before update on public.messages
  for each row execute function public.set_updated_at();

-- ============================================================
-- TRIGGER: criar perfil em public.users ao registrar via Auth
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
