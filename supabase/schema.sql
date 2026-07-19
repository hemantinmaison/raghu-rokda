create extension if not exists "pgcrypto";

create sequence if not exists public.budget_items_sort_order_seq;
create sequence if not exists public.debt_items_sort_order_seq;
create sequence if not exists public.wishlist_items_sort_order_seq;
create sequence if not exists public.categories_sort_order_seq;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  monthly_salary numeric(12, 2) not null default 0 check (monthly_salary >= 0),
  working_days_per_month smallint not null default 22
    check (working_days_per_month between 1 and 31),
  working_hours_per_day numeric(4, 2) not null default 8
    check (working_hours_per_day > 0 and working_hours_per_day <= 24),
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists working_days_per_month smallint not null default 22
  check (working_days_per_month between 1 and 31);
alter table public.profiles
  add column if not exists working_hours_per_day numeric(4, 2) not null default 8
  check (working_hours_per_day > 0 and working_hours_per_day <= 24);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  emoji text check (emoji is null or char_length(emoji) <= 16),
  color text not null default 'gray'
    check (color in ('gray', 'brown', 'blue', 'green', 'yellow', 'orange', 'red', 'pink', 'purple')),
  sort_order integer not null default nextval('public.categories_sort_order_seq'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create unique index if not exists categories_user_name_idx
  on public.categories (user_id, lower(trim(name)));

create table if not exists public.budget_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  emoji text,
  amount numeric(12, 2) not null check (amount > 0),
  category_id uuid not null,
  details text,
  sort_order integer not null default nextval('public.budget_items_sort_order_seq'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budget_items_category_user_fkey
    foreign key (category_id, user_id)
    references public.categories(id, user_id)
    on delete restrict
);

create table if not exists public.debt_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  emoji text,
  amount numeric(12, 2) not null check (amount > 0),
  interest_rate numeric(7, 3) check (interest_rate is null or interest_rate >= 0),
  tenure_months integer check (tenure_months is null or tenure_months > 0),
  monthly_emi numeric(12, 2) check (monthly_emi is null or monthly_emi > 0),
  details text,
  sort_order integer not null default nextval('public.debt_items_sort_order_seq'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.debt_items
  add column if not exists monthly_emi numeric(12, 2)
  check (monthly_emi is null or monthly_emi > 0);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  emoji text,
  amount numeric(12, 2) not null check (amount > 0),
  details text,
  is_active boolean not null default true,
  sort_order integer not null default nextval('public.wishlist_items_sort_order_seq'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wishlist_items add column if not exists is_active boolean not null default true;

alter table public.budget_items add column if not exists emoji text;
alter table public.debt_items add column if not exists emoji text;
alter table public.wishlist_items add column if not exists emoji text;

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

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
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
alter table public.categories enable row level security;
alter table public.budget_items enable row level security;
alter table public.debt_items enable row level security;
alter table public.wishlist_items enable row level security;

alter table public.profiles force row level security;
alter table public.categories force row level security;
alter table public.budget_items force row level security;
alter table public.debt_items force row level security;
alter table public.wishlist_items force row level security;

drop policy if exists "profiles are private" on public.profiles;
create policy "profiles are private"
on public.profiles for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "categories are private" on public.categories;
create policy "categories are private"
on public.categories for all
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
create index if not exists budget_items_category_id_idx on public.budget_items(category_id);
create index if not exists categories_user_sort_idx on public.categories(user_id, sort_order);
create index if not exists debt_items_user_sort_idx on public.debt_items(user_id, sort_order);
create index if not exists wishlist_items_user_sort_idx on public.wishlist_items(user_id, sort_order);

alter table public.budget_items alter column sort_order set default nextval('public.budget_items_sort_order_seq');
alter table public.debt_items alter column sort_order set default nextval('public.debt_items_sort_order_seq');
alter table public.wishlist_items alter column sort_order set default nextval('public.wishlist_items_sort_order_seq');

select setval('public.budget_items_sort_order_seq', coalesce((select max(sort_order) + 1 from public.budget_items), 1), false);
select setval('public.debt_items_sort_order_seq', coalesce((select max(sort_order) + 1 from public.debt_items), 1), false);
select setval('public.wishlist_items_sort_order_seq', coalesce((select max(sort_order) + 1 from public.wishlist_items), 1), false);

grant usage on sequence public.budget_items_sort_order_seq to authenticated;
grant usage on sequence public.debt_items_sort_order_seq to authenticated;
grant usage on sequence public.wishlist_items_sort_order_seq to authenticated;
grant usage on sequence public.categories_sort_order_seq to authenticated;

create or replace function public.reorder_items(p_kind text, p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_kind = 'budget' then
    update public.budget_items as t
      set sort_order = arr.idx - 1
      from unnest(p_ids) with ordinality as arr(id, idx)
      where t.id = arr.id and t.user_id = v_uid;
  elsif p_kind = 'debt' then
    update public.debt_items as t
      set sort_order = arr.idx - 1
      from unnest(p_ids) with ordinality as arr(id, idx)
      where t.id = arr.id and t.user_id = v_uid;
  elsif p_kind = 'wishlist' then
    update public.wishlist_items as t
      set sort_order = arr.idx - 1
      from unnest(p_ids) with ordinality as arr(id, idx)
      where t.id = arr.id and t.user_id = v_uid;
  else
    raise exception 'invalid kind: %', p_kind;
  end if;
end;
$$;

revoke all on function public.reorder_items(text, uuid[]) from public;
grant execute on function public.reorder_items(text, uuid[]) to authenticated;

create or replace function public.ensure_category(p_name text)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_name text := trim(p_name);
  v_id uuid;
  v_sort_order integer;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if char_length(v_name) not between 1 and 60 then raise exception 'invalid category name'; end if;
  select id into v_id from public.categories
  where user_id = v_uid and lower(name) = lower(v_name);
  if v_id is not null then return v_id; end if;
  select coalesce(max(sort_order), -1) + 1 into v_sort_order
  from public.categories where user_id = v_uid;
  begin
    insert into public.categories (user_id, name, color, sort_order)
    values (v_uid, v_name, 'gray', v_sort_order)
    returning id into v_id;
  exception when unique_violation then
    select id into v_id from public.categories
    where user_id = v_uid and lower(name) = lower(v_name);
  end;
  return v_id;
end;
$$;

create or replace function public.delete_category(p_category_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_name text;
  v_other_id uuid;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  select name into v_name from public.categories
  where id = p_category_id and user_id = v_uid for update;
  if v_name is null then raise exception 'category not found'; end if;
  if lower(v_name) = 'other' then raise exception 'the Other category cannot be deleted'; end if;
  select id into v_other_id from public.categories
  where user_id = v_uid and lower(name) = 'other';
  if v_other_id is null then
    insert into public.categories (user_id, name, emoji, color, sort_order)
    values (v_uid, 'Other', '📦', 'gray', 1000)
    returning id into v_other_id;
  end if;
  update public.budget_items set category_id = v_other_id
  where user_id = v_uid and category_id = p_category_id;
  delete from public.categories where id = p_category_id and user_id = v_uid;
end;
$$;

create or replace function public.reorder_categories(p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  update public.categories c set sort_order = arr.idx - 1
  from unnest(p_ids) with ordinality arr(id, idx)
  where c.id = arr.id and c.user_id = v_uid;
end;
$$;

create or replace function public.initialize_user_finances_for(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_should_seed boolean;
  v_profile_created boolean;
  v_housing uuid;
  v_food uuid;
  v_transport uuid;
  v_bills uuid;
  v_savings uuid;
begin
  select not (
    exists (select 1 from public.profiles where user_id = p_user_id)
    or exists (select 1 from public.budget_items where user_id = p_user_id)
    or exists (select 1 from public.debt_items where user_id = p_user_id)
    or exists (select 1 from public.wishlist_items where user_id = p_user_id)
  ) into v_should_seed;
  insert into public.profiles (user_id, monthly_salary, currency)
  values (p_user_id, 25000, 'INR') on conflict (user_id) do nothing
  returning true into v_profile_created;
  if not v_should_seed or not coalesce(v_profile_created, false) then return false; end if;
  insert into public.categories (user_id, name, emoji, color, sort_order)
  values
    (p_user_id, 'Housing', '🏠', 'brown', 0),
    (p_user_id, 'Food & Groceries', '🛒', 'green', 1),
    (p_user_id, 'Transportation', '🚌', 'blue', 2),
    (p_user_id, 'Bills & Utilities', '🧾', 'yellow', 3),
    (p_user_id, 'Healthcare', '🏥', 'red', 4),
    (p_user_id, 'Entertainment', '🎬', 'purple', 5),
    (p_user_id, 'Shopping', '🛍️', 'pink', 6),
    (p_user_id, 'Savings', '💰', 'green', 7),
    (p_user_id, 'Other', '📦', 'gray', 8)
  on conflict do nothing;
  select id into v_housing from public.categories where user_id = p_user_id and lower(name) = 'housing';
  select id into v_food from public.categories where user_id = p_user_id and lower(name) = 'food & groceries';
  select id into v_transport from public.categories where user_id = p_user_id and lower(name) = 'transportation';
  select id into v_bills from public.categories where user_id = p_user_id and lower(name) = 'bills & utilities';
  select id into v_savings from public.categories where user_id = p_user_id and lower(name) = 'savings';
  insert into public.budget_items (user_id, name, emoji, amount, category_id, details, sort_order)
  values
    (p_user_id, 'Rent', '🏠', 8000, v_housing, 'Landlord’s monthly subscription', 0),
    (p_user_id, 'Groceries & Ghee', '🛒', 3500, v_food, 'Thoda Ghee Khaya karo Ashok', 1),
    (p_user_id, 'E20 Petrol', '⛽', 2000, v_transport, 'Ganne ka Juice', 2),
    (p_user_id, 'Mobile Recharge', '📱', 500, v_bills, 'Data khatam, duniya khatam', 3),
    (p_user_id, 'Electricity & Water', '💡', 1500, v_bills, 'AC chala toh meter bhi daudega', 4),
    (p_user_id, 'Monthly Investment', '💰', 2500, v_savings, 'Monthly SIP investment', 5);
  insert into public.debt_items
    (user_id, name, emoji, amount, interest_rate, tenure_months, monthly_emi, details, sort_order)
  values (p_user_id, 'iPhone', '📱', 134900, null, null, null, null, 0);
  insert into public.wishlist_items (user_id, name, emoji, amount, details, is_active, sort_order)
  values
    (p_user_id, 'Emergency Fund', '🛟', 75000, 'Target of three months’ salary', true, 0),
    (p_user_id, 'Vacation Fund', '🏖️', 30000, 'Future travel goal', true, 1),
    (p_user_id, 'New Laptop', '💻', 80000, 'Personal or work upgrade', true, 2);
  return true;
end;
$$;

create or replace function public.ensure_user_finances()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  return public.initialize_user_finances_for(v_uid);
end;
$$;

create or replace function public.handle_new_auth_user_finances()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.initialize_user_finances_for(new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_initialize_finances on auth.users;
create trigger on_auth_user_created_initialize_finances
after insert on auth.users
for each row execute function public.handle_new_auth_user_finances();

revoke all on function public.initialize_user_finances_for(uuid) from public, anon, authenticated;
revoke all on function public.handle_new_auth_user_finances() from public, anon, authenticated;
revoke all on function public.ensure_category(text) from public;
revoke all on function public.delete_category(uuid) from public;
revoke all on function public.reorder_categories(uuid[]) from public;
revoke all on function public.ensure_user_finances() from public;
grant execute on function public.ensure_category(text) to authenticated;
grant execute on function public.delete_category(uuid) to authenticated;
grant execute on function public.reorder_categories(uuid[]) to authenticated;
grant execute on function public.ensure_user_finances() to authenticated;

create table if not exists public.quote_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, quote_id)
);

create index if not exists quote_likes_quote_idx on public.quote_likes(quote_id);

alter table public.quote_likes enable row level security;

drop policy if exists "users manage their own quote likes" on public.quote_likes;
create policy "users manage their own quote likes"
on public.quote_likes for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.quote_like_counts()
returns table (quote_id text, like_count bigint)
language sql
security definer
set search_path = public
as $$
  select quote_id, count(*)::bigint as like_count
  from public.quote_likes
  group by quote_id;
$$;

revoke all on function public.quote_like_counts() from public;
grant execute on function public.quote_like_counts() to anon, authenticated;

notify pgrst, 'reload schema';
