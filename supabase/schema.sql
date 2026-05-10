create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  monthly_salary numeric(12, 2) not null default 0 check (monthly_salary >= 0),
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null check (char_length(trim(category)) > 0),
  details text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.debt_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  amount numeric(12, 2) not null check (amount > 0),
  interest_rate numeric(7, 3) check (interest_rate is null or interest_rate >= 0),
  tenure_months integer check (tenure_months is null or tenure_months > 0),
  details text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  amount numeric(12, 2) not null check (amount > 0),
  details text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists budget_items_set_updated_at on public.budget_items;
create trigger budget_items_set_updated_at
before update on public.budget_items
for each row execute function public.set_updated_at();

drop trigger if exists debt_items_set_updated_at on public.debt_items;
create trigger debt_items_set_updated_at
before update on public.debt_items
for each row execute function public.set_updated_at();

drop trigger if exists wishlist_items_set_updated_at on public.wishlist_items;
create trigger wishlist_items_set_updated_at
before update on public.wishlist_items
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.budget_items enable row level security;
alter table public.debt_items enable row level security;
alter table public.wishlist_items enable row level security;

alter table public.profiles force row level security;
alter table public.budget_items force row level security;
alter table public.debt_items force row level security;
alter table public.wishlist_items force row level security;

drop policy if exists "profiles are private" on public.profiles;
create policy "profiles are private"
on public.profiles for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "budget items are private" on public.budget_items;
create policy "budget items are private"
on public.budget_items for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "debt items are private" on public.debt_items;
create policy "debt items are private"
on public.debt_items for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "wishlist items are private" on public.wishlist_items;
create policy "wishlist items are private"
on public.wishlist_items for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create index if not exists budget_items_user_sort_idx on public.budget_items(user_id, sort_order);
create index if not exists debt_items_user_sort_idx on public.debt_items(user_id, sort_order);
create index if not exists wishlist_items_user_sort_idx on public.wishlist_items(user_id, sort_order);

notify pgrst, 'reload schema';
