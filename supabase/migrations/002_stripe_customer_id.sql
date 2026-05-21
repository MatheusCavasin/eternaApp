-- Add stripe_customer_id to users for linking Supabase users to Stripe customers
alter table public.users add column if not exists stripe_customer_id text unique;
