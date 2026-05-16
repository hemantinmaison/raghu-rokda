-- Likes for the public quotes page.
-- Each user can like a quote once; total counts are public via an RPC.

create table if not exists public.quote_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  quote_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, quote_id)
);

create index if not exists quote_likes_quote_idx on public.quote_likes(quote_id);

-- RLS enabled (not forced): a user reads/writes only their own likes, while the
-- security-definer count function below is owned by the table owner so it can
-- still aggregate every row.
alter table public.quote_likes enable row level security;

drop policy if exists "users manage their own quote likes" on public.quote_likes;
create policy "users manage their own quote likes"
on public.quote_likes for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Public aggregate like counts. Runs as the function owner so it can count
-- across all users without exposing individual rows.
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
