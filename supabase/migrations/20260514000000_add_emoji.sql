-- Add emoji column to all planner item tables.
-- Stored as plain text; the app constrains it to a single grapheme on the client.

alter table public.budget_items
  add column if not exists emoji text;

alter table public.debt_items
  add column if not exists emoji text;

alter table public.wishlist_items
  add column if not exists emoji text;

notify pgrst, 'reload schema';
