-- death_checks: log de cada verificação de CPF feita pelo job semanal
create table if not exists public.death_checks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  checked_at   timestamptz not null default now(),
  api_response jsonb,
  status       text not null check (status in ('alive', 'deceased', 'error'))
);

alter table public.death_checks enable row level security;

-- Apenas o backend (service role) grava; admin lê via supabase_admin
create policy "Service role manages death_checks"
  on public.death_checks for all
  using (false);

create index death_checks_user_id_idx on public.death_checks(user_id);
create index death_checks_status_idx  on public.death_checks(status);

-- delivery_events: controla o fluxo de confirmação de óbito e envio de mensagens
create table if not exists public.delivery_events (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id) on delete cascade,
  triggered_at          timestamptz not null default now(),
  confirmation_sent_at  timestamptz,
  confirmation_token    text unique,
  confirmed_at          timestamptz,
  messages_sent_at      timestamptz,
  status                text not null default 'pending'
                          check (status in ('pending', 'confirmed', 'denied', 'sent'))
);

alter table public.delivery_events enable row level security;

create policy "Service role manages delivery_events"
  on public.delivery_events for all
  using (false);

create index delivery_events_user_id_idx on public.delivery_events(user_id);
create index delivery_events_token_idx   on public.delivery_events(confirmation_token);
create index delivery_events_status_idx  on public.delivery_events(status);
