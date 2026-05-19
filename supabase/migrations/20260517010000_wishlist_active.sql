-- Wishlist items can be turned off. An inactive wish is kept but excluded
-- from the savings payoff forecast. New wishes default to active.

alter table public.wishlist_items
  add column if not exists is_active boolean not null default true;

notify pgrst, 'reload schema';
