-- Reorder RPC used by drag-and-drop. Re-apply if the function is missing
-- from the database (error: "Could not find the function public.reorder_items").

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

notify pgrst, 'reload schema';
