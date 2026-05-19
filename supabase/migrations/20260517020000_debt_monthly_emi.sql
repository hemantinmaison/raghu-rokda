-- A debt's monthly EMI. Used only to forecast that debt's payoff date
-- (balance ÷ EMI); it is never added to any outflow total.

alter table public.debt_items
  add column if not exists monthly_emi numeric(12, 2)
  check (monthly_emi is null or monthly_emi > 0);

notify pgrst, 'reload schema';
